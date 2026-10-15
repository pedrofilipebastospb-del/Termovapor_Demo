import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9-]+$/i.test(id)) return new Response("Documento não encontrado.", { status: 404 });
  try {
    const registry = JSON.parse(await readFile(path.join(process.cwd(), ".local-data/documents.json"), "utf8")) as { files: Record<string, string>; roots: string[] };
    const stored = registry.files[id];
    if (!stored) return new Response("Ficheiro não disponível nas pastas fornecidas.", { status: 404 });
    const file = await realpath(stored);
    let allowed = false;
    for (const root of registry.roots) {
      try {
        const base = await realpath(root);
        const relative = path.relative(base, file);
        if (relative && !relative.startsWith(".." + path.sep) && relative !== ".." && !path.isAbsolute(relative)) allowed = true;
      } catch { /* A missing source folder never grants access. */ }
    }
    if (!allowed || path.extname(file).toLowerCase() !== ".pdf") return new Response("Documento não encontrado.", { status: 404 });
    const bytes = await readFile(file);
    if (!bytes.subarray(0, 1024).includes(Buffer.from("%PDF-"))) return new Response("O ficheiro não é um PDF válido.", { status: 415 });
    return new Response(new Uint8Array(bytes), { headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.length),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(path.basename(file))}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return new Response("Ficheiro não disponível nas pastas fornecidas.", { status: 404 });
  }
}
