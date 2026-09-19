import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';

const root = resolve(new URL('..', import.meta.url).pathname);
const dashboardRoot = join(root, 'test-dashboard');
const testsRoot = join(root, 'tests');
const runs = new Map();
const port = Number(process.env.PORT || 4173);
const reportPort = Number(process.env.REPORT_PORT || 9323);
let reportProcess;

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function isSafeTestPath(file) {
  const absolutePath = resolve(root, file);
  return absolutePath.startsWith(`${testsRoot}${sep}`) && extname(absolutePath) === '.ts';
}

async function collectTests(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const tests = [];

  for (const entry of entries) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      tests.push(...await collectTests(filePath));
      continue;
    }
    if (!entry.name.endsWith('.spec.ts')) continue;

    const source = await readFile(filePath, 'utf8');
    const names = [...source.matchAll(/test\(\s*['"`]([^'"`]+)['"`]/g)].map((match) => match[1]);
    tests.push({
      file: relative(root, filePath).split(sep).join('/'),
      names,
    });
  }

  return tests.sort((a, b) => a.file.localeCompare(b.file));
}

function runTest(file, project, headed) {
  const id = randomUUID();
  const args = ['playwright', 'test', file, '--reporter=line'];
  if (project !== 'all') args.push('--project', project);
  if (headed) args.push('--headed');

  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(command, args, { cwd: root, env: process.env });
  const run = {
    id,
    file,
    project,
    headed,
    status: 'running',
    output: '',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    exitCode: null,
  };
  runs.set(id, run);

  const append = (chunk) => {
    run.output = `${run.output}${chunk.toString()}`.slice(-12000);
  };
  child.stdout.on('data', append);
  child.stderr.on('data', append);
  child.on('close', (exitCode) => {
    run.exitCode = exitCode;
    run.status = exitCode === 0 ? 'passed' : 'failed';
    run.finishedAt = new Date().toISOString();
  });
  child.on('error', (error) => {
    append(`\n${error.message}\n`);
    run.exitCode = 1;
    run.status = 'failed';
    run.finishedAt = new Date().toISOString();
  });

  return run;
}

async function serveStatic(request, response) {
  const requestedPath = request.url === '/' ? '/index.html' : request.url;
  const filePath = resolve(dashboardRoot, `.${requestedPath.split('?')[0]}`);
  if (!filePath.startsWith(dashboardRoot)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const content = await readFile(filePath);
    const contentTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
    response.writeHead(200, { 'Content-Type': `${contentTypes[extname(filePath)] || 'application/octet-stream'}; charset=utf-8` });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);

  if (url.pathname === '/api/tests' && request.method === 'GET') {
    sendJson(response, 200, { tests: await collectTests(testsRoot) });
    return;
  }

  if (url.pathname === '/api/run' && request.method === 'POST') {
    let body = '';
    for await (const chunk of request) body += chunk;
    try {
      const { file, project = 'all', headed = false } = JSON.parse(body);
      if (!isSafeTestPath(file)) {
        sendJson(response, 400, { error: 'Choose a test inside the tests directory.' });
        return;
      }
      const run = runTest(file, project, headed);
      sendJson(response, 201, run);
    } catch {
      sendJson(response, 400, { error: 'Invalid run request.' });
    }
    return;
  }

  if (url.pathname.startsWith('/api/runs/') && request.method === 'GET') {
    const run = runs.get(url.pathname.split('/').pop());
    if (!run) {
      sendJson(response, 404, { error: 'Run not found.' });
      return;
    }
    sendJson(response, 200, run);
    return;
  }

  if (url.pathname === '/api/report' && request.method === 'POST') {
    const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    if (!reportProcess || reportProcess.exitCode !== null) {
      reportProcess = spawn(command, [
        'playwright',
        'show-report',
        'playwright-report',
        '--host',
        '127.0.0.1',
        '--port',
        String(reportPort),
      ], { cwd: root, env: process.env, stdio: 'ignore' });
      reportProcess.on('close', () => { reportProcess = undefined; });
    }
    sendJson(response, 202, { url: `http://localhost:${reportPort}`, message: 'Opening the latest Playwright report.' });
    return;
  }

  await serveStatic(request, response);
});

server.listen(port, () => {
  console.log(`Playwright dashboard running at http://localhost:${port}`);
});
