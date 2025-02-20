// initialize page
function jsInit() {
  // collect DOM elements
  var navLabels = document.getElementsByClassName("header__nav__item"),
    navToggleBtn = document.getElementsByClassName("nav-toggle-btn")[0],
    sections = document.getElementsByClassName("main-section"),
    prevSectionIndex,
    filters = document.getElementsByClassName("filters__label"),
    projects = document.getElementsByClassName("portfolio__project");

  // helper callback
  function removeClass(classString) {
    return function(el) {
      el.classList.remove(classString);
    };
  }
  
  function updateNavLabels() {
    for (var i = 0; i < sections.length; i++) {
      // check which section is in viewport
      if ((prevSectionIndex != i) && ((sections[i].getBoundingClientRect().top < window.innerHeight / 3 && sections[i].getBoundingClientRect().top >= 0) || (sections[i].getBoundingClientRect().bottom > 3 * window.innerHeight / 4 && sections[i].getBoundingClientRect().bottom < sections[i].getBoundingClientRect().height))) {
        // update labels consequently
        [].forEach.call(navLabels, removeClass("is-active"));
        navLabels[i].classList.add("is-active");

        prevSectionIndex = i;
      }
    }

  }

 function navToggle() {
		var navToggleWrap = this.parentNode;
		//expand nav
		navToggleWrap.classList.toggle("expand");
		// close nav when clicking on a link
		[].forEach.call(navLabels, function(el) {
			el.addEventListener("click", collapseNav);
		});
		
		function collapseNav() {
			navToggleWrap.classList.remove("expand");
			[].forEach.call(navLabels, function(el) {
				el.removeEventListener("click", collapseNav);
			});
		}
	}

  function filterProjects() {

    var category = this.getAttribute("data-cat");

    // update active state for category labels
    updateFilterLabel(this);

    // display or hide elements depending on selected category
    if (!category) {
      // display all projects if "all" is selected
      [].forEach.call(projects, displayEl);
    } else {
      [].forEach.call(projects, function(el) {
        if (el.getAttribute("data-cat") !== category) {
          hideEl(el);
        } else {
          displayEl(el);
        }
      });
    }

    // utility
    function updateFilterLabel(activeEl) {
      [].forEach.call(filters, removeClass("is-active"));
      activeEl.classList.add("is-active");
    }

    function displayEl(el) {
      el.style.display = "block";
    }

    function hideEl(el) {
      el.style.display = "none";
    }
  }

  // display all js-dependent elements
  var jsEl = document.getElementsByClassName("js-dis");
  [].forEach.call(jsEl, removeClass("js-dis"));

  // display current section state in nav
  updateNavLabels();

  /** event listeners: **/
  // change current section label in nav when scrolling
  window.addEventListener("scroll", updateNavLabels);
  // toggle navigation when collapsed on smaller screens
  navToggleBtn.addEventListener("click", navToggle);
  // filtering function
  [].forEach.call(filters, function(el) {
    el.addEventListener("click", filterProjects)
  });

}

jsInit();

// Theme switching functionality
const lightThemeBtn = document.getElementById('lightTheme');
const darkThemeBtn = document.getElementById('darkTheme');
const customThemeBtn = document.getElementById('customTheme');

function setTheme(themeName) {
  document.body.className = themeName;
  localStorage.setItem('theme', themeName);
  updateThemeButtons(themeName);
}

function updateThemeButtons(activeTheme) {
  [lightThemeBtn, darkThemeBtn, customThemeBtn].forEach(btn => {
    btn.classList.remove('active');
    btn.style.display = 'inline-block';
  });

  if (activeTheme === 'light-theme') {
    lightThemeBtn.classList.add('active');
    lightThemeBtn.style.display = 'none';
  } else if (activeTheme === 'dark-theme') {
    darkThemeBtn.classList.add('active');
    darkThemeBtn.style.display = 'none';
  } else {
    customThemeBtn.classList.add('active');
    customThemeBtn.style.display = 'none';
  }
}

lightThemeBtn.addEventListener('click', () => setTheme('light-theme'));
darkThemeBtn.addEventListener('click', () => setTheme('dark-theme'));
customThemeBtn.addEventListener('click', () => setTheme('custom-theme'));

// Check for saved theme preference or use default light theme
const savedTheme = localStorage.getItem('theme') || 'light-theme';
setTheme(savedTheme);

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form validation
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  let isValid = true;
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const message = document.getElementById('message');
  
  if (name.value.trim() === '') {
    document.getElementById('nameError').textContent = 'Name is required';
    isValid = false;
  } else {
    document.getElementById('nameError').textContent = '';
  }
  
  if (email.value.trim() === '') {
    document.getElementById('emailError').textContent = 'Email is required';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    document.getElementById('emailError').textContent = 'Email is invalid';
    isValid = false;
  } else {
    document.getElementById('emailError').textContent = '';
  }
  
  if (message.value.trim() === '') {
    document.getElementById('messageError').textContent = 'Message is required';
    isValid = false;
  } else {
    document.getElementById('messageError').textContent = '';
  }
  
  if (isValid) {
    // Here you would typically send the form data to a server
    console.log('Form is valid. Sending data...');
    // You can use a service like Formspree here
    // For example: 
    // fetch('https://formspree.io/f/your-form-id', {
    //   method: 'POST',
    //   body: new FormData(e.target),
    //   headers: {
    //     'Accept': 'application/json'
    //   }
    // }).then(response => {
    //   if (response.ok) {
    //     // Handle success
    //   } else {
    //     // Handle error
    //   }
    // });
  }
});

// Dropdown functionality
document.querySelector('.dropdown-btn').addEventListener('click', function() {
  document.querySelector('.dropdown-content').classList.toggle('show');
});

// Close dropdown when clicking outside
window.addEventListener('click', function(e) {
  if (!e.target.matches('.dropdown-btn')) {
    const dropdowns = document.querySelectorAll('.dropdown-content');
    dropdowns.forEach(dropdown => {
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      }
    });
  }
});
