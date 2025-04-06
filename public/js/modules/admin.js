/**
  📁 File: admin.js 
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

  export async function checkAdminStatus() {
    try {
      const response = await fetch('/api/check-auth');
      const result = await response.json();
      return result.isAdmin === true;
    } catch (err) {
      console.error('Error checking admin session:', err);
      return false;
    }
  }
  
  export async function getCsrfToken() {
    const res = await fetch('/api/csrf-token');
    const data = await res.json();
    return data.csrfToken;
  }
  
  export function setupAdminUI(isAdmin) {
    const container = document.querySelector('.admin-login');
    if (!container) return;
  
    container.innerHTML = isAdmin
      ? `<span class="admin-badge">👑 Admin Mode</span>
         <button id="uploadBtn" class="navbar-upload-btn">Upload Photo</button>
         <button id="exportBtn">Export</button>
         <button id="logoutBtn">Logout</button>`
      : `<a href="/login">Login</a>`;
  
    if (isAdmin) {
      document.getElementById('uploadBtn')?.addEventListener('click', () => {
        const event = new CustomEvent('open-upload-modal');
        window.dispatchEvent(event);
      });
  
      document.getElementById('exportBtn')?.addEventListener('click', () => {
        window.location.href = '/export';
      });
  
      document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        const csrfToken = await getCsrfToken();
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'X-CSRF-Token': csrfToken }
        });
        window.location.reload();
      });
    }
  }  