/**
  📁 File: login.js
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

function sanitizeInput(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = sanitizeInput(document.getElementById('username').value.trim());
    const password = sanitizeInput(document.getElementById('password').value.trim());

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = '/collection';
      } else {
        alert('❌ Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de la tentative de connexion:', error);
      alert('Erreur serveur. Veuillez réessayer plus tard.');
    }
  });

  async function getCsrfToken() {
    const res = await fetch('/api/csrf-token');
    const data = await res.json();
    return data.csrfToken;
  }
});