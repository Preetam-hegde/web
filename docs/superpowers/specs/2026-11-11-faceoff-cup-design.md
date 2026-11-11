# Faceoff: faster lobby, Cup and two arcade games

The user selected and authorized the proposed next pass: faster lobby, Faceoff Cup, Stack and Pocket Golf. Preserve the current matte visual direction and all existing player modes, settings, records and offline delivery. Implement in the current checkout on top of the earlier authorized, uncommitted Faceoff work.

## Approach

Use existing game registration and match engines. A separate Cup module selects five compatible scored games and owns cumulative standings; normal games retain their current results. Reuse local/split/pass, two-phone and group-room transport. This avoids a separate tournament engine or backend. A cosmetic menu-only change would leave selection friction; a new app/framework would duplicate the working engines.

## Experience

- Visual thesis: a compact matte arcade lobby with warm type, fine dividers, useful game previews and restrained player colours.
- Content plan: player/device choice, Quick Match / Faceoff Cup / Browse, directly launchable recent/new games, optional category browsing. Remember names/device settings already saved; never auto-join a room.
- Interaction thesis: immediate pressed feedback, short menu transitions and deliberate gameplay feedback; reduced motion removes decorative motion and timed games never wait for animation.
- Quick Match picks a compatible quick scored game, avoids repeating the previous choice when possible, and shows the selected game's rules before play. Device and sound restrictions remain respected.
- Faceoff Cup has Mixed, Reflex and Precision presets, five distinct compatible games, one round per game, an intermission with cumulative standings, and a final winner (shared wins allowed). A win is 3 points and shared first earns 1 each; failed attempts earn 0. Solo Cup is a five-game personal-best run, reporting new records instead of inventing incomparable scores. No sudden death inside a Cup. Host alone advances room Cups. Quit cancels the Cup; replay starts a fresh Cup. Cup results are recorded once, preserving normal per-game personal-best behaviour and prior history. Group Cups include active participants and retain their original room seat indices so guest churn does not corrupt room standings.
- Cup and new games must work in solo, split/pass, two-phone local scoring and eligible group rooms. Shared-phone party cards retain their existing dedicated flow; no tournament scoring is imposed on social/co-op games.
- Stack: tap to drop moving blocks onto the tower; overlap narrows the next block, precision is rewarded, a miss finishes the run. A bounded run and no-input deadline keep rooms moving.
- Pocket Golf: drag back from the ball and release to aim/shoot around obstacles; a small stroke limit and bounded simulation yield a comparable distance/stroke result. The same course/config is used for competitors. Support pointer cancellation, rotated panes, tap/keyboard-accessible aim/power controls, mute and cleanup.

## Delivery and checks

No production dependencies or build step. Keep tab indentation and strict scripts. Pure Cup selection/scoring and arcade physics/overlap get Node tests. Browser coverage must prove real controls, scoring, Cup progression/quit/replay, all existing player modes, guest/host authority, small layouts, sound-off and versioned offline asset parity. Bump the shared asset release together. Document the extension points and actual validation, leaving all changes local.
