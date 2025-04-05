
/**
  📁 File: main.js
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

  function sanitizeInput(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    const adminLoginDiv = document.querySelector('.admin-login');
    const isAdmin = await checkAdminStatus();
  
    if (adminLoginDiv) {
      if (isAdmin) {
        adminLoginDiv.innerHTML = `
          <span class="admin-badge">👑 Admin Mode</span>
          <button id="exportBtn">Export</button>
          <button id="logoutBtn">Logout</button>
        `;
  
        document.getElementById('logoutBtn').addEventListener('click', async () => {
          const csrfToken = await getCsrfToken();
          await fetch('/api/logout', {
            method: 'POST',
            headers: { 'X-CSRF-Token': csrfToken }
          });
          window.location.reload();
        });
  
        document.getElementById('exportBtn').addEventListener('click', () => {
          window.location.href = '/export';
        });
  
        document.querySelectorAll('.admin-only').forEach(el => {
          el.style.display = 'inline-block';
        });
      } else {
        adminLoginDiv.innerHTML = `<a href="/login">Login</a>`;
        document.querySelectorAll('.admin-only').forEach(el => {
          el.style.display = 'none';
        });
      }
    }
  
    const podiumBlock = document.getElementById('triggerTop10');
    const idolModal = document.getElementById('idolRankingModal');
    const closeBtn = idolModal?.querySelector('.close');
  
    if (podiumBlock && idolModal) {
      podiumBlock.addEventListener('click', () => {
        idolModal.style.display = 'flex';
      });
    }
  
    if (closeBtn && idolModal) {
      closeBtn.addEventListener('click', () => {
        idolModal.style.display = 'none';
      });
    }
  
    window.addEventListener('click', (e) => {
      if (e.target === idolModal) {
        idolModal.style.display = 'none';
      }
    });
  
    window.addEventListener('touchstart', (e) => {
      if (e.target === idolModal) {
        idolModal.style.display = 'none';
      }
    });
  });
  
  function autoscaleText() {
    const cards = document.querySelectorAll('.card-text');
    cards.forEach(card => {
      const parentWidth = card.parentElement.offsetWidth - 20;
      let fontSize = 18;
      card.style.fontSize = fontSize + 'px';
      while (card.scrollWidth > parentWidth && fontSize > 8) {
        fontSize -= 0.5;
        card.style.fontSize = fontSize + 'px';
      }
    });
  }
  
  window.addEventListener('load', autoscaleText);
  window.addEventListener('resize', autoscaleText);
  
  async function checkAdminStatus() {
    try {
      const response = await fetch('/api/check-auth');
      const result = await response.json();
      return result.isAdmin === true;
    } catch (err) {
      console.error('Erreur lors de la vérification de session:', err);
      return false;
    }
  }
  
  async function getCsrfToken() {
    const res = await fetch('/api/csrf-token');
    const data = await res.json();
    return data.csrfToken;
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('sidebar‑toggle');
    const sidebar = document.getElementById('sidebar');
    const collectionContainer = document.querySelector('.collection-container');
    const overlay = document.getElementById('sidebarOverlay');
  
    if (!toggleBtn || !sidebar || !collectionContainer || !overlay) {
      console.warn("Sidebar toggle : un élément est manquant.");
      return;
    }
  
    sidebar.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.add('active');
      overlay.classList.add('visible');
      collectionContainer.classList.add('sidebar-open');
    });
  
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('visible');
      collectionContainer.classList.remove('sidebar-open');
    });
  });  