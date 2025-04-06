/**
  📁 File: counter.js 
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

  export function updateCardCount(items) {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
  
    const subtitle = document.querySelector('.subtitle');
    if (!subtitle) return;
  
    const total = items.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    subtitle.textContent = `My small collection of ${total} photocards. 🎀`;
  }  