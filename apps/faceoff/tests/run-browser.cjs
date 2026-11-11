'use strict';

const http = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
const types = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.txt': 'text/plain',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
};
const server = http.createServer(async (request, response) => {
	try {
		const url = new URL(request.url, 'http://localhost');
		const file = path.resolve(
			root,
			'.' + decodeURIComponent(url.pathname),
			url.pathname.endsWith('/') ? 'index.html' : '',
		);
		if (!file.startsWith(root + path.sep)) {
			response.writeHead(403).end();
			return;
		}
		const content = await readFile(file);
		response
			.writeHead(200, {
				'Content-Type': types[path.extname(file)] || 'application/octet-stream',
			})
			.end(content);
	} catch {
		response.writeHead(404).end();
	}
});
const run = (name, base) =>
	new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [path.join(__dirname, name)], {
			stdio: 'inherit',
			env: { ...process.env, FACEOFF_URL: base },
		});
		child.on('error', reject);
		child.on('exit', (code) =>
			code === 0 ? resolve() : reject(new Error(`${name} failed (${code})`)),
		);
	});
(async () => {
	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	});
	try {
		const base = `http://127.0.0.1:${server.address().port}/apps/faceoff/`;
		await run('browser.cjs', base);
		await run('network.cjs', base);
		await run('visuals.cjs', base);
		await run('lobby.cjs', base);
		await run('arcade.cjs', base);
		await run('cup.cjs', base);
		await run('offline.cjs', base);
	} finally {
		server.close();
	}
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
