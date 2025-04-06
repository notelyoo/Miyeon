/**
  📁 File: modal.js 
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

  function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }
  
  export function openEditModal(item) {
    const editOverlay = document.getElementById('editOverlay');
    if (!editOverlay) return;
  
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editIdol').value = decodeHtml(item.idolName || item.idol || '');
    document.getElementById('editGroup').value = decodeHtml(item.groupName || item.group || '');
    document.getElementById('editAlbum').value = decodeHtml(item.album || '');
    document.getElementById('editPreorder').checked = item.preorder === 'true';
    document.getElementById('editExclusive').checked = item.exclusive === 'true';
    document.getElementById('editQuantity').value = item.quantity || 1;
    document.getElementById('editNote').value = decodeHtml(item.note || '');
  
    editOverlay.style.display = 'flex';
  }
  
  export function closeEditModal() {
    const editOverlay = document.getElementById('editOverlay');
    if (editOverlay) editOverlay.style.display = 'none';
  }
  
  export function openUploadModal() {
    const overlay = document.getElementById('uploadOverlay');
    if (overlay) overlay.style.display = 'flex';
  }
  
  export function closeUploadModal() {
    const overlay = document.getElementById('uploadOverlay');
    if (!overlay) return;
  
    overlay.style.display = 'none';
  
    const form = document.getElementById('overlayUploadForm');
    if (form) form.reset();
  
    const preview = document.getElementById('uploadPreview');
    if (preview) {
      preview.src = '#';
      preview.style.display = 'none';
    }
  }
  
  export function openImageModal(item) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const infoPanel = document.getElementById('infoPanel');
    if (!modal || !modalImg || !infoPanel) return;
  
    if (item.filePath) {
      modalImg.src = item.filePath;
      modalImg.style.display = 'block';
    } else {
      modalImg.src = '';
      modalImg.style.display = 'none';
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
  
    modal.classList.remove('fade-out', 'zoom-out', 'fade-in');
    modal.style.display = 'none';
    setTimeout(() => {
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
    }, 10);
  }
  
  export function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.style.display = 'none';
  }
  
  export function setupModalOverlayClose() {
    window.addEventListener('click', (e) => {
      const uploadOverlay = document.getElementById('uploadOverlay');
      const editOverlay = document.getElementById('editOverlay');
      const imageModal = document.getElementById('imageModal');
  
      if (uploadOverlay && e.target === uploadOverlay) closeUploadModal();
      if (editOverlay && e.target === editOverlay) closeEditModal();
      if (imageModal && e.target === imageModal) closeImageModal();
    });
  }
  
  export function showToast(type = 'upload', message = '') {
    const idMap = {
      upload: 'uploadConfirmation',
      edit: 'editConfirmation',
      delete: 'deleteConfirmation'
    };
  
    const toastId = idMap[type];
    const toast = document.getElementById(toastId);
    if (!toast) return;
  
    toast.querySelector('span').textContent = message || toast.querySelector('span').textContent;
    toast.style.display = 'block';
    toast.classList.add('show');
  
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }  