import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const token = randomBytes(32).toString("hex");
const port = Number(process.env.PORT || 8788);

function runWrangler(command) {
  return new Promise((resolve, reject) => {
    const child = spawn("wrangler", ["d1", "execute", "n4vvii-contact", "--remote", "--json", "--command", command], { cwd: root });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code) => code === 0 ? resolve(stdout) : reject(new Error(stderr || "Wrangler command failed.")));
  });
}

async function query(command) {
  const raw = await runWrangler(command);
  const result = JSON.parse(raw);
  return result[0]?.results || [];
}

function reply(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(payload));
}

createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (request.headers.host !== `127.0.0.1:${port}`) return reply(response, 403, { error: "Local access only." });

  if (url.pathname === "/") {
    const html = (await readFile(join(root, "admin", "index.html"), "utf8")).replace("__ADMIN_TOKEN__", token);
    response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    return response.end(html);
  }
  if (!url.pathname.startsWith("/api/") || request.headers["x-admin-token"] !== token) return reply(response, 403, { error: "Forbidden." });

  try {
    if (request.method === "GET" && url.pathname === "/api/inquiries") {
      const inquiries = await query("SELECT id, target, body, reply_to, created_at, read_at FROM inquiries ORDER BY id DESC LIMIT 200");
      return reply(response, 200, { inquiries });
    }
    const match = url.pathname.match(/^\/api\/inquiries\/(\d+)\/(read|delete)$/);
    if (!match || request.method !== "POST") return reply(response, 404, { error: "Not found." });
    const id = Number(match[1]);
    if (match[2] === "read") await query(`UPDATE inquiries SET read_at = datetime('now') WHERE id = ${id}`);
    if (match[2] === "delete") await query(`DELETE FROM inquiries WHERE id = ${id}`);
    return reply(response, 200, { ok: true });
  } catch {
    return reply(response, 500, { error: "Could not read the inbox. Check wrangler login and try again." });
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Local inbox: http://127.0.0.1:${port}`);
});
