# AI & ML Study Studio

A companion to `apps/analyser` using the updated DSA Study Studio's dusk theme,
notebook navigation, and three-mode teaching flow. The shared DSA stylesheet
supplies the layout and study components; AI/ML content and logic stay in this app.

## Learning modes

- **Study guide:** a learning path, 35 lessons in eight chapters, mental models,
  four-step worked examples, decoded formulas, illustrative Python, reasoning,
  cost/trade-offs, recall checks, and links into the visual lab.
- **Interview practice:** 140 questions with concrete scenarios, separate hint and
  answer reveals, follow-ups, topic/difficulty filters, and self-rated review status.
- **Visual lab:** 16 computed experiments and 19 concept walkthroughs, reversible
  playback, adjustable parameters, full-width notes below the canvas, and a link
  back to the corresponding written lesson.
- **Revision desk and reading room:** formula/method references, an interview
  checklist, and the 29 primary course references.

No backend or runtime library is required. Numerical experiments use small
synthetic datasets; hand-set embeddings, attention vectors, and filters are
labelled. Python snippets abbreviate imports, setup, and helper names and are not
executed in the browser. Confidence ratings are self-assessments.

## Routes and saved progress

The default page is the study-guide learning path.

- `#study/start`, `#study/<lesson-id>`
- `#study/questions?topic=rag&level=Hard`
- `#study/revision`, `#study/resources`
- `#lab/<lesson-id>`

Existing `#<lesson-id>` lab links and `#interview` links continue to work. Invalid
or malformed routes fall back to the learning path. The original localStorage key
`ai-ml-visualizer-progress-v1` and question IDs are retained, preserving completed
lessons and interview ratings. Storage errors leave the app usable for the session.

## Research and content

Researched 10 November 2026. Google ML Crash Course was searched and read in
Chrome; other primary references were checked through web research. The original
lessons and interview answers live in `js/course.js`; the worked examples,
question-specific hints/scenarios, and difficulty labels live in `js/study-data.js`.
The guide renderer is `js/guide.js`, the controller is `js/app.js`, and the numerical
experiments are `js/math.js` and `js/views.js`.

Primary sources include Google ML Crash Course and recommendation systems;
Stanford CS229 and CS231n; scikit-learn preprocessing, algorithms, and evaluation;
PyTorch autograd and training; Hugging Face's LLM course; the Transformer, RAG,
LoRA, and DDPM papers; Sutton & Barto; and Forecasting: Principles and Practice.
The reading room and lesson reference links expose the source URLs. The interview
collection is an original learning selection, not a company frequency ranking or
an exhaustive list of possible interview questions.

## Run and verify

From the repository root:

```sh
python3 -m http.server 4173
node apps/ai-ml-lab/test.js
```

Open `http://localhost:4173/apps/ai-ml-lab/index.html`.

Verification for the Study Studio update:

- Numerical invariants, rendered frames, 35 worked-example records, 140 guided
  question records, source mappings, route fallbacks, and guide rendering pass.
- Chrome and Firefox passed all 35 study lessons and 35 lab routes, study/lab
  return links, recall checks, progressive reveals, filters, ratings, old progress,
  corrupt/unavailable storage, revision, reading, and 390/768/1024/1536 px layouts.
- Narrow diagrams scroll inside their container; shared study navigation scrolls
  horizontally on mobile. Notes render below the visual workspace.
- New/changed HTML, CSS, and JS pass cached Prettier 3.9.6 with tabs and single
  quotes. JavaScript syntax and `git diff --check` pass. DSA's own check also passes.
- Firefox logged optional Google Font download failures and used system fallbacks.
  External reading links and Google Fonts require a network connection.
- Screenshots are under `output/playwright/ai-ml-*.png`; the portfolio thumbnail is
  `resource/Image/projects/ai-ml-lab.jpg`.

Local changes only; no commit, push, or deployment performed.
