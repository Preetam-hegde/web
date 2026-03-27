// script.js
const quoteContainer = document.getElementById('quote-container');
const authorElement = document.getElementById('author');
const quoteCard = document.getElementById('quoteCard');
const statusPill = document.getElementById('statusPill');
const statusText = document.getElementById('statusText');
const refreshBtn = document.getElementById('refresh-btn');
const copyBtn = document.getElementById('copy-btn');
const shareBtn = document.getElementById('share-btn');

const QUOTE_SOURCES = [
  {
    name: 'Quotable',
    url: 'https://api.quotable.io/quotes/random?maxLength=150',
    normalize(data) {
      const items = Array.isArray(data) ? data : data?.results;
      const quote = Array.isArray(items) ? items[0] : null;
      if (!quote) {
        throw new Error('No quote returned');
      }

      return {
        content: quote.content || quote.quote,
        author: quote.author || quote.person?.name || quote.person || 'Unknown'
      };
    }
  },
  {
    name: 'ZenQuotes',
    url: 'https://zenquotes.io/api/random',
    normalize(data) {
      const items = Array.isArray(data) ? data : [data];
      const quote = items[0];
      if (!quote) {
        throw new Error('No quote returned');
      }

      return {
        content: quote.q || quote.content || quote.quote,
        author: quote.a || quote.author || 'Unknown'
      };
    }
  }
];

const FALLBACK_QUOTES = [
  { content: 'Sometimes you win, sometimes you learn.', author: 'John C. Maxwell' },
  { content: 'Success is going from failure to failure without loss of enthusiasm.', author: 'Winston S. Churchill' },
  { content: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { content: 'You are never too old to set another goal or to dream a new dream.', author: 'C. S. Lewis' },
  { content: 'Every strike brings me closer to the next home run.', author: 'Babe Ruth' }
];

function setStatus({ text, state }) {
  statusText.textContent = text;
  statusPill.classList.remove('error', 'success');
  if (state) {
    statusPill.classList.add(state);
  }
}

async function fetchFromSource(source) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(source.url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const { content, author } = source.normalize(payload);

    if (!content) {
      throw new Error('Empty quote');
    }

    return { content, author, source: source.name };
  } finally {
    clearTimeout(timeoutId);
  }
}

function getFallbackQuote() {
  const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return { ...FALLBACK_QUOTES[randomIndex], source: 'Offline Collection', offline: true };
}

async function fetchQuote() {
  setStatus({ text: 'Finding inspiration', state: null });
  quoteCard.classList.add('loading');
  quoteCard.classList.remove('fade-in', 'shake');
  quoteContainer.textContent = 'Fetching a new quote...';
  authorElement.textContent = '— Loading';

  const errors = [];
  let quoteResult = null;

  for (const source of QUOTE_SOURCES) {
    try {
      // eslint-disable-next-line no-await-in-loop
      quoteResult = await fetchFromSource(source);
      break;
    } catch (error) {
      errors.push(`${source.name}: ${error.message}`);
      console.warn(`Quote source failed (${source.name}):`, error);
    }
  }

  if (!quoteResult) {
    quoteResult = getFallbackQuote();
  }

  try {
    quoteContainer.textContent = quoteResult.content;
    authorElement.textContent = `— ${quoteResult.author}`;
    quoteCard.classList.remove('loading');
    quoteCard.classList.add('fade-in');

    const usingFallback = Boolean(quoteResult.offline);
    const statusMessage = usingFallback ? 'Offline inspiration' : `Sourced from ${quoteResult.source}`;
    const statusState = usingFallback ? 'error' : 'success';
    setStatus({ text: statusMessage, state: statusState });

    setTimeout(() => {
      quoteCard.classList.remove('fade-in');
      statusPill.classList.remove('success', 'error');
    }, 1500);

    if (errors.length && !usingFallback) {
      console.info('Other quote providers were unavailable:', errors);
    }

    if (usingFallback && errors.length) {
      console.error('All remote quote providers failed:', errors);
    }
  } catch (error) {
    quoteContainer.textContent = 'Oops! Couldn’t fetch a quote.';
    authorElement.textContent = '— Unknown';
    quoteCard.classList.remove('loading');
    quoteCard.classList.add('shake');
    setStatus({ text: 'Something went wrong', state: 'error' });
    console.error('Error displaying quote:', error);
  }
}

function getQuoteText() {
  return `"${quoteContainer.textContent}" ${authorElement.textContent}`;
}

function copyQuote() {
  navigator.clipboard.writeText(getQuoteText()).then(() => {
    copyBtn.classList.add('success');
    copyBtn.querySelector('.control-icon').innerHTML = '<i class="fas fa-check"></i>';
    copyBtn.querySelector('.control-label').textContent = 'Copied';

    setTimeout(() => {
      copyBtn.classList.remove('success');
      copyBtn.querySelector('.control-icon').innerHTML = '<i class="fas fa-copy"></i>';
      copyBtn.querySelector('.control-label').textContent = 'Copy';
    }, 2000);
  });
}

async function shareQuote() {
  const shareData = {
    title: 'Quote that moved me',
    text: getQuoteText()
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      setStatus({ text: 'Shared with a friend', state: 'success' });
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        setStatus({ text: 'Unable to share', state: 'error' });
      }
    }
  } else {
    await navigator.clipboard.writeText(shareData.text);
    shareBtn.classList.add('success');
    shareBtn.querySelector('.control-icon').innerHTML = '<i class="fas fa-link"></i>';
    shareBtn.querySelector('.control-label').textContent = 'Copied';
    setStatus({ text: 'Link copied for sharing', state: 'success' });

    setTimeout(() => {
      shareBtn.classList.remove('success');
      shareBtn.querySelector('.control-icon').innerHTML = '<i class="fas fa-share-alt"></i>';
      shareBtn.querySelector('.control-label').textContent = 'Share';
    }, 2000);
  }
}

refreshBtn.addEventListener('click', fetchQuote);
copyBtn.addEventListener('click', copyQuote);
shareBtn.addEventListener('click', shareQuote);

fetchQuote();
