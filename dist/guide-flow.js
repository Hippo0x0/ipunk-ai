for (const panel of document.querySelectorAll('[data-flow]')) {
  const viewport = panel.querySelector('.flow-viewport');
  const svg = panel.querySelector('svg');
  const levels = [1, 1.5, 2, 3, 4];
  let level = 0;
  let drag;
  let suppressClick = false;
  function highlight(id) {
    for (const node of svg.querySelectorAll('[data-node]')) node.setAttribute('aria-pressed', String(node.dataset.node === id || node.dataset.node === 'root'));
    for (const edge of svg.querySelectorAll('[data-edge]')) edge.classList.toggle('active', edge.dataset.edge === id);
  }
  for (const node of svg.querySelectorAll('[data-node]')) {
    node.addEventListener('click', () => { if (!suppressClick) highlight(node.dataset.node); });
    node.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); highlight(node.dataset.node); }
    });
  }
  function zoom() {
    svg.style.width = `${levels[level] * 100}%`;
    viewport.classList.toggle('zoomed', level > 0);
    viewport.style.maxHeight = level ? '550px' : '';
    if (!level) { viewport.scrollLeft = 0; viewport.scrollTop = 0; }
    panel.querySelector('[data-zoom="out"]').disabled = !level;
    panel.querySelector('[data-zoom="in"]').disabled = level === levels.length - 1;
  }
  for (const button of panel.querySelectorAll('[data-zoom]')) button.addEventListener('click', () => { level = Math.max(0, Math.min(levels.length - 1, level + (button.dataset.zoom === 'in' ? 1 : -1))); zoom(); });
  viewport.addEventListener('pointerdown', event => {
    if (!level || event.pointerType === 'touch' || event.button !== 0) return;
    suppressClick = false;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, moved: false };
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    drag.moved = true;
    suppressClick = true;
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('dragging');
    viewport.scrollLeft = drag.left - dx;
    viewport.scrollTop = drag.top - dy;
  });
  function end() { if (!drag) return; if (viewport.hasPointerCapture(drag.id)) viewport.releasePointerCapture(drag.id); drag = undefined; viewport.classList.remove('dragging'); setTimeout(() => { suppressClick = false; }, 0); }
  viewport.addEventListener('pointerup', end);
  viewport.addEventListener('pointercancel', end);
  viewport.addEventListener('click', event => { if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
  zoom();
}
