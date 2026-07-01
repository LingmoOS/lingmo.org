export function mdToHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  html = html.replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>");
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    const items = match.trim();
    if (/^\d+\./.test(md.slice(md.indexOf(match.split("\n")[0]!)))) {
      return `<ol>${items}</ol>`;
    }
    return `<ul>${items}</ul>`;
  });

  const blocks = html.split(/\n{2,}/);
  html = blocks
    .map((block) => {
      const t = block.trim();
      if (!t) return "";
      if (/^<[hul]/.test(t) || /^<\/[ul]/.test(t)) return t;
      return `<p>${t}</p>`;
    })
    .join("\n");

  return html;
}
