const state = { tests: [], selectedFile: null, runId: null, poller: null };
const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
}

function formatDateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function renderTests() {
  const query = $('#search-tests').value.trim().toLowerCase();
  const visible = state.tests.filter((test) => `${test.file} ${test.names.join(' ')}`.toLowerCase().includes(query));
  $('#test-list').innerHTML = visible.length ? visible.map((test) => `
    <button class="test-item ${test.file === state.selectedFile ? 'selected' : ''}" data-file="${escapeHtml(test.file)}" type="button">
      ${test.names.map((name) => `<span class="test-name">${escapeHtml(name)}</span>`).join('')}
      <span class="test-file">${escapeHtml(test.file.replace('tests/', ''))}</span>
    </button>
  `).join('') : '<p class="empty">No matching specs.</p>';
  document.querySelectorAll('.test-item').forEach((item) => item.addEventListener('click', () => selectTest(item.dataset.file)));
}

function selectTest(file) {
  state.selectedFile = file;
  $('#selected-label').textContent = file ? '1 selected' : 'None selected';
  $('#run-button').disabled = !file;
  $('#output').innerHTML = '<span class="muted-output">Ready to run this spec.</span>';
  $('#run-meta').textContent = file || 'Output will appear here';
  renderTests();
}

function updateRun(run) {
  const labels = { running: 'Running', passed: 'Passed', failed: 'Failed' };
  $('#run-status').textContent = labels[run.status] || run.status;
  $('#run-status').className = `run-status ${run.status}`;
  $('#output').textContent = run.output || 'Waiting for Playwright output...';
  const started = formatDateTime(run.startedAt);
  const finished = run.finishedAt ? ` · finished ${formatDateTime(run.finishedAt)}` : '';
  $('#run-meta').textContent = `${run.project === 'all' ? 'All browsers' : run.project} · ${run.headed ? 'headed' : 'headless'} · started ${started}${finished}`;
  $('#run-button').disabled = run.status === 'running' || !state.selectedFile;
}

async function loadTests() {
  let data;
  try {
    const response = await fetch('/api/tests');
    if (!response.ok) throw new Error('Local runner unavailable');
    data = await response.json();
  } catch {
    const response = await fetch('tests.json');
    if (!response.ok) throw new Error('Static test manifest unavailable');
    data = await response.json();
  }
  state.tests = data.tests;
  $('#test-count').textContent = state.tests.length;
  renderTests();
}

async function startRun() {
  if (!state.selectedFile) return;
  $('#run-button').disabled = true;
  $('#run-status').textContent = 'Starting';
  $('#output').textContent = 'Starting Playwright...';
  const response = await fetch('/api/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: state.selectedFile, project: $('#project').value, headed: $('#headed').checked }),
  });
  const run = await response.json();
  if (!response.ok) {
    $('#run-status').textContent = 'Error';
    $('#output').textContent = run.error || 'Could not start the test.';
    $('#run-button').disabled = false;
    return;
  }
  state.runId = run.id;
  updateRun(run);
  state.poller = window.setInterval(pollRun, 500);
}

async function pollRun() {
  const response = await fetch(`/api/runs/${state.runId}`);
  const run = await response.json();
  updateRun(run);
  if (run.status !== 'running') {
    window.clearInterval(state.poller);
    state.poller = null;
  }
}

async function openReport() {
  const reportWindow = window.open('about:blank', '_blank');
  const response = await fetch('/api/report', { method: 'POST' });
  const report = await response.json();
  if (reportWindow) {
    reportWindow.location = report.url;
  } else {
    window.location.href = report.url;
  }
  $('#run-meta').textContent = 'Opening latest HTML report';
}

function setupSplitter() {
  const workspace = $('.workspace');
  const splitter = $('#splitter');
  let dragging = false;

  const setWidth = (clientX) => {
    const bounds = workspace.getBoundingClientRect();
    const percentage = Math.min(55, Math.max(28, ((clientX - bounds.left) / bounds.width) * 100));
    workspace.style.setProperty('--library-width', `${percentage}%`);
    splitter.setAttribute('aria-valuenow', Math.round(percentage));
  };

  splitter.addEventListener('pointerdown', (event) => {
    dragging = true;
    splitter.classList.add('dragging');
    splitter.setPointerCapture(event.pointerId);
  });
  splitter.addEventListener('pointermove', (event) => { if (dragging) setWidth(event.clientX); });
  splitter.addEventListener('pointerup', () => {
    dragging = false;
    splitter.classList.remove('dragging');
  });
  splitter.addEventListener('keydown', (event) => {
    const current = Number(splitter.getAttribute('aria-valuenow'));
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const change = event.key === 'ArrowLeft' ? -2 : 2;
      const percentage = Math.min(55, Math.max(28, current + change));
      workspace.style.setProperty('--library-width', `${percentage}%`);
      splitter.setAttribute('aria-valuenow', percentage);
    }
  });
}

$('#search-tests').addEventListener('input', renderTests);
$('#run-button').addEventListener('click', startRun);
$('#report-button').addEventListener('click', openReport);
setupSplitter();
loadTests().catch(() => { $('#test-list').innerHTML = '<p class="empty">Could not load test files. Is the dashboard server running?</p>'; });
