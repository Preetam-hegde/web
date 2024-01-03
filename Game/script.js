fetch('https://api.quotable.io/quotes/random')
      .then(response => response.json())
      .then(data => {
        // Extract the 'content' key from the fetched data
        const quoteContent = data[0].content;

        // Display the quote content in the div
        const quoteContainer = document.getElementById('quote-container');
        quoteContainer.textContent = quoteContent;
      })
      .catch(error => {
        // Handle any errors that occur during the fetch
        console.log('Error fetching the quote:', error);
      });