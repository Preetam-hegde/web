(() => {
	'use strict';

	const R = ArcadeRules;
	Object.assign(GAME_ICONS, {
		stack: '<path d="M4 18h16v4H4zM6 11h14v4H6zM3 4h14v4H3z"/>',
		golf: '<path d="M16 17V3l6 3-6 3M3 20h18"/><circle cx="7" cy="16" r="2"/>',
	});

	/* Fit the actual board row, including the short half of a small split-screen phone. */
	function boardUi(ctx, width, height, draw) {
		const board = $('.arcade-board', ctx.stage),
			canvas = $('canvas', board),
			g = canvas.getContext('2d');
		const resize = () => {
			const scale = Math.max(
					0.01,
					Math.min(board.clientWidth / width, board.clientHeight / height),
				),
				w = Math.max(1, Math.floor(width * scale)),
				h = Math.max(1, Math.floor(height * scale)),
				dpr = Math.min(devicePixelRatio || 1, 2);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			g.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
			draw(g);
		};
		const observer = new ResizeObserver(resize);
		observer.observe(board);
		ctx.onCleanup(() => observer.disconnect());
		resize();
		return { canvas, draw: () => draw(g) };
	}
	const header = (status) =>
		`<div class="arcade-head"><output class="arcade-status" aria-live="polite">${status}</output><span class="arcade-time" aria-label="Time remaining"></span></div>`;
	const board = (label) =>
		`<div class="arcade-board"><canvas aria-label="${label}" role="img"></canvas></div>`;

	registerGame({
		id: 'stack',
		name: 'Stack',
		icon: '▰',
		group: 'timing',
		lowerIsBetter: false,
		blurb: 'Drop moving blocks. Keep the overlap, build the tallest tower.',
		config: () => ({ speed: rand(0.34, 0.42), phase: rand(0, 2) }),
		intro: () =>
			`Tap the board or <b>Drop block</b> to build a tower<br><small>Only the overlap stays. 12 layers or 24 seconds. Most layers wins; wider breaks ties.</small>`,
		play(ctx) {
			const { stage, cfg } = ctx,
				color = ink(stage),
				t0 = performance.now(),
				tower = [{ x: 0.28, width: 0.44 }];
			stage.classList.add('arcade-game', 'stack-game');
			stage.innerHTML =
				header('0 / 12 layers') +
				board('Stack tower and moving block. Use Drop block to place it.') +
				'<div class="arcade-note">Only the overlap stays</div><button class="btn stack-drop" type="button">Drop block</button>';
			const status = $('.arcade-status', stage),
				time = $('.arcade-time', stage);
			let ui;
			const draw = (g) => {
				g.fillStyle = '#181d21';
				g.fillRect(0, 0, 600, 420);
				g.strokeStyle = '#2c343a';
				g.lineWidth = 1;
				for (let i = 0; i < 13; i++) {
					g.beginPath();
					g.moveTo(20, 386 - i * 25);
					g.lineTo(580, 386 - i * 25);
					g.stroke();
				}
				tower.forEach((block, i) => {
					g.fillStyle = i ? color : '#6d787f';
					g.fillRect(block.x * 600, 364 - i * 25, block.width * 600, 22);
					g.fillStyle = '#ffffff29';
					g.fillRect(block.x * 600, 364 - i * 25, block.width * 600, 3);
				});
				const top = tower[tower.length - 1],
					x = R.stackPosition(
						performance.now() - t0,
						top.width,
						cfg,
						tower.length - 1,
					),
					y = 364 - tower.length * 25;
				g.fillStyle = '#ece7dc';
				g.fillRect(x * 600, y, top.width * 600, 22);
				g.strokeStyle = '#ece7dc66';
				g.setLineDash([4, 6]);
				g.strokeRect(x * 600, y + 25, top.width * 600, 22);
				g.setLineDash([]);
			};
			ui = boardUi(ctx, 600, 420, draw);
			const finish = (reason) => {
				const layers = tower.length - 1,
					width = tower[layers].width;
				ctx.done(
					R.stackScore(layers, width),
					`${layers} layers · ${Math.round((width / 0.44) * 100)}% width<small>${reason}</small>`,
				);
			};
			const drop = () => {
				const top = tower[tower.length - 1],
					x = R.stackPosition(
						performance.now() - t0,
						top.width,
						cfg,
						tower.length - 1,
					),
					overlap = R.stackOverlap(top, { x, width: top.width });
				if (!overlap) {
					sfx.bad();
					return finish('Missed the tower');
				}
				tower.push(overlap);
				status.textContent = `${tower.length - 1} / 12 layers · ${Math.round((overlap.width / 0.44) * 100)}% width`;
				sfx.key();
				buzz(8);
				if (tower.length - 1 >= R.STACK_LAYERS) return finish('Tower complete');
				ui.draw();
			};
			ctx.on($('.stack-drop', stage), 'click', drop);
			ctx.on(stage, 'pointerdown', (e) => {
				if (e.button !== 0 || e.target.closest('button')) return;
				e.preventDefault();
				drop();
			});
			ctx.loop(() => {
				time.textContent = `${Math.max(0, Math.ceil((R.STACK_MS - performance.now() + t0) / 1000))}s`;
				ui.draw();
			});
			ctx.after(R.STACK_MS, () => finish('Time up'));
		},
	});

	const COURSES = [
		{
			start: { x: 140, y: 300 },
			hole: { x: 860, y: 300 },
			obstacles: [{ x: 450, y: 80, w: 100, h: 320 }],
		},
		{
			start: { x: 140, y: 180 },
			hole: { x: 860, y: 420 },
			obstacles: [{ x: 430, y: 230, w: 140, h: 290 }],
		},
		{
			start: { x: 140, y: 420 },
			hole: { x: 860, y: 180 },
			obstacles: [{ x: 430, y: 80, w: 140, h: 290 }],
		},
	];
	registerGame({
		id: 'golf',
		name: 'Pocket Golf',
		icon: '⚑',
		group: 'perception',
		lowerIsBetter: true,
		blurb: 'Pull back and putt around the bumpers. Five shots, one pocket.',
		config: () => ({
			width: 1000,
			height: 600,
			...JSON.parse(JSON.stringify(choice(COURSES))),
		}),
		intro: () =>
			`Drag <b>back from the ball</b> and release to putt<br><small>Or set Aim and Power, then Shoot. 5 shots · 35 seconds. Hole in fewer shots, otherwise closest wins.</small>`,
		play(ctx) {
			const { stage, cfg } = ctx,
				color = ink(stage),
				t0 = performance.now();
			let ball = { ...cfg.start, vx: 0, vy: 0, holed: false, shotTime: 0 },
				strokes = 0,
				drag = null,
				last = t0,
				debt = 0;
			stage.classList.add('arcade-game', 'golf-game');
			stage.innerHTML =
				header('0 / 5 shots') +
				board(
					'Golf course. Pull back from the white ball, or use Aim, Power and Shoot.',
				) +
				'<div class="golf-controls"><label>Aim <output class="golf-angle-value">0°</output><input class="golf-aim" aria-label="Aim in degrees, zero points right" type="range" min="-180" max="180" value="0"></label><label>Power <output class="golf-power-value">60%</output><input class="golf-power" aria-label="Shot power" type="range" min="1" max="100" value="60"></label></div><button class="btn golf-shoot" type="button">Shoot</button>';
			const status = $('.arcade-status', stage),
				time = $('.arcade-time', stage),
				aim = $('.golf-aim', stage),
				power = $('.golf-power', stage),
				shoot = $('.golf-shoot', stage);
			const moving = () => !!(ball.vx || ball.vy);
			const controls = () => {
				$('.golf-angle-value', stage).textContent = `${aim.value}°`;
				$('.golf-power-value', stage).textContent = `${power.value}%`;
				shoot.disabled = aim.disabled = power.disabled = moving() || !!drag;
				status.textContent = `${strokes} / 5 shots · ${Math.round(Math.hypot(ball.x - cfg.hole.x, ball.y - cfg.hole.y))} away`;
			};
			const ui = boardUi(ctx, cfg.width, cfg.height, (g) => {
				const ballRadius = Math.max(
					R.BALL_RADIUS,
					(4 * cfg.width) / g.canvas.clientWidth,
				);
				g.fillStyle = '#23392f';
				g.fillRect(0, 0, cfg.width, cfg.height);
				g.strokeStyle = '#ffffff0b';
				g.lineWidth = 2;
				for (let y = 40; y < cfg.height; y += 40) {
					g.beginPath();
					g.moveTo(0, y);
					g.lineTo(cfg.width, y);
					g.stroke();
				}
				g.strokeStyle = '#a7b5a15c';
				g.lineWidth = 12;
				g.strokeRect(6, 6, cfg.width - 12, cfg.height - 12);
				cfg.obstacles.forEach((o) => {
					g.fillStyle = '#111d18';
					g.fillRect(o.x + 5, o.y + 7, o.w, o.h);
					g.fillStyle = '#b8ab8f';
					g.fillRect(o.x, o.y, o.w, o.h);
					g.fillStyle = '#e0d4ba';
					g.fillRect(o.x, o.y, o.w, 6);
				});
				g.fillStyle = '#101c16';
				g.beginPath();
				g.arc(cfg.hole.x, cfg.hole.y, 23, 0, Math.PI * 2);
				g.fill();
				g.strokeStyle = '#d8d5bb';
				g.lineWidth = 3;
				g.beginPath();
				g.moveTo(cfg.hole.x, cfg.hole.y - 3);
				g.lineTo(cfg.hole.x, cfg.hole.y - 76);
				g.stroke();
				g.fillStyle = color;
				g.beginPath();
				g.moveTo(cfg.hole.x + 2, cfg.hole.y - 76);
				g.lineTo(cfg.hole.x + 46, cfg.hole.y - 62);
				g.lineTo(cfg.hole.x + 2, cfg.hole.y - 48);
				g.fill();
				if (!moving()) {
					const angle = (+aim.value * Math.PI) / 180,
						length = 35 + +power.value * 1.6;
					g.strokeStyle = '#ece7dcc4';
					g.lineWidth = 3;
					g.setLineDash([8, 7]);
					g.beginPath();
					g.moveTo(ball.x, ball.y);
					g.lineTo(
						ball.x + Math.cos(angle) * length,
						ball.y + Math.sin(angle) * length,
					);
					g.stroke();
					g.setLineDash([]);
				}
				g.fillStyle = '#101c1655';
				g.beginPath();
				g.arc(ball.x + 5, ball.y + 7, ballRadius + 2, 0, Math.PI * 2);
				g.fill();
				g.fillStyle = '#f2ede2';
				g.beginPath();
				g.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
				g.fill();
			});
			const finish = () =>
				ctx.done(
					R.golfScore(ball, cfg, strokes),
					ball.holed
						? `Holed in ${strokes} ${strokes === 1 ? 'shot' : 'shots'}`
						: `${Math.round(Math.hypot(ball.x - cfg.hole.x, ball.y - cfg.hole.y))} away<small>${strokes} / 5 shots</small>`,
				);
			const putt = () => {
				if (strokes >= R.GOLF_STROKES) return;
				const shot = R.golfShot(ball, +aim.value, +power.value);
				if (!shot) return;
				ball = shot;
				strokes++;
				last = performance.now();
				debt = 0;
				sfx.key();
				controls();
			};
			ctx.on(shoot, 'click', putt);
			[aim, power].forEach((input) =>
				ctx.on(input, 'input', () => {
					controls();
					ui.draw();
				}),
			);
			const point = (e) => {
				const [x, y] = unitIn(ui.canvas, e, flippedStage(stage));
				return { x: x * cfg.width, y: y * cfg.height };
			};
			const cancel = () => {
				if (!drag) return;
				const id = drag.id;
				drag = null;
				if (ui.canvas.hasPointerCapture(id))
					ui.canvas.releasePointerCapture(id);
				controls();
			};
			ctx.onCleanup(cancel);
			ctx.on(ui.canvas, 'pointerdown', (e) => {
				if (e.button !== 0 || drag || moving()) return;
				const p = point(e),
					reach = Math.max(
						35,
						(22 * cfg.width) / ui.canvas.getBoundingClientRect().width,
					);
				if (Math.hypot(p.x - ball.x, p.y - ball.y) > reach) return;
				e.preventDefault();
				drag = { id: e.pointerId, x: p.x, y: p.y, ready: false };
				ui.canvas.setPointerCapture(e.pointerId);
				controls();
			});
			ctx.on(ui.canvas, 'pointermove', (e) => {
				if (!drag || e.pointerId !== drag.id) return;
				const p = point(e),
					dx = drag.x - p.x,
					dy = drag.y - p.y,
					length = Math.hypot(dx, dy);
				drag.ready = length > 12;
				if (drag.ready) {
					aim.value = String(Math.round((Math.atan2(dy, dx) * 180) / Math.PI));
					power.value = String(
						Math.max(1, Math.min(100, Math.round(length / 2.5))),
					);
				}
				controls();
				ui.draw();
			});
			ctx.on(ui.canvas, 'pointerup', (e) => {
				if (!drag || e.pointerId !== drag.id) return;
				const p = point(e),
					ready =
						drag.ready &&
						p.x >= 0 &&
						p.x <= cfg.width &&
						p.y >= 0 &&
						p.y <= cfg.height;
				cancel();
				if (ready) putt();
			});
			['pointercancel', 'lostpointercapture'].forEach((event) =>
				ctx.on(ui.canvas, event, cancel),
			);
			controls();
			ctx.loop((now) => {
				debt += Math.max(0, Math.min(100, now - last)) / 1000;
				last = now;
				const wasMoving = moving();
				while (debt >= 1 / 120) {
					ball = R.golfStep(ball, cfg, 1 / 120);
					debt -= 1 / 120;
				}
				time.textContent = `${Math.max(0, Math.ceil((R.GOLF_MS - now + t0) / 1000))}s`;
				if (
					ball.holed ||
					(wasMoving && !moving() && strokes >= R.GOLF_STROKES)
				) {
					finish();
					return false;
				}
				if (wasMoving && !moving()) controls();
				ui.draw();
			});
			ctx.after(R.GOLF_MS, finish);
		},
	});
})();
