// even wachten tot alles geladen is
document.addEventListener('DOMContentLoaded', function() {
  
  // -- VARIABELEN VOOR FILTEREN EN ZOEKEN --
  var searchInput = document.getElementById('searchInput');
  var statusFilter = document.getElementById('statusFilter');
  let activeCount = document.getElementById('activeCount'); 
  let tableBody = document.getElementById('patientTableBody');

  // -- VARIABELEN VOOR SORTEREN --
  let currentSortColumn = "";
  let sortAscending = true;
  var sortHeaders = document.querySelectorAll('.sortable');

  // --- FUNCTIE: ZOEKEN EN FILTEREN ---
  function filterDashboard() {
    let searchQuery = searchInput.value.toLowerCase();
    let filterValue = statusFilter.value;
    let visibleRows = 0; 

    // haal de rijen vers op (handig als ze gesorteerd zijn verplaatst)
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

      // Laat zien of verberg
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
    // Array.from is handig om er een echte array van te maken, anders werkt .sort() niet
    let rowsArray = Array.from(tableBody.querySelectorAll('.table-row'));

    rowsArray.sort(function(a, b) {
      let valA = a.getAttribute('data-' + column);
      let valB = b.getAttribute('data-' + column);

      // check of het een woord is of een getal
      // let op: als je getallen niet naar int omzet, zet javascript '10' voor '2'. Heel irritant.
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
      return 0; // ze zijn precies gelijk
    });

    // gooi de body leeg
    tableBody.innerHTML = "";
    
    // plak ze er opnieuw in, in de nieuwe volgorde
    for (let i = 0; i < rowsArray.length; i++) {
      tableBody.appendChild(rowsArray[i]);
    }
  }


  // --- EVENT LISTENERS AANZETTEN ---

  // zoeken en dropdown
  searchInput.addEventListener('input', filterDashboard);
  statusFilter.addEventListener('change', filterDashboard);

  // dubbelklik listeners voor het sorteren toevoegen
  for (let i = 0; i < sortHeaders.length; i++) {
    sortHeaders[i].addEventListener('dblclick', function() {
      let column = this.getAttribute('data-sort');
      
      // wissel pijltje om als we op dezelfde kolom klikken
      if (currentSortColumn === column) {
        sortAscending = !sortAscending;
      } else {
        sortAscending = true;
        currentSortColumn = column;
      }

      // reset alle pijltjes eerst naar leeg
      for (let j = 0; j < sortHeaders.length; j++) {
        sortHeaders[j].querySelector('.arrow').innerText = "";
      }

      // zet het pijltje bij de aangeklikte header
      if (sortAscending) {
        this.querySelector('.arrow').innerText = "▲";
      } else {
        this.querySelector('.arrow').innerText = "▼";
      }

      // roep sorteerfunctie aan
      sortTable(column, sortAscending);
    });
  }
  
});