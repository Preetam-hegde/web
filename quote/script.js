// script.js
async function fetchQuote() {
  const quoteContainer = document.getElementById('quote-container');
  const authorElement = document.getElementById('author');
  
  // Show loading state
  quoteContainer.classList.add('loading');
  quoteContainer.textContent = 'Fetching a new quote...';
  authorElement.textContent = '~ Loading';

  try {
      const response = await fetch('https://api.quotable.io/quotes/random?maxLength=150');
      const data = await response.json();
      const quote = data[0];
      
      // Update content with animation
      setTimeout(() => {
          quoteContainer.textContent = quote.content;
          authorElement.textContent = `~ ${quote.author}`;
          quoteContainer.classList.remove('loading');
          quoteContainer.classList.add('fade-in');
      }, 500);
  } catch (error) {
      quoteContainer.textContent = 'Oops! Couldn’t fetch a quote.';
      authorElement.textContent = '~ Unknown';
      console.error('Error fetching quote:', error);
  }
}

// Copy quote to clipboard
function copyQuote() {
  const quote = document.getElementById('quote-container').textContent;
  const author = document.getElementById('author').textContent;
  const textToCopy = `"${quote}" ${author}`;
  
  navigator.clipboard.writeText(textToCopy).then(() => {
      const copyBtn = document.getElementById('copy-btn');
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
      }, 2000);
  });
}

// Event listeners
document.getElementById('refresh-btn').addEventListener('click', fetchQuote);
document.getElementById('copy-btn').addEventListener('click', copyQuote);

// Initial quote load
fetchQuote();