/**
  📁 File: counter.js 
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

  export function updateCardCount(visibleItems, totalItems = []) {
    const subtitle = document.querySelector('.subtitle');
    if (!subtitle) return;
  
    const totalVisible = visibleItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    const totalAll = totalItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  
    if (totalVisible === totalAll || totalItems.length === 0) {
      subtitle.textContent = `My small collection of ${totalVisible} photocards. 🎀`;
    } else {
      subtitle.textContent = `${totalVisible} lovely photocards in view. 🌸`;
    }
  }  