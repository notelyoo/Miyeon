/**
  📁 File: search.js
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

  document.addEventListener("DOMContentLoaded", function () {
    const filterButtons = document.querySelectorAll("#sidebar ul li button[data-idol]");
    const galleryItems = document.querySelectorAll(".gallery-item");
    const showAllBtn = document.getElementById("showAllBtn");
  
    function filterByIdol(selectedIdol) {
      galleryItems.forEach(item => {
        const idol = item.getAttribute("data-idol");
  
        if (selectedIdol === "Group") {
          item.style.display = (idol === "Group") ? "" : "none";
        } else {
          item.style.display = (idol === selectedIdol) ? "" : "none";
        }
      });
  
      filterButtons.forEach(btn => btn.classList.remove("selected"));
      const selectedButton = document.querySelector(`#sidebar ul li button[data-idol="${selectedIdol}"]`);
      if (selectedButton) {
        selectedButton.classList.add("selected");
      }
    }
  
    filterButtons.forEach(button => {
      button.addEventListener("click", function () {
        const selectedIdol = this.getAttribute("data-idol");
        filterByIdol(selectedIdol);
      });
    });
  
    if (showAllBtn) {
      showAllBtn.addEventListener("click", function () {
        galleryItems.forEach(item => {
          item.style.display = "";
        });
        filterButtons.forEach(btn => btn.classList.remove("selected"));
      });
    }
  });  