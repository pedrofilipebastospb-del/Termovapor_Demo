import { readFile } from "node:fs/promises";
import path from "node:path";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const data = await readFile(path.join(process.cwd(), ".local-data/state.json"), "utf8");
    return new Response(data, { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Não foi possível carregar os dados locais. Execute npm run import:real." }, { status: 503 });
  }
}
