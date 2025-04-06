/**
  📁 File: upload.js 
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

  import { closeUploadModal } from './modal.js';
  import { getCsrfToken } from './admin.js';
  import { addItemToGallery } from '../uploadCollection.js';
  
  export function setupUploadModal() {
    const fileInput = document.getElementById('overlayFile');
    const preview = document.getElementById('uploadPreview');
    const overlay = document.getElementById('uploadOverlay');
  
    if (overlay) {
      overlay.addEventListener('dragover', (e) => {
        e.preventDefault();
        overlay.classList.add('dragover');
      });
  
      overlay.addEventListener('dragleave', () => {
        overlay.classList.remove('dragover');
      });
  
      overlay.addEventListener('drop', (e) => {
        e.preventDefault();
        overlay.classList.remove('dragover');
  
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          fileInput.files = e.dataTransfer.files;
  
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (preview) {
              preview.src = ev.target.result;
              preview.style.display = 'block';
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && preview) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          preview.src = ev.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  
    window.addEventListener('open-upload-modal', () => {
      if (overlay) overlay.style.display = 'flex';
    });
  
    const closeUploadBtn = document.getElementById('closeUploadModal');
    closeUploadBtn?.addEventListener('click', closeUploadModal);
  }
  
  export function handleUploadForm() {
    const form = document.getElementById('overlayUploadForm');
    const preview = document.getElementById('uploadPreview');
  
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const formData = new FormData(form);
      const group = document.getElementById('overlayGroupName').value.trim();
      const idol = document.getElementById('overlayIdolName').value.trim();
  
      formData.set('group', group);
      formData.set('idol', idol);
      formData.set('album', document.getElementById('overlayAlbumName').value.trim());
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
  
        newItem.groupName = newItem.group || group;
        newItem.idolName = newItem.idol || idol;
        newItem.group = newItem.group || newItem.groupName;
        newItem.idol = newItem.idol || newItem.idolName;
  
        addItemToGallery(newItem);
  
        form.reset();
        if (preview) preview.style.display = 'none';
        closeUploadModal();
  
        if (window.showToast) {
          window.showToast('upload', 'Card uploaded!');
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    });
  }  