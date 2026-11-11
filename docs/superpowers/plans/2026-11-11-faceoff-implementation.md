# Faceoff implementation plan

1. Preserve the current uncommitted game fixes and test baseline. Work in this checkout so those fixes remain part of the implementation.
2. Add a tested registry and shared ordered manifest/loader. Use the manifest for offline assets and document registration. Keep game arrays compatible with existing engine and network consumers.
3. Extract pure rules and common game UI, then enclose each game pack's private state. Replace raw array pushes with validated registration. Update the browser logic page and add DOM-free rules tests.
4. Separate runtime scheduling, sound and result-card rendering from match/content responsibilities. Add lifecycle cancellation tests and preserve the context methods existing games use.
5. Apply the user's updated visual direction across the lobby and every game family: matte surfaces, restrained type and borders, timer/rhythm instruments, RGB controls, size phases, board controls and party actions. Organise CSS by responsibility while retaining game rules and player orientation.
6. Run unit, full browser and two-page checks, inspect phone/desktop screenshots, verify offline reload and version consistency, and review the final diff. Document the exact new-game workflow and checks.

Review focus: duplicate IDs, missing game hooks, solo/group eligibility, loader ordering/failure handling, stale timers/listeners, private helper dependencies, rotated touch coordinates, small-phone result actions, mute/reduced-motion behaviour, and cached asset parity.
