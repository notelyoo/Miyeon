/**
  📁 File: sidebar.js 
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

  import { getActiveFilters, setSelectedGroup, toggleIdol } from './filters.js';

  export function generateSidebar(items, updateFilters) {
    const { selectedGroup, selectedIdols } = getActiveFilters();
    const groupList = document.getElementById('groupList');
    const idolList = document.getElementById('idolList');
  
    if (groupList) groupList.innerHTML = '';
    if (idolList) idolList.innerHTML = '';
  
    const groups = [...new Set(items.map(i => i.groupName))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  
    const idols = selectedGroup
      ? [...new Set(items.filter(i => i.groupName === selectedGroup).map(i => i.idolName))]
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
      : [...new Set(items.map(i => i.idolName))]
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
  
    groups.forEach(group => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = group;
      if (selectedGroup === group) btn.classList.add('selected');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedGroup(selectedGroup === group ? null : group);
        updateFilters();
      });      
      li.appendChild(btn);
      groupList.appendChild(li);
    });
  
    idols.forEach(idol => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = idol;
      if (selectedIdols.includes(idol)) btn.classList.add('selected');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleIdol(idol);
        updateFilters();
      });
      li.appendChild(btn);
      idolList.appendChild(li);
    });
  }  