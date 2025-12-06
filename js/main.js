document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Logic
  const menuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuSpans = menuButton.querySelectorAll('span');
  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    
    // Toggle menu visibility
    if (isMenuOpen) {
      mobileMenu.classList.remove('max-h-0');
      mobileMenu.classList.add('max-h-64', 'mt-4');
      
      // Hamburger animation
      menuSpans[0].classList.add('rotate-45', 'translate-y-2');
      menuSpans[1].classList.add('opacity-0');
      menuSpans[2].classList.add('-rotate-45', '-translate-y-2');
    } else {
      mobileMenu.classList.add('max-h-0');
      mobileMenu.classList.remove('max-h-64', 'mt-4');
      
      // Hamburger animation reset
      menuSpans[0].classList.remove('rotate-45', 'translate-y-2');
      menuSpans[1].classList.remove('opacity-0');
      menuSpans[2].classList.remove('-rotate-45', '-translate-y-2');
    }
  }

  menuButton.addEventListener('click', toggleMenu);

  // Smooth Scroll with Offset
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Close mobile menu if open
        if (isMenuOpen) toggleMenu();

        const headerHeight = 80;
        const elementPosition = targetElement.offsetTop - headerHeight;
        
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});
