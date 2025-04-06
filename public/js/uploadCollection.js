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
  const BATCH_SIZE = 30;
  let isAdmin = false;
  
  export function sanitizeInput(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }
  
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
            await fetchItemsAndRender();
            closeEditModal();
            const toast = document.getElementById('uploadConfirmation');
            if (toast && isAdmin) {
              toast.querySelector('span').textContent = 'Card updated!';
              toast.classList.add('show');
              setTimeout(() => toast.classList.remove('show'), 3000);
            }
          } else {
            console.error('Failed to update item');
          }
        } catch (err) {
          console.error('Error updating item:', err);
        }
      });
    }
  
    const toast = document.getElementById('uploadConfirmation');
    if (toast && !isAdmin) {
      toast.remove();
    } else if (toast) {
      toast.classList.remove('show');
      toast.style.display = 'none';
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