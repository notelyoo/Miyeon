/**
  📁 File: gallery.js 
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

  import { openEditModal, openImageModal, showToast } from './modal.js';
  import { getCsrfToken } from './admin.js';
  import { removeItemFromGallery, updateFilters } from '../uploadCollection.js';
  import { updateCardCount } from './counter.js';
  import { getItems } from '../uploadCollection.js';
  
  export function renderFullGallery(visibleItems, isAdmin) {
    const gallery = document.getElementById('gallery');
    if (!gallery || !visibleItems) return;
  
    gallery.innerHTML = '';
  
    visibleItems.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('gallery-item', 'fade-in');
      div.dataset.group = item.groupName;
      div.dataset.idol = item.idolName;

      if (isAdmin) {
        div.addEventListener('dblclick', () => openEditModal(item));
      }
  
      const cardImage = document.createElement('div');
      cardImage.classList.add('card-image');
      const img = document.createElement('img');
      img.src = item.filePath;
      img.alt = `${item.groupName} - ${item.idolName}`;
      img.loading = 'lazy';
      img.addEventListener('click', () => openImageModal(item));
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
        editBtn.addEventListener('click', () => openEditModal(item));
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
              removeItemFromGallery(item.id);
              updateCardCount(getItems());
              updateFilters();
              showToast('delete', 'Card deleted!');
            } else {
              console.error('Failed to delete item');
            }
          } catch (err) {
            console.error('Error deleting item:', err);
          }
        });
        div.appendChild(deleteBtn);
      }
  
      gallery.appendChild(div);
    });
  }  