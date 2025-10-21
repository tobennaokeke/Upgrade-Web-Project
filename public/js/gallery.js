// gallery.js (Modified)

document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.querySelector('.gallery-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    // Note: We initialize galleryItems as an empty array now.
    let galleryItems = []; 
    
    // Lightbox elements... (kept the same)
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    // Pagination elements... (kept the same)
    const itemsPerPage = 20;
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfoSpan = document.getElementById('page-info');
    let currentPage = 1;
    let filteredItems = []; // Initialized as empty
    let currentLightboxIndex = 0;


    // --- NEW: Dynamic Content Loading Function ---
    async function loadGalleryImages() {
        console.log('Fetching images from server...');
        try {
            // Note: Use your full server URL if running the backend on a different port/host
            const response = await fetch('http://localhost:3000/api/gallery-images'); 
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Data is an array of objects: [{src: '...', caption: '...', category: '...'}]
            const data = await response.json(); 
            
            // Clear existing content
            galleryGrid.innerHTML = ''; 
            
            const newGalleryItems = data.map(item => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                // item.category will contain the space-separated categories from MySQL
                galleryItem.setAttribute('data-category', item.category); 
                galleryItem.setAttribute('data-media-type', 'image'); 
                
                // Construct the HTML using the data from the server
                galleryItem.innerHTML = `
                    <div class="media-wrapper">
                        <img src="${item.src}" alt="${item.caption}"> 
                        <div class="overlay"><p>View Image</p></div>
                    </div>
                    <div class="item-caption">${item.caption}</div>
                `;
                
                galleryGrid.appendChild(galleryItem);
                return galleryItem;
            });
            
            // 1. Update the global array used by all other functions
            galleryItems = newGalleryItems;
            
            // 2. Initialize the display (filters to 'all', resets page to 1)
            filterGallery('all'); 

        } catch (error) {
            console.error('Error loading gallery images. Ensure your Node.js server is running on port 3000.', error);
            galleryGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: red;">Could not load gallery content. Please check the server connection.</p>';
        }
    }


    // --- Filtering Logic (Keep the existing code) ---
    function filterGallery(filterValue) {
        // ... (existing code to update buttons and filter items) ...
        filterButtons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.filter-btn[data-filter="${filterValue}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        filteredItems = galleryItems.filter(item => {
            if (filterValue === 'all') {
                return true;
            }
            const categories = item.getAttribute('data-category').split(' ');
            return categories.includes(filterValue);
        });

        currentPage = 1;
        updateGalleryDisplay();
    }

    // Attach listeners to filter buttons (Keep the existing code)
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');
            filterGallery(filterValue);
        });
    });


    // --- Pagination Logic (Keep the existing code) ---
    function updateGalleryDisplay() {
        // ... (existing pagination logic) ...
        const totalItems = filteredItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (currentPage < 1 && totalPages > 0) currentPage = 1;
        if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
        if (totalPages === 0) currentPage = 0;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = currentPage * itemsPerPage;

        // Reset display of ALL original items
        galleryItems.forEach(item => item.classList.add('hidden'));

        // Show items for the current page
        for (let i = 0; i < totalItems; i++) {
            const item = filteredItems[i];
            
            if (i >= startIndex && i < endIndex) {
                setTimeout(() => item.classList.remove('hidden'), 50); 
            } else {
                 item.classList.add('hidden');
            }
        }

        // Update controls
        pageInfoSpan.textContent = `Page ${currentPage > 0 ? currentPage : 0} of ${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages || totalPages === 0;
    }

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateGalleryDisplay();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < Math.ceil(filteredItems.length / itemsPerPage)) {
            currentPage++;
            updateGalleryDisplay();
        }
    });


    // --- Lightbox Logic (Keep the existing code) ---
    function openLightbox(index) {
        // ... (existing lightbox logic using filteredItems array) ...
        currentLightboxIndex = index;
        const item = filteredItems[currentLightboxIndex];
        const mediaType = item.getAttribute('data-media-type');
        
        const src = item.querySelector('.media-wrapper img') ? item.querySelector('.media-wrapper img').src : '';
        const caption = item.querySelector('.item-caption').textContent;

        lightboxImage.style.display = 'none';
        lightboxVideo.style.display = 'none';

        if (mediaType === 'image') {
            lightboxImage.src = src;
            lightboxImage.style.display = 'block';
        } else if (mediaType === 'video') {
            lightboxVideo.src = src; 
            lightboxVideo.style.display = 'block';
        }
        
        lightboxCaption.textContent = caption;
        lightbox.style.display = 'flex';
        
        updateLightboxNav();
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        lightboxVideo.pause();
    }
    
    function navigateLightbox(direction) {
        currentLightboxIndex += direction;
        if (currentLightboxIndex < 0) {
            currentLightboxIndex = filteredItems.length - 1;
        } else if (currentLightboxIndex >= filteredItems.length) {
            currentLightboxIndex = 0;
        }
        openLightbox(currentLightboxIndex);
    }

    function updateLightboxNav() {
        const disabled = filteredItems.length <= 1;
        lightboxPrev.style.opacity = disabled ? '0.5' : '1';
        lightboxNext.style.opacity = disabled ? '0.5' : '1';
        lightboxPrev.disabled = disabled;
        lightboxNext.disabled = disabled;
    }

    galleryGrid.addEventListener('click', (e) => {
        let item = e.target.closest('.gallery-item');
        if (item) {
            const indexInFiltered = filteredItems.findIndex(fi => fi === item);
            if (indexInFiltered !== -1) {
                 openLightbox(indexInFiltered);
            }
        }
    });
    
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));
    lightbox.addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') {
            closeLightbox();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        }
    });


    // --- INITIALIZATION: Start the process by loading content dynamically ---
    loadGalleryImages(); 
});