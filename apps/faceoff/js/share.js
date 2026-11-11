'use strict';

/* ── share card (a 1080x1920 story image) ────────────── */
const wrapText = (g, text, maxW) => {
	const lines = [];
	let line = '';
	text.split(' ').forEach((word) => {
		const next = line ? `${line} ${word}` : word;
		if (line && g.measureText(next).width > maxW) {
			lines.push(line);
			line = word;
		} else line = next;
	});
	return line ? [...lines, line] : lines;
};

async function renderCard() {
	// Keep the finished result even if a player quits while fonts are loading.
	const {
		game,
		rounds,
		final: { champ, dare, coop },
	} = m;
	const pts = [...m.pts],
		names = [nameOf(0), nameOf(1)];
	await document.fonts?.ready;
	const W = 1080,
		H = 1920;
	const cv = document.createElement('canvas');
	cv.width = W;
	cv.height = H;
	const g = cv.getContext('2d');
	const sans =
			getComputedStyle(document.documentElement).getPropertyValue('--sans') ||
			'system-ui',
		mono = "'JetBrains Mono', ui-monospace, monospace";
	const P = ['#ed9778', '#8bc9bc'];

	g.fillStyle = '#0d0e10';
	g.fillRect(0, 0, W, H);

	g.textBaseline = 'alphabetic';
	g.font = `700 130px ${sans}`;
	const wFace = g.measureText('face').width,
		wOff = g.measureText('off').width;
	g.textAlign = 'left';
	g.fillStyle = '#edeae4';
	g.fillText('face', (W - wFace - wOff) / 2, 220);
	g.fillText('off', (W - wFace - wOff) / 2 + wFace, 220);

	g.textAlign = 'center';
	g.fillStyle = '#93969b';
	g.font = `500 52px ${sans}`;
	g.fillText(`${game.icon} ${game.name}`, W / 2, 350);
	g.font = `400 40px ${sans}`;
	g.fillText(`${rounds} rounds`, W / 2, 415);

	g.font = '200px serif';
	g.fillStyle = '#fff';
	g.fillText(coop ? '💞' : champ < 0 ? '🤝' : '🏆', W / 2, 720);
	const heading = coop ? coop.title : champ < 0 ? 'Draw' : names[champ];
	let size = 120;
	g.font = `700 ${size}px ${sans}`;
	while (g.measureText(heading).width > W - 140 && size > 50)
		g.font = `700 ${(size -= 6)}px ${sans}`;
	g.fillStyle = champ < 0 ? '#edeae4' : P[champ];
	g.fillText(heading, W / 2, 890);
	g.fillStyle = '#93969b';
	g.font = `500 56px ${sans}`;
	g.fillText(
		coop ? coop.sub : champ < 0 ? 'Nobody blinked' : 'wins the match',
		W / 2,
		970,
	);

	if (coop) {
		let ns = 72;
		const pair = `${names[0]} & ${names[1]}`;
		g.font = `700 ${ns}px ${sans}`;
		while (g.measureText(pair).width > W - 160 && ns > 30)
			g.font = `700 ${(ns -= 4)}px ${sans}`;
		g.fillStyle = '#edeae4';
		g.fillText(pair, W / 2, 1280);
	} else {
		[0, 1].forEach((p) => {
			const x = p ? 790 : 290;
			g.fillStyle = P[p];
			g.font = `700 260px ${mono}`;
			g.fillText(String(pts[p]), x, 1290);
			let ns = 52;
			g.font = `500 ${ns}px ${sans}`;
			while (g.measureText(names[p]).width > 440 && ns > 28)
				g.font = `500 ${(ns -= 3)}px ${sans}`;
			g.fillStyle = '#edeae4';
			g.fillText(names[p], x, 1370);
		});
		g.fillStyle = '#61666c';
		g.font = `700 160px ${mono}`;
		g.fillText('–', W / 2, 1270);
	}

	if (dare) {
		g.font = `500 46px ${sans}`;
		const lines = wrapText(g, dare, 820).slice(0, 4);
		const boxH = 150 + lines.length * 62;
		const top = 1470;
		g.setLineDash([16, 12]);
		g.lineWidth = 4;
		g.strokeStyle = '#e49b94';
		g.beginPath();
		g.roundRect(100, top, W - 200, boxH, 36);
		g.stroke();
		g.setLineDash([]);
		g.fillStyle = '#e49b94';
		g.font = `700 38px ${sans}`;
		g.fillText('LOSER’S DARE', W / 2, top + 72);
		g.fillStyle = '#edeae4';
		g.font = `500 46px ${sans}`;
		lines.forEach((l, i) => g.fillText(l, W / 2, top + 142 + i * 62));
	}

	g.fillStyle = '#93969b';
	g.font = `500 38px ${sans}`;
	g.fillText('preetamhegde.in/apps/faceoff', W / 2, 1850);
	return new Promise((resolve) => cv.toBlob(resolve, 'image/png'));
}

async function shareResult() {
	if (!m?.final) return;
	const blob = await m.final.card;
	if (!blob) return;
	const file = new File([blob], 'faceoff-result.png', { type: 'image/png' });
	if (navigator.canShare?.({ files: [file] })) {
		try {
			await navigator.share({ files: [file], title: 'Faceoff' });
		} catch {
			/* cancelled */
		}
		return;
	}
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = 'faceoff-result.png';
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

$('#share').onclick = shareResult;
