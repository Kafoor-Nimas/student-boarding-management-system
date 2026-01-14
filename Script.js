function includeHTML() {
  // Header
  fetch('header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;

      // ✅ RUN AFTER HEADER LOADS
      const menuToggle = document.getElementById("menuToggle");
      const nav = document.querySelector("nav");
      const authButtons = document.getElementById("nav-btn");

      menuToggle.addEventListener("click", () => {
        nav.classList.toggle("active");
        authButtons.classList.toggle("active");
      });
    });

  // Footer
  fetch('footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    });
}
window.onload = includeHTML;

document.addEventListener('DOMContentLoaded', function() {
    // Function to set active navigation link
    function setActiveNav() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // Mobile menu toggle (if header has mobile menu)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
});
