/**
 * Recursively wrap each word in a text node with a span (for stagger anim),
 * preserving existing element children (e.g. highlight spans with gradient).
 *
 * Idempotent: marks the root with data-split="1" after first run.
 */
export function wrapWordsPreservingMarkup(
  root: HTMLElement,
  wordClass = 'word-anim',
) {
  if (root.dataset.split === '1') return;
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (!text.trim()) return;
      const parts = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) {
          frag.appendChild(document.createTextNode(p));
        } else {
          const span = document.createElement('span');
          span.className = wordClass;
          span.style.display = 'inline-block';
          span.textContent = p;
          frag.appendChild(span);
        }
      });
      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(walk);
    }
  };
  Array.from(root.childNodes).forEach(walk);
  root.dataset.split = '1';
}
