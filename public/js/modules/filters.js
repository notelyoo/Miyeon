/**
  📁 File: filters.js 
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

  let selectedGroup = null;
  let selectedIdols = [];
  let sortOrder = 'default';
  let filterPreorderActive = false;
  let filterExclusiveActive = false;
  let filterNoteActive = false;
  
  export function getActiveFilters() {
    return { selectedGroup, selectedIdols };
  }
  
  export function setSelectedGroup(group) {
    selectedGroup = group;
  }
  
  export function toggleIdol(idol) {
    if (selectedIdols.includes(idol)) {
      selectedIdols = selectedIdols.filter(i => i !== idol);
    } else {
      selectedIdols.push(idol);
    }
  }
  
  export function applyFilters(items) {
    const searchBar = document.getElementById('searchBar');
    const searchTerm = searchBar ? searchBar.value.trim().toLowerCase() : '';
  
    return items.filter(item => {
      const isOnlyGroup = selectedIdols.length === 1 && selectedIdols[0] === 'Group';
  
      if (selectedGroup && !isOnlyGroup && item.group !== selectedGroup) return false;
      if (selectedIdols.length > 0 && !selectedIdols.includes(item.idol)) return false;
      if (filterPreorderActive && String(item.preorder) !== 'true') return false;
      if (filterExclusiveActive && String(item.exclusive) !== 'true') return false;
      if (filterNoteActive && (!item.note || item.note.trim() === '')) return false;
      if (searchTerm && !item.idol.toLowerCase().includes(searchTerm)) return false;
  
      return true;
    });
  }
  
  export function sortItems(data) {
    if (sortOrder === 'default') return data;
    if (sortOrder === 'qty') {
      return data.sort((a, b) => (parseInt(b.quantity) || 1) - (parseInt(a.quantity) || 1));
    }    
    return data.sort((a, b) =>
      sortOrder === 'asc'
        ? a.idol.localeCompare(b.idol)
        : b.idol.localeCompare(a.idol)
    );
  }  
  
  export function resetFilters() {
    selectedGroup = null;
    selectedIdols = [];
    sortOrder = 'default';
    filterPreorderActive = false;
    filterExclusiveActive = false;
    filterNoteActive = false;
  }
  
  export function setupFilters(updateFilters) {
    document.querySelectorAll('.filter-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-filter');
  
        if (type === 'preorder') {
          filterPreorderActive = !filterPreorderActive;
          btn.classList.toggle('selected', filterPreorderActive);
        } else if (type === 'exclusive') {
          filterExclusiveActive = !filterExclusiveActive;
          btn.classList.toggle('selected', filterExclusiveActive);
        } else if (type === 'note') {
          filterNoteActive = !filterNoteActive;
          btn.classList.toggle('selected', filterNoteActive);
        }
  
        updateFilters();
      });
    });
  }
  
  export function setupSearchAndSort(updateFilters) {
    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
      searchBar.value = '';
      searchBar.addEventListener('input', updateFilters);
    }
  
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        sortOrder = sortSelect.value;
        updateFilters();
      });
    }
  
    const showAllBtn = document.getElementById('showAllBtn');
    if (showAllBtn) {
      showAllBtn.addEventListener('click', () => {
        resetFilters();
        if (searchBar) searchBar.value = '';
        if (sortSelect) sortSelect.value = 'default';
        document.querySelectorAll('.filter-option').forEach(btn => btn.classList.remove('selected'));
        updateFilters();
      });
    }
  }   