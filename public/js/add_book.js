let addBookForm = document.getElementById("add-book-form-ajax");

addBookForm.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("Form submitted.")

  let inputISBN = document.getElementById("input-isbn");
  let inputTitle = document.getElementById("input-title");
  let inputGenreID = document.getElementById("input-genreID-ajax");
  let inputStatus = document.getElementById("input-status");

  let isbnValue = inputISBN.value; 
  let titleValue = inputTitle.value; 
  let genreIDValue = inputGenreID.value;
  let statusValue = inputStatus.value;

  let data = {
    ISBN: isbnValue,
    title: titleValue,
    genreID: genreIDValue, 
    status: statusValue
  }

  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/add-book-ajax", true);
  xhttp.setRequestHeader("Content-type", "application/json");

  xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      addRowToTable(xhttp.response);

      inputISBN.value = '';
      inputTitle.value = '';
      inputGenreID.value = '';
      inputStatus.value = '';
    }
    else if (xhttp.readyState == 4 && xhttp.status != 200) {
      console.log("There was an error with the input.", xhttp.status, xhttp.readyState);
    }
  };

  xhttp.send(JSON.stringify(data));
})

addRowToTable = (data) => {
  let currentTable = document.getElementById("book-table");

  let newRowIndex = currentTable.rows.length;

  let parsedData = JSON.parse(data);
  let newRow = parsedData[parsedData.length - 1]

  let row = document.createElement("TR");
  let bookIDCell = document.createElement("TD");
  let isbnCell = document.createElement("TD");
  let titleCell = document.createElement("TD");
  let genreIDCell = document.createElement("TD");
  let statusCell = document.createElement("TD");
  let deleteCell = document.createElement("TD");

  bookIDCell.innerText = newRow.bookID;
  isbnCell.innerText = newRow.ISBN;
  titleCell.innerText = newRow.title;
  genreIDCell.innerText = newRow.genreID;
  statusCell.innerText = newRow.status;

  // Create delete button properly
  let deleteButton = document.createElement("button");
  deleteButton.innerHTML = "Delete";
  deleteButton.classList.add("delete-button"); // Add the correct class
  deleteButton.setAttribute("data-bookid", newRow.bookID); // Store bookID for event delegation
  deleteCell.appendChild(deleteButton );

  row.appendChild(bookIDCell);
  row.appendChild(isbnCell);
  row.appendChild(titleCell);
  row.appendChild(genreIDCell);
  row.appendChild(statusCell);
  row.appendChild(deleteCell);

  // Add a row attribute so the deleteRow function can find a newly added row
  row.setAttribute('id', "row-" + newRow.bookID);

  currentTable.appendChild(row);

  let selectMenu = document.getElementById("mySelect");
    let option = document.createElement("option");
    option.text = newRow.fname + ' ' +  newRow.lname;
    option.value = newRow.id;
    selectMenu.add(option);
}