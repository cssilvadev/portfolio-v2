export function extractHeadings(content: string) {
  const counts = new Map<string, number>();
  let fenced = false;
  return content.split("\n").flatMap((line, index) => {
    if (line.trim().startsWith("```")) { fenced = !fenced; return []; }
    if (fenced) return [];
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) return [];
    const title = match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*`_]/g, "").trim();
    const base = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
    const count = (counts.get(base) ?? 0) + 1;
    counts.set(base, count);
    return [{ id: count === 1 ? base : `${base}-${count}`, title, level: match[1].length, line: index }];
  });
}
