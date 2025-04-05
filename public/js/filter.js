/**
  📁 File: filter.js
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('#filter button');
    const items = document.querySelectorAll('.gallery-item');
  
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const filterType = button.getAttribute('data-filter');
        if(filterType === 'all') {
          items.forEach(item => item.style.display = 'block');
        } else {
          const filterValue = prompt(`Enter ${filterType} name to filter by:`).toLowerCase();
          items.forEach(item => {
            const itemValue = item.dataset[filterType].toLowerCase();
            if(itemValue.includes(filterValue)) {
              item.style.display = 'block';
            } else {
              item.style.display = 'none';
            }
          });
        }
      });
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.sidebar-toggle');
  const sidebar = document.getElementById('sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
});