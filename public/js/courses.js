document.addEventListener('DOMContentLoaded', () => {

  // Get all the filter buttons and course cards
  // UPDATED: Using '.category-filter .filter-btn' to find your buttons
  const filterButtons = document.querySelectorAll('.category-filter .filter-btn');

  // UPDATED: Using '.course-grid .course-card' to find your course cards
  const courseCards = document.querySelectorAll('.course-grid .course-card');

  // Add a click event listener to each button
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Manage the "active" button style
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Get the filter value from the clicked button
      const filterValue = button.getAttribute('data-filter');

      // Filter the course cards
      courseCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        // Check if the card should be shown or hidden
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.classList.remove('hide'); // Show the card
        } else {
          card.classList.add('hide'); // Hide the card
        }
      });
    });
  });
});