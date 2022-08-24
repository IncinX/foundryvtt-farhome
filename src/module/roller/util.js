export function escapeHtml(value) {
  const text = document.createTextNode(value);
  const p = document.createElement('p');
  p.appendChild(text);
  return p.innerHTML;
}
