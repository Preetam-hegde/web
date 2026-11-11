'use strict';

(() => {
	const paths = typeof FACEOFF_SCRIPTS === 'undefined' ? [] : FACEOFF_SCRIPTS;
	const version =
		typeof FACEOFF_VERSION === 'undefined' ? null : FACEOFF_VERSION;
	const urls = new Set(
		paths.map((path) => new URL(`${path}?v=${version}`, document.baseURI).href),
	);
	let failed = false,
		rejectStartup;
	const startupError = new Promise((resolve, reject) => {
		rejectStartup = reject;
	});
	const onError = (event) => {
		if (!urls.has(event.filename)) return;
		failed = true;
		rejectStartup(
			new Error(event.message || 'A Faceoff script could not start'),
		);
	};
	window.addEventListener('error', onError);

	const load = (path) =>
		new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.async = false;
			script.src = `${path}?v=${version}`;
			script.onload = resolve;
			script.onerror = () => reject(new Error(`Could not load ${path}`));
			document.head.append(script);
		});
	const start = async () => {
		if (!paths.length || !version)
			throw new Error('Could not load the Faceoff manifest');
		// Fetch packs together; async=false keeps classic-script execution in manifest order.
		await Promise.all(paths.slice(0, -1).map(load));
		if (!failed) await load(paths.at(-1));
	};
	window.faceoffReady = Promise.race([start(), startupError]).finally(() =>
		window.removeEventListener('error', onError),
	);
	window.faceoffReady.catch(() => {
		failed = true;
		document.body.dataset.screen = 'error';
		const panel = document.createElement('main');
		panel.id = 'bootError';
		panel.setAttribute('role', 'alert');
		panel.style.cssText =
			'max-width:32rem;margin:15vh auto;padding:24px;text-align:center';
		const title = document.createElement('h1');
		title.textContent = 'Faceoff couldn’t load';
		const message = document.createElement('p');
		message.textContent = 'Check your connection, then reload to try again.';
		const reload = document.createElement('button');
		reload.type = 'button';
		reload.className = 'btn';
		reload.textContent = 'Reload';
		reload.onclick = () => window.location.reload();
		panel.append(title, message, reload);
		document.body.replaceChildren(panel);
		reload.focus();
	});
})();
