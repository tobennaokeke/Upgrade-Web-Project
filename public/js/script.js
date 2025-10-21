document.addEventListener('DOMContentLoaded', () => {
    // --- 1. NAVBAR TOGGLE LOGIC (NEW) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            // Toggles the 'show-menu' class on the <nav> element, which controls visibility via CSS
            mainNav.classList.toggle('show-menu');
            
            // For better user experience, we swap the icon (bars <-> X)
            const icon = menuToggle.querySelector('i');
            if (mainNav.classList.contains('show-menu')) {
                // Menu is open, show the 'X' icon (close)
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                // Menu is closed, show the 'bars' icon (open)
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- 2. SCROLL TO TOP LOGIC (Existing) ---
    const scrollToTopBtn = document.getElementById('scrollToTop');

    // Threshold (in pixels) for when the button should appear
    const scrollThreshold = 300; 

    // Show/Hide Button on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    // Handle Click for Smooth Scroll
    scrollToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Use smooth scrolling behaviour (supported in most modern browsers)
        window.scrollTo({
            top: 0,
            behavior: 'smooth' 
        });
    });
});
