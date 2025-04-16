/**
  📁 File: darkMode.js 
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
*/

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('themeToggle');
    const html = document.body;
    const savedTheme = localStorage.getItem('theme');
  
    if (savedTheme === 'dark') {
      html.classList.add('dark-mode');
      toggle.textContent = '🌞';
    } else {
      html.classList.remove('dark-mode');
      toggle.textContent = '🌙';
    }
  
    toggle?.addEventListener('click', () => {
      const isDark = html.classList.toggle('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      toggle.textContent = isDark ? '🌞' : '🌙';
    });
  });  