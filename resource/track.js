'use strict';

// GoatCounter click events: resume, email, outbound links, app opens.
document.addEventListener('click', (e) => {
	const a = e.target.closest('a[href]');
	if (!a || !window.goatcounter || !window.goatcounter.count) return;
	const url = new URL(a.href, location.href);
	let name = '';
	if (url.protocol === 'mailto:') name = 'email';
	else if (/\.pdf$|RESUME\.md$/i.test(url.pathname)) name = 'resume';
	else if (url.origin !== location.origin) name = `out/${url.hostname}`;
	else if (url.pathname.includes('/apps/')) name = `app/${url.pathname.split('/apps/')[1].split('/')[0]}`;
	if (name) window.goatcounter.count({ path: name, title: a.textContent.trim().slice(0, 60) || name, event: true });
});
