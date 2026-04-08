import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 4173);

const staticTypes = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
};

function sendJson(res, statusCode, payload) {
	res.writeHead(statusCode, {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store",
	});
	res.end(JSON.stringify(payload));
}

function parseBody(req) {
	return new Promise((resolve, reject) => {
		let raw = "";
		req.on("data", (chunk) => {
			raw += chunk;
			if (raw.length > 1_000_000) {
				req.destroy();
				reject(new Error("Payload too large"));
			}
		});
		req.on("end", () => {
			if (!raw) {
				resolve({});
				return;
			}
			try {
				resolve(JSON.parse(raw));
			} catch {
				reject(new Error("Invalid JSON body"));
			}
		});
		req.on("error", reject);
	});
}

async function handlePlausibleProxy(req, res) {
	const apiKey = process.env.PLAUSIBLE_API_KEY;
	const endpoint = process.env.PLAUSIBLE_ENDPOINT || "https://plausible.io/api/v1/stats/aggregate";

	if (!apiKey) {
		sendJson(res, 500, {
			error: "PLAUSIBLE_API_KEY is missing. Export it before starting this proxy.",
		});
		return;
	}

	let body;
	try {
		body = await parseBody(req);
	} catch (error) {
		sendJson(res, 400, { error: error.message });
		return;
	}

	const siteId = String(body.siteId || "").trim();
	const period = String(body.period || "30d").trim();
	const metrics = String(body.metrics || "visitors,pageviews,visit_duration,bounce_rate").trim();

	if (!siteId) {
		sendJson(res, 400, { error: "siteId is required." });
		return;
	}

	try {
		const url = new URL(endpoint);
		url.searchParams.set("site_id", siteId);
		url.searchParams.set("period", period);
		url.searchParams.set("metrics", metrics);

		const response = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${apiKey}`,
				Accept: "application/json",
			},
		});

		const json = await response.json();
		if (!response.ok) {
			sendJson(res, response.status, {
				error: json.message || "Plausible upstream request failed.",
			});
			return;
		}

		sendJson(res, 200, json);
	} catch (error) {
		sendJson(res, 502, {
			error: "Failed to reach Plausible upstream endpoint.",
			detail: error.message,
		});
	}
}

async function serveStatic(req, res, requestPath) {
	const routePath = requestPath === "/" ? "/index.html" : requestPath;
	const decodedPath = decodeURIComponent(routePath);
	const safeRelative = path.normalize(decodedPath).replace(/^([.]{2}[\\/])+/, "");
	const filePath = path.join(appRoot, safeRelative);

	if (!filePath.startsWith(appRoot)) {
		sendJson(res, 403, { error: "Forbidden" });
		return;
	}

	try {
		const content = await readFile(filePath);
		const ext = path.extname(filePath).toLowerCase();
		res.writeHead(200, {
			"Content-Type": staticTypes[ext] || "application/octet-stream",
			"Cache-Control": "no-store",
		});
		res.end(content);
	} catch {
		sendJson(res, 404, { error: "Not found" });
	}
}

const server = http.createServer(async (req, res) => {
	const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

	if (req.method === "POST" && reqUrl.pathname === "/api/plausible") {
		await handlePlausibleProxy(req, res);
		return;
	}

	if (req.method === "GET") {
		await serveStatic(req, res, reqUrl.pathname);
		return;
	}

	sendJson(res, 405, { error: "Method not allowed" });
});

server.listen(port, () => {
	console.log(`[live-analytics-dashboard] running at http://localhost:${port}`);
	console.log("[live-analytics-dashboard] proxy endpoint: POST /api/plausible");
});
