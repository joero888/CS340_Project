document.addEventListener("DOMContentLoaded", function () {  
  let addBookForm = document.getElementById("add-book-form-ajax");

  addBookForm.addEventListener("submit", function (e) {
      e.preventDefault();

      let inputISBN = document.getElementById("input-isbn");
      let inputTitle = document.getElementById("input-title");
      let inputGenreID = document.getElementById("input-genreID-ajax");
      let inputStatus = document.getElementById("input-status");

      let data = {
          ISBN: inputISBN.value,
          title: inputTitle.value,
          genreID: inputGenreID.value, 
          status: inputStatus.value
      };

      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", "/add-book-ajax", true);
      xhttp.setRequestHeader("Content-type", "application/json");

      xhttp.onreadystatechange = function() {
          if (xhttp.readyState == 4 && xhttp.status == 200) {
              let newBook = JSON.parse(xhttp.responseText);
              addRowToTable(newBook);

              inputISBN.value = '';
              inputTitle.value = '';
              inputGenreID.value = '';
              inputStatus.value = '';
          } else if (xhttp.readyState == 4) {
              console.log("Error adding book.");
          }
      };

      xhttp.send(JSON.stringify(data));
  });
});

// Add New Row to Table
function addRowToTable(newBook) {
  let currentTable = document.getElementById("book-table");

  let row = document.createElement("TR");
  row.setAttribute('id', `row-${newBook.bookID}`);

  row.innerHTML = `
      <td>${newBook.bookID}</td>
      <td>${newBook.ISBN}</td>
      <td>${newBook.title}</td>
      <td>${newBook.genreID}</td>
      <td>${newBook.status}</td>
      <td><button class="delete-button" data-bookid="${newBook.bookID}">Delete</button></td>
  `;

  currentTable.appendChild(row);
}
