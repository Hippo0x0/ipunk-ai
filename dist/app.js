const languageButton = document.querySelector('[data-language]');
const savedLanguage = localStorage.getItem('ipunk-ai-language');
if (savedLanguage === 'en') document.body.classList.add('en');

function currentLocale() {
  return document.body.classList.contains('en') ? 'en-US' : 'zh-CN';
}

function updateLanguage() {
  if (!languageButton) return;
  const english = document.body.classList.contains('en');
  languageButton.textContent = english ? '中文' : 'English';
  languageButton.setAttribute('aria-label', english ? '切换到中文' : 'Switch to English');
  document.documentElement.lang = english ? 'en' : 'zh-CN';
  renderCaptureLabels();
}

languageButton?.addEventListener('click', () => {
  document.body.classList.toggle('en');
  localStorage.setItem('ipunk-ai-language', document.body.classList.contains('en') ? 'en' : 'zh');
  updateLanguage();
});

let projectData = null;
let activeFilter = 'all';

function renderCaptureLabels() {
  if (!projectData) return;
  const locale = currentLocale();
  const captured = new Date(projectData.captured_at);
  const formatted = captured.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
  document.querySelectorAll('[data-captured]').forEach((target) => { target.textContent = formatted; });
  const previous = projectData.projects.map((item) => item.previous_capture_at).find(Boolean);
  const target = document.querySelector('[data-capture-window]');
  if (target && previous) {
    const hours = Math.max(1, Math.round((captured - new Date(previous)) / 3_600_000));
    target.textContent = document.body.classList.contains('en') ? `Snapshot interval: ${hours}h` : `快照间隔：${hours} 小时`;
  }
}

function applyProjectView() {
  const search = (document.querySelector('[data-search]')?.value || '').trim().toLowerCase();
  const sort = document.querySelector('[data-sort]')?.value || 'score';
  const grid = document.querySelector('[data-project-grid]');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.card')];
  const value = (card) => Number(card.dataset[sort] || 0);
  cards.sort((a, b) => value(b) - value(a)).forEach((card) => grid.append(card));
  let visible = 0;
  cards.forEach((card) => {
    const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
    const matchesSearch = !search || card.textContent.toLowerCase().includes(search);
    card.hidden = !(matchesFilter && matchesSearch);
    if (!card.hidden) visible += 1;
  });
  const count = document.querySelector('[data-result-count]');
  if (count) count.textContent = String(visible);
  const empty = document.querySelector('[data-empty]');
  if (empty) empty.hidden = visible !== 0;
}

document.querySelector('[data-search]')?.addEventListener('input', applyProjectView);
document.querySelector('[data-sort]')?.addEventListener('change', applyProjectView);
document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
  applyProjectView();
}));

fetch('/data/projects.json')
  .then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
  .then((data) => {
    projectData = data;
    const number = new Intl.NumberFormat('en-US');
    document.querySelectorAll('[data-project-count]').forEach((target) => { target.textContent = String(data.projects.length); });
    for (const card of document.querySelectorAll('[data-project]')) {
      const project = data.projects.find((item) => item.slug === card.dataset.project);
      if (!project) continue;
      card.dataset.stars = String(project.stars);
      card.dataset.growth = String(project.stars_since_previous_capture ?? -1);
      card.querySelector('[data-stars]').textContent = number.format(project.stars);
      card.querySelector('[data-forks]').textContent = number.format(project.forks);
      const delta = card.querySelector('[data-delta]');
      if (project.stars_since_previous_capture == null) {
        delta.textContent = 'BASELINE';
      } else {
        const sign = project.stars_since_previous_capture >= 0 ? '+' : '';
        delta.textContent = `${sign}${number.format(project.stars_since_previous_capture)} ★`;
      }
    }
    renderCaptureLabels();
    applyProjectView();
    const slug = location.pathname.split('/').filter(Boolean).at(-1);
    const project = data.projects.find((item) => item.slug === slug);
    if (project) {
      const values = document.querySelectorAll('.snapshot dd');
      [project.stars, project.forks, project.open_issues].forEach((item, index) => { if (values[index]) values[index].textContent = number.format(item); });
    }
  })
  .catch(() => {
    document.querySelectorAll('[data-delta]').forEach((target) => { target.textContent = 'DATA ERROR'; });
    document.querySelectorAll('[data-captured]').forEach((target) => { target.textContent = '暂不可用'; });
  });

updateLanguage();
