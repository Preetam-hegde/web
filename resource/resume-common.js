(function () {
  let resumeCachePromise = null;

  function parseResumeMarkdown(markdown) {
    const lines = markdown.split(/\r?\n/);
    const sections = [];
    let title = '';
    let current = null;

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;

      if (line.startsWith('# ')) {
        title = line.slice(2).trim();
        return;
      }

      if (line.startsWith('## ')) {
        current = {
          title: line.slice(3).trim(),
          paragraphs: [],
          bullets: []
        };
        sections.push(current);
        return;
      }

      if (!current) return;

      if (line.startsWith('- ')) {
        current.bullets.push(line.slice(2).trim());
      } else {
        current.paragraphs.push(line);
      }
    });

    return { title, sections };
  }

  function findSection(resumeData, names) {
    if (!resumeData || !Array.isArray(resumeData.sections)) return null;
    const normalized = names.map((name) => name.toLowerCase());
    return resumeData.sections.find((section) => {
      const title = section.title.toLowerCase();
      return normalized.some((name) => title.includes(name));
    }) || null;
  }

  function loadResumeData(path) {
    const resumePath = path || 'resource/RESUME.md';
    if (!resumeCachePromise) {
      resumeCachePromise = fetch(resumePath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load resume markdown (${response.status})`);
          }
          return response.text();
        })
        .then((markdown) => parseResumeMarkdown(markdown));
    }
    return resumeCachePromise;
  }

  window.resumeCommon = {
    loadResumeData,
    findSection
  };
})();
