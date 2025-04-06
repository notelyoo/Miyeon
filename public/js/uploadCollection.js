/**
  📁 File: uploadCollection.js 
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

  import { updateCardCount } from './modules/counter.js';
  import {
    openEditModal, closeEditModal,
    openUploadModal, closeUploadModal,
    openImageModal, closeImageModal,
    setupModalOverlayClose
  } from './modules/modal.js';
  import {
    applyFilters, setupFilters, sortItems,
    resetFilters, setupSearchAndSort
  } from './modules/filters.js';
  import { renderFullGallery } from './modules/gallery.js';
  import { generateSidebar } from './modules/sidebar.js';
  import { setupAdminUI, checkAdminStatus, getCsrfToken } from './modules/admin.js';
  import { setupUploadModal, handleUploadForm } from './modules/upload.js';
  
  let items = [], visibleItems = [];
  let isAdmin = false;
  
  export function getItems() {
    return items;
  }
  
  export function updateFilters() {
    generateSidebar(items, updateFilters);
    visibleItems = applyFilters(items);
    visibleItems = sortItems(visibleItems);
  
    const gallery = document.getElementById('gallery');
    if (gallery) gallery.innerHTML = '';
  
    renderFullGallery(visibleItems, isAdmin);
    updateCardCount(visibleItems, items);
  }
  
  async function fetchItemsAndRender() {
    try {
      const res = await fetch('/api/items?ts=' + Date.now());
      const rawItems = await res.json();
      items = rawItems.map(item => ({
        ...item,
        groupName: item.groupName || item.group || '',
        idolName: item.idolName || item.idol || '',
        group: item.group || item.groupName || '',
        idol: item.idol || item.idolName || ''
      }));
      visibleItems = [...items];
      updateCardCount(items);
      updateFilters();
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  }
  
  function addItemToGallery(item) {
    item.groupName = item.group || '';
    item.idolName = item.idol || '';
    item.group = item.group || item.groupName;
    item.idol = item.idol || item.idolName;
  
    items.push(item);
    visibleItems.push(item);
    updateCardCount(items);
    updateFilters();
  }
  
  function removeItemFromGallery(itemId) {
    items = items.filter(i => i.id !== itemId);
    visibleItems = visibleItems.filter(i => i.id !== itemId);
    updateCardCount(items);
    updateFilters();
  }
  
  export { addItemToGallery, removeItemFromGallery };
  
  document.addEventListener('DOMContentLoaded', async () => {
    isAdmin = await checkAdminStatus();
    setupAdminUI(isAdmin);
    setupUploadModal();
    handleUploadForm(items, visibleItems, updateCardCount, updateFilters, addItemToGallery);
    setupFilters(updateFilters);
    setupSearchAndSort(updateFilters);
    await fetchItemsAndRender();
    setupModalOverlayClose();
    setupSidebarToggle();
  
    if (isAdmin) {
      const overlay = document.getElementById('globalDropOverlay');
      const fileInput = document.getElementById('overlayFile');
      const preview = document.getElementById('uploadPreview');
      const uploadOverlay = document.getElementById('uploadOverlay');
  
      if (overlay && fileInput && preview && uploadOverlay) {
        window.addEventListener('dragover', (e) => {
          e.preventDefault();
          const uploadOverlay = document.getElementById('uploadOverlay');
          const isOpen = uploadOverlay?.style.display === 'flex';
          if (isOpen) {
            overlay.classList.add('active');
          }
        });        
  
        window.addEventListener('dragleave', (e) => {
          if (e.relatedTarget === null || e.relatedTarget === document.body) {
            overlay.classList.remove('active');
          }
        });
  
        window.addEventListener('drop', (e) => {
          e.preventDefault();
          overlay.classList.remove('active');
  
          const isUploadModalOpen = uploadOverlay.style.display === 'flex';
          if (!isUploadModalOpen) return;
  
          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
  
            const reader = new FileReader();
            reader.onload = (ev) => {
              preview.src = ev.target.result;
              preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
          }
        });
      }
    }
  
    const editForm = document.getElementById('editForm');
    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editItemId').value;
        const updated = {
          idol: document.getElementById('editIdol').value.trim(),
          group: document.getElementById('editGroup').value.trim(),
          album: document.getElementById('editAlbum').value.trim(),
          preorder: document.getElementById('editPreorder').checked ? 'true' : 'false',
          exclusive: document.getElementById('editExclusive').checked ? 'true' : 'false',
          quantity: document.getElementById('editQuantity').value,
          note: document.getElementById('editNote').value.trim()
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
            await fetchItemsAndRender();
            closeEditModal();
            showToast('edit', 'Card updated!');
          } else {
            console.error('Failed to update item');
          }
        } catch (err) {
          console.error('Error updating item:', err);
        }
      });
    }
  
    if (isAdmin) {
      const toastIds = ['uploadConfirmation', 'editConfirmation', 'deleteConfirmation'];
      toastIds.forEach(id => {
        const toast = document.getElementById(id);
        if (toast && !toast.classList.contains('show')) {
          toast.style.display = 'none';
        }
      });
    }
  
    const closeBtn = document.getElementById('closeEditModal');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeEditModal);
    }
  });
  
  function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebar‑toggle');
    const sidebar = document.getElementById('sidebar');
    const collectionContainer = document.querySelector('.collection-container');
  
    if (!sidebarToggle || !sidebar || !collectionContainer) return;
  
    sidebarToggle.addEventListener('click', () => {
      const isActive = sidebar.classList.toggle('active');
      collectionContainer.classList.toggle('sidebar-open', isActive);
    });
  
    let preventNextCardClick = false;
  
    document.addEventListener('click', (e) => {
      const clickedInsideSidebar = sidebar.contains(e.target);
      const clickedToggle = e.target === sidebarToggle;
  
      if (sidebar.classList.contains('active') && !clickedInsideSidebar && !clickedToggle) {
        sidebar.classList.remove('active');
        collectionContainer.classList.remove('sidebar-open');
        preventNextCardClick = true;
      }
    });
  
    document.querySelector('#gallery')?.addEventListener('click', (e) => {
      if (preventNextCardClick) {
        e.stopPropagation();
        e.preventDefault();
        preventNextCardClick = false;
      }
    }, true);
  }
  
  function showToast(type, message) {
    const toastMap = {
      upload: 'uploadConfirmation',
      edit: 'editConfirmation',
      delete: 'deleteConfirmation'
    };
    const id = toastMap[type];
    const toast = document.getElementById(id);
    if (toast) {
      toast.style.display = 'block';
      toast.querySelector('span').textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  }
  
  window.showToast = showToast;  