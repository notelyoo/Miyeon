/**
  📁 File: uploadCollection.js
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

let items = [];
let visibleItems = [];
let currentIndex = 0;
const BATCH_SIZE = 30;
let isLoading = false;
let isAdmin = false;
let selectedGroup = null;
let selectedIdols = [];
let sortOrder = 'default';
let filterPreorderActive = false;
let filterExclusiveActive = false;
let filterNoteActive = false;

function sanitizeInput(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

async function checkAdminStatus() {
  try {
    const response = await fetch('/api/check-auth');
    const result = await response.json();
    return result.isAdmin === true;
  } catch (err) {
    console.error('Erreur lors de la vérification de la session admin:', err);
    return false;
  }
}

async function getCsrfToken() {
  const res = await fetch('/api/csrf-token');
  const data = await res.json();
  return data.csrfToken;
}

document.addEventListener('DOMContentLoaded', async () => {
  isAdmin = await checkAdminStatus();
  const adminLoginDiv = document.querySelector('.admin-login');
  if (adminLoginDiv) {
    if (isAdmin) {
      adminLoginDiv.innerHTML = `
        <span class="admin-badge">👑 Admin Mode</span>
        <button id="uploadBtn" class="navbar-upload-btn">Upload Photo</button>
        <button id="exportBtn">Export</button>
        <button id="logoutBtn">Logout</button>
      `;
    } else {
      adminLoginDiv.innerHTML = `<a href="/login">Login</a>`;
    }
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const csrfToken = await getCsrfToken();
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      window.location.reload();
    });
  }

  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      const overlay = document.getElementById('uploadOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  }

  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      window.location.href = '/export';
    });
  }

  const overlayFile = document.getElementById('overlayFile');
  const uploadPreview = document.getElementById('uploadPreview');
  if (overlayFile && uploadPreview) {
    overlayFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          uploadPreview.src = ev.target.result;
          uploadPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const closeUploadModal = document.getElementById('closeUploadModal');
  if (closeUploadModal) {
    closeUploadModal.addEventListener('click', () => {
      const overlay = document.getElementById('uploadOverlay');
      if (overlay) overlay.style.display = 'none';
    });
  }

  const overlayUploadForm = document.getElementById('overlayUploadForm');
  if (overlayUploadForm) {
    overlayUploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(overlayUploadForm);
      const group = sanitizeInput(document.getElementById('overlayGroupName').value);
      const idol = sanitizeInput(document.getElementById('overlayIdolName').value);
      formData.set('group', group);
      formData.set('idol', idol);
      formData.set('album', sanitizeInput(document.getElementById('overlayAlbumName').value));
      formData.set('note', document.getElementById('overlayNote').value);
      formData.set('quantity', document.getElementById('overlayQuantity').value);
      formData.set('preorder', document.getElementById('overlayPreorder').checked ? 'true' : 'false');
      formData.set('exclusive', document.getElementById('overlayExclusive').checked ? 'true' : 'false');
      try {
        const csrfToken = await getCsrfToken();
        const res = await fetch('/upload', {
          method: 'POST',
          headers: { 'X-CSRF-Token': csrfToken },
          body: formData
        });
        const newItem = await res.json();

        newItem.groupName = sanitizeInput(newItem.group || group);
        newItem.idolName = sanitizeInput(newItem.idol || idol);

        newItem.group = newItem.group || newItem.groupName;
        newItem.idol = newItem.idol || newItem.idolName;

        items.push(newItem);
        visibleItems.push(newItem);
        updateCardCount();
        updateFilters();
        overlayUploadForm.reset();
        if (uploadPreview) uploadPreview.style.display = 'none';
        const overlay = document.getElementById('uploadOverlay');
        if (overlay) overlay.style.display = 'none';
        if (typeof fadeOutOverlay === 'function') fadeOutOverlay();
        const confirmation = document.getElementById('uploadConfirmation');
        if (confirmation) {
          confirmation.classList.add('show');
          setTimeout(() => {
            confirmation.classList.remove('show');
          }, 3000);
        }        
      } catch (err) {
        console.error('Upload failed:', err);
      }
    });
  }

  try {
    const response = await fetch('/api/items?ts=' + Date.now());
    const rawItems = await response.json();
    items = rawItems.map(item => ({
      ...item,
      groupName: item.groupName || item.group || '',
      idolName: item.idolName || item.idol || '',
      group: item.group || item.groupName || '',
      idol: item.idol || item.idolName || ''
    }));
    visibleItems = [...items];
    updateCardCount();
    updateFilters();
    renderGalleryBatch();
    setupScrollObserver();
  } catch (err) {
    console.error('Error fetching items:', err);
  }
});

  const searchBar = document.getElementById('searchBar');
  if (searchBar) {
    searchBar.value = '';
    searchBar.addEventListener('input', () => updateFilters());
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
      selectedGroup = null;
      selectedIdols = [];
      filterPreorderActive = false;
      filterExclusiveActive = false;
      filterNoteActive = false;
      if (searchBar) searchBar.value = '';
      if (sortSelect) sortSelect.value = 'default';
      document.querySelectorAll('.filter-option').forEach(btn => btn.classList.remove('selected'));
      updateFilters();
    });
  }
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
  
      } else {
        const idol = btn.getAttribute('data-idol');
        if (!idol) return;
  
        if (selectedIdols.includes(idol)) {
          selectedIdols = selectedIdols.filter(i => i !== idol);
          btn.classList.remove('selected');
        } else {
          selectedIdols.push(idol);
  
          if (idol !== "Group") {
            const found = items.find(i => i.idolName === idol);
            if (found) selectedGroup = found.groupName;
          }
  
          btn.classList.add('selected');
        }
      }
  
      updateFilters();
    });
  });  

  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editItemId').value;
      const updated = {
        idol: sanitizeInput(document.getElementById('editIdol').value),
        group: sanitizeInput(document.getElementById('editGroup').value),      
        album: sanitizeInput(document.getElementById('editAlbum').value),
        preorder: document.getElementById('editPreorder').checked ? 'true' : 'false',
        exclusive: document.getElementById('editExclusive').checked ? 'true' : 'false',
        quantity: document.getElementById('editQuantity').value,
        note: sanitizeInput(document.getElementById('editNote').value)
      };
  
      try {
        const csrfToken = await getCsrfToken();
        const res = await fetch(`/api/items/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify(updated)
        });
        if (res.ok) {
          window.location.reload();
        } else {
          console.error('Failed to update item');
        }
      } catch (err) {
        console.error('Error updating item:', err);
      }
    });
  }  

  const closeEditModal = document.getElementById('closeEditModal');
  if (closeEditModal) {
    closeEditModal.addEventListener('click', () => {
      const editOverlay = document.getElementById('editOverlay');
      if (editOverlay) editOverlay.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    const uploadOverlay = document.getElementById('uploadOverlay');
    const editOverlay = document.getElementById('editOverlay');
    const imageModal = document.getElementById('imageModal');
    if (uploadOverlay && e.target === uploadOverlay) uploadOverlay.style.display = 'none';
    if (editOverlay && e.target === editOverlay) editOverlay.style.display = 'none';
    if (imageModal && e.target === imageModal) imageModal.style.display = 'none';
  });

function updateCardCount() {
  const gallery = document.getElementById('gallery');
  if (gallery) {
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = `My small collection of ${items.length} photocards. 🎀`;
  }
}

function sortItems(data) {
  if (sortOrder === 'default') return data;
  return data.sort((a, b) =>
    sortOrder === 'asc'
      ? a.idol.localeCompare(b.idol)
      : b.idol.localeCompare(a.idol)
  );
}

function generateSidebar(data) {
  const groups = [...new Set(data.map(item => item.groupName))].sort();
  let idols = selectedGroup
    ? [...new Set(data.filter(i => i.groupName === selectedGroup).map(i => i.idolName))].sort()
    : [...new Set(data.map(i => i.idolName))].sort();
  

  const groupList = document.getElementById('groupList');
  const idolList = document.getElementById('idolList');
  if (groupList) groupList.innerHTML = '';
  if (idolList) idolList.innerHTML = '';

  groups.forEach(group => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = group;
    if (selectedGroup === group) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      selectedGroup = (selectedGroup === group) ? null : group;
      selectedIdols = [];
      updateFilters();
    });
    li.appendChild(btn);
    groupList.appendChild(li);
  });

  idols.forEach(idol => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = idol;
    if (selectedIdols.includes(idol)) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      if (selectedIdols.includes(idol)) {
        selectedIdols = selectedIdols.filter(i => i !== idol);
        btn.classList.remove('selected');
      } else {
        selectedIdols.push(idol);
        const found = items.find(i => i.idolName === idol);
      if (found) selectedGroup = found.groupName;
        btn.classList.add('selected');
      }
      updateFilters();
    });
    li.appendChild(btn);
    idolList.appendChild(li);
  });
}

function updateFilters() {
  generateSidebar(items);

  const searchBar = document.getElementById('searchBar');
  const searchTerm = searchBar ? searchBar.value.trim().toLowerCase() : '';

  let filtered = items.filter(item => {
    const isOnlyGroup = selectedIdols.length === 1 && selectedIdols[0] === "Group";

    if (selectedGroup && !isOnlyGroup && item.group !== selectedGroup) return false;
    if (selectedIdols.length > 0 && !selectedIdols.includes(item.idol)) return false;
    if (filterPreorderActive && String(item.preorder) !== 'true') return false;
    if (filterExclusiveActive && String(item.exclusive) !== 'true') return false;
    if (filterNoteActive && (!item.note || item.note.trim() === '')) return false;
    if (searchTerm && !item.idol.toLowerCase().includes(searchTerm)) return false;
    return true;
  });

  filtered = sortItems(filtered);
  visibleItems = filtered;
  currentIndex = 0;

  const gallery = document.getElementById('gallery');
  if (gallery) gallery.innerHTML = '';

  while (currentIndex < visibleItems.length) {
    renderGalleryBatch();
  }
}

function editItem(item) {
  const editOverlay = document.getElementById('editOverlay');
  if (!editOverlay) return;

  document.getElementById('editItemId').value = item.id;
  document.getElementById('editIdol').value = item.idolName || item.idol || '';
  document.getElementById('editGroup').value = item.groupName || item.group || '';
  document.getElementById('editAlbum').value = item.album || '';
  document.getElementById('editPreorder').checked = item.preorder === 'true';
  document.getElementById('editExclusive').checked = item.exclusive === 'true';
  document.getElementById('editQuantity').value = item.quantity || 1;
  document.getElementById('editNote').value = item.note || '';

  editOverlay.style.display = 'flex';
}

function renderGalleryBatch(prepend = false) {
  if (isLoading) return;
  isLoading = true;

  const gallery = document.getElementById('gallery');
  const loadingSpinner = document.getElementById('loadingSpinner');
  if (loadingSpinner) loadingSpinner.style.display = 'block';

  const nextItems = visibleItems.slice(currentIndex, currentIndex + BATCH_SIZE);
nextItems.forEach(item => {
  const div = document.createElement('div');
  div.classList.add('gallery-item');
  div.classList.add('fade-in');
  div.dataset.group = item.groupName;
  div.dataset.idol = item.idolName;

  const cardImage = document.createElement('div');
  cardImage.classList.add('card-image');
  const img = document.createElement('img');
  img.src = item.filePath;
  img.alt = `${item.groupName} - ${item.idolName}`;
  img.loading = "lazy";
  img.addEventListener('click', () => openModal(item));
  cardImage.appendChild(img);
  div.appendChild(cardImage);

  const cardText = document.createElement('div');
  cardText.classList.add('card-text');
  cardText.textContent = `${item.groupName} - ${item.idolName}`;
  cardText.style.marginTop = '5px';
  cardText.style.fontSize = '1.1rem';
  div.appendChild(cardText);

  if (isAdmin) {
    const editBtn = document.createElement('button');
    editBtn.textContent = '📌';
    editBtn.classList.add('edit-btn');
    editBtn.addEventListener('click', () => editItem(item));
    div.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this item?')) return;
      try {
        const csrfToken = await getCsrfToken();
        const res = await fetch(`/api/items/${item.id}`, {
          method: 'DELETE',
          headers: { 'X-CSRF-Token': csrfToken }
        });
        if (res.ok) {
          items = items.filter(i => i.id !== item.id);
          updateCardCount();
          updateFilters();
        } else {
          console.error('Failed to delete item');
        }
      } catch (err) {
        console.error('Error deleting item:', err);
      }
    });
    div.appendChild(deleteBtn);
  }

  if (prepend && gallery.firstChild) {
    gallery.insertBefore(div, gallery.firstChild);
  } else {
    gallery.appendChild(div);
  }
});

  currentIndex += BATCH_SIZE;
  if (loadingSpinner) loadingSpinner.style.display = 'none';
  isLoading = false;
}

function setupScrollObserver() {
  const observerTarget = document.getElementById('scrollTarget');
  if (!observerTarget) return;
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && currentIndex < visibleItems.length) {
      renderGalleryBatch();
    }
  });
  observer.observe(observerTarget);
}

function openModal(item) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  const infoPanel = document.getElementById('infoPanel');
  if (!modal || !modalImg || !infoPanel) return;

  if (item.filePath) {
    modalImg.src = item.filePath;
    modalImg.style.display = "block";
  } else {
    modalImg.src = "";
    modalImg.style.display = "none";
  }

  infoPanel.innerHTML = `
    <div class="modal-header">
      <h2>🎤 ${item.groupName} - ${item.idolName}</h2>
    </div>
    <div class="modal-details">
      ${item.album ? `<p><strong>🎵 Album:</strong> ${item.album}</p>` : ''}
      <p><strong>📆 Pre-Order:</strong> ${item.preorder === 'true' ? 'Yes' : 'No'}</p>
      <p><strong>⭐ Exclusive:</strong> ${item.exclusive === 'true' ? 'Yes' : 'No'}</p>
      <p><strong>📏 Quantity:</strong> ${item.quantity}</p>
      ${item.note ? `<p><strong>📝 Note:</strong> ${item.note}</p>` : ''}
    </div>
  `;

  modal.classList.remove('fade-out', 'zoom-out');
  modal.classList.remove('fade-in');
  modal.style.display = 'none';
  setTimeout(() => {
    modal.style.display = 'flex';
    modal.classList.add('fade-in');
  }, 10);
}

document.addEventListener("click", function (e) {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");

  if (
    sidebar.classList.contains("active") &&
    !sidebar.contains(e.target) &&
    e.target !== toggleBtn
  ) {
    sidebar.classList.remove("active");
  }
});

document.addEventListener("touchstart", function (e) {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");

  if (
    sidebar.classList.contains("active") &&
    !sidebar.contains(e.target) &&
    e.target !== toggleBtn
  ) {
    sidebar.classList.remove("active");
  }
});

const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const collectionContainer = document.querySelector('.collection-container');

if (sidebarToggle && sidebar && collectionContainer) {
  sidebarToggle.addEventListener('click', () => {
    const isActive = sidebar.classList.toggle('active');
    collectionContainer.classList.toggle('sidebar-open', isActive);
  });

  const closeSidebar = (e) => {
    if (
      sidebar.classList.contains('active') &&
      !sidebar.contains(e.target) &&
      e.target !== sidebarToggle
    ) {
      sidebar.classList.remove('active');
      collectionContainer.classList.remove('sidebar-open');
    }
  };

  document.addEventListener('click', closeSidebar);
  document.addEventListener('touchstart', closeSidebar);
}