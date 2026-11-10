# AI & ML Visualizer

## Design and implementation plan

Build a companion to `apps/analyser`: the same dusk sky, paper surfaces,
story-first teaching, and reversible playback, for beginner-to-intermediate
AI/ML study and interview preparation. Reuse the DSA stylesheet; keep all
new logic and teaching material in this app. No runtime libraries or backend.

Visual thesis: a calm illustrated notebook under the DSA app's dusk sky.
Content: topic navigation → interactive experiment → story/math/code/interview
reference → recall check → next lesson. Motion: user-controlled playback,
active-step highlighting, and restrained button feedback with reduced-motion support.

The implementation uses curated local lessons rather than a remote course embed
(which would fragment the teaching) or an LLM tutor (which needs credentials and
introduces unverified answers). Numerical labs calculate their results; conceptual
walkthroughs are explicitly labelled. Python code is educational and is not executed
in the browser. Small synthetic datasets and hand-set attention/embedding vectors
are explicitly identified; they are not trained models.

- [x] Test the numerical core first: optimization, probabilities, metrics,
  clustering, projection, and convolution. Include extreme logits, empty metric
  denominators, empty clusters, and unstable learning rates.
- [x] Author 35 lessons in eight ordered tracks. Each has an analogy, four
  teaching steps, math with symbols explained, code, pitfalls, a recall check,
  four interview answers with follow-ups, and primary references.
- [x] Implement keyboard-accessible playback, experiment controls, lesson search,
  deep links, persistent progress, and global interview search/review.
- [x] Add the project to the shared catalog, preserving the earlier Verilog removal.
- [x] Check all lesson routes and controls in Chromium and Firefox, mobile layout,
  storage failure handling, numerical tests, syntax, links, and formatting.

Review focus: storage may be unavailable or corrupt; invalid hashes must fall back
to a valid lesson; filters with no matches need a clear empty state; player shortcuts
must not hijack inputs/buttons; toy demonstrations must not imply production results.

## Research

Researched 10 November 2026. Google ML Crash Course was searched and read in
Chrome; other primary references were checked through web research after Chrome
navigation to scikit-learn timed out. The curriculum and interview questions are
original syntheses, not copied interview lists or claims about interview frequency.
All reference titles and URLs live in `js/course.js` and are exposed per lesson.

Primary sources: Google ML Crash Course and recommendation systems; Stanford
CS229 probability/linear algebra and CS231n convolution notes; scikit-learn's
algorithm, evaluation, preprocessing, and leakage guides; PyTorch optimization
and autograd; Hugging Face's LLM course; the Transformer, RAG, LoRA, and DDPM
papers; Sutton & Barto's RL textbook; Forecasting: Principles and Practice.

## Run and verify

From the repository root:

```sh
python3 -m http.server 4173
node apps/ai-ml-lab/test.js
```

Open `http://localhost:4173/apps/ai-ml-lab/index.html`.
Progress and self-rated interview answers stay in localStorage on this browser.
The source material is bundled; optional Google Fonts and external references
need a network connection. No question bank can cover every interview.

## Verification results

- Numerical and rendered-frame checks pass, including matching the scalar
  backpropagation example to its lesson and numeric teaching phases for k-means.
- Chrome and Firefox passed all 35 routes, parameter extremes, tabs, recall checks,
  playback, filters, ratings, saved/corrupt/unavailable storage, and both catalogs.
- Layout checked at 390, 768, 1024, and 1536 pixels. Narrow diagrams scroll sideways
  to preserve readable labels. Desktop/mobile screenshots are in `output/playwright/`.
- Cached Prettier 3.9.6 checked all new HTML/CSS/JS with tabs and single quotes;
  JavaScript syntax and `git diff --check` pass. The whole repository was not formatted.
- Firefox logged one optional Google Font download failure and used the CSS system
  font fallback. The RL reference uses the verified MIT Press page because the
  author's host timed out during research.
- Local implementation only; no commit, push, or deployment performed.
