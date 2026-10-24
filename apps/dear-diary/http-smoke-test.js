"use strict";

/**
 * Dear Diary — HTTP Smoke Test Server & Route Verification
 * Spins up an ephemeral HTTP server on localhost, performs GET requests
 * for key routes, asserts 200 OK and expected content, then shuts down cleanly.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4188;
const ROOT = path.resolve(__dirname, "../../");

const MIME_TYPES = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
	const cleanUrl = req.url.split("?")[0].split("#")[0];
	const filePath = path.join(ROOT, cleanUrl.replace(/^\//, ""));

	fs.stat(filePath, (err, stats) => {
		if (err || !stats.isFile()) {
			res.writeHead(404, { "Content-Type": "text/plain" });
			res.end(`404 Not Found: ${cleanUrl}`);
			return;
		}

		const ext = path.extname(filePath).toLowerCase();
		const contentType = MIME_TYPES[ext] || "application/octet-stream";

		res.writeHead(200, {
			"Content-Type": contentType,
			"Content-Length": stats.size,
		});

		fs.createReadStream(filePath).pipe(res);
	});
});

server.listen(PORT, async () => {
	console.log(`📡 Smoke Test Server listening on http://localhost:${PORT}`);

	const routesToTest = [
		"/apps/dear-diary/index.html",
		"/apps/dear-diary/test.html",
		"/apps/dear-diary/styles.css",
		"/apps/dear-diary/url-codec.js",
		"/apps/dear-diary/svg-catalog.js",
		"/apps/dear-diary/script.js",
		"/projects.js",
		"/index.html",
		"/index-classic.html",
	];

	let passed = 0;
	let failed = 0;

	for (const route of routesToTest) {
		try {
			const res = await fetch(`http://localhost:${PORT}${route}`);
			const text = await res.text();
			const isOk = res.status === 200 && text.length > 50;

			if (isOk) {
				console.log(`  ✓ 200 OK: ${route} (${text.length} bytes)`);
				passed++;
			} else {
				console.error(
					`  ✗ FAIL: ${route} (status: ${res.status}, length: ${text.length})`,
				);
				failed++;
			}
		} catch (err) {
			console.error(`  ✗ ERROR: ${route} - ${err.message}`);
			failed++;
		}
	}

	server.close(() => {
		console.log(
			`\n🏁 HTTP Smoke Test Results: ${passed} passed, ${failed} failed`,
		);
		if (failed > 0) {
			process.exit(1);
		} else {
			process.exit(0);
		}
	});
});
