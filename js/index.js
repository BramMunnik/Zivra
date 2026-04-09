document.addEventListener('DOMContentLoaded', function() {
  
  var searchInput = document.getElementById('searchInput');
  var statusFilter = document.getElementById('statusFilter');
  let activeCount = document.getElementById('activeCount'); 
  let tableBody = document.getElementById('patientTableBody');

  let currentSortColumn = "";
  let sortAscending = true;
  var sortHeaders = document.querySelectorAll('.sortable');

  function filterDashboard() {
    let searchQuery = searchInput.value.toLowerCase();
    let filterValue = statusFilter.value;
    let visibleRows = 0; 

    let rows = document.querySelectorAll('.table-row');

    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];

      let name = row.getAttribute('data-name').toLowerCase();
      let satisfaction = parseInt(row.getAttribute('data-satisfaction'));
      let energy = parseInt(row.getAttribute('data-energy'));
      let pain = parseInt(row.getAttribute('data-pain'));

      let matchesSearch = false;
      if (name.includes(searchQuery)) {
        matchesSearch = true;
      }

      let matchesFilter = true;
      if (filterValue === 'attention') {
        if (pain >= 7 || energy <= 4) {
          matchesFilter = true;
        } else {
          matchesFilter = false;
        }
      } else if (filterValue === 'good') {
        if (satisfaction >= 8 && pain <= 3) {
          matchesFilter = true;
        } else {
          matchesFilter = false;
        }
      }

      if (matchesSearch == true && matchesFilter == true) {
        row.style.display = 'grid'; 
        visibleRows = visibleRows + 1;
      } else {
        row.style.display = 'none';
      }
    }

    activeCount.innerText = visibleRows;
  }


  // --- FUNCTIE: SORTEREN ---
  function sortTable(column, isAsc) {
    let rowsArray = Array.from(tableBody.querySelectorAll('.table-row'));

    rowsArray.sort(function(a, b) {
      let valA = a.getAttribute('data-' + column);
      let valB = b.getAttribute('data-' + column);

      if (column !== 'name') {
        valA = parseInt(valA);
        valB = parseInt(valB);
      } else {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) {
        if (isAsc) return -1; else return 1;
      }
      if (valA > valB) {
        if (isAsc) return 1; else return -1;
      }
      return 0;
    });

    tableBody.innerHTML = "";

    for (let i = 0; i < rowsArray.length; i++) {
      tableBody.appendChild(rowsArray[i]);
    }
  }


  // --- EVENT LISTENERS AANZETTEN ---

  searchInput.addEventListener('input', filterDashboard);
  statusFilter.addEventListener('change', filterDashboard);

  for (let i = 0; i < sortHeaders.length; i++) {
    sortHeaders[i].addEventListener('dblclick', function() {
      let column = this.getAttribute('data-sort');

      if (currentSortColumn === column) {
        sortAscending = !sortAscending;
      } else {
        sortAscending = true;
        currentSortColumn = column;
      }

      for (let j = 0; j < sortHeaders.length; j++) {
        sortHeaders[j].querySelector('.arrow').innerText = "";
      }

      if (sortAscending) {
        this.querySelector('.arrow').innerText = "▲";
      } else {
        this.querySelector('.arrow').innerText = "▼";
      }

      sortTable(column, sortAscending);
    });
  }
  
});