// add book
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


  // delete book
  document.addEventListener("DOMContentLoaded", function () {  
    // Event delegation for delete buttons
    document.getElementById("book-table").addEventListener("click", function (event) {
        if (event.target && event.target.classList.contains("delete-button")) {
            let bookID = event.target.getAttribute("data-bookid"); 
            deleteBook(bookID); 
        }
    });
  });
  
  // DELETE Book
  function deleteBook(bookID) {
    let data = { id: bookID };
  
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/delete-book-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");
  
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 204) {
            deleteRow(bookID);
        } else if (xhttp.readyState == 4) {
            console.log("Error deleting book.");
        }
    };
  
    xhttp.send(JSON.stringify(data));
  }
  
  // Remove Row from Table
  function deleteRow(bookID) {
    let row = document.getElementById(`row-${bookID}`); 
    if (row) row.remove();
  }
  
  // update book
  // Get the objects we need to modify
let updateBookForm = document.getElementById('update-book-form-ajax');

// Modify the objects we need
updateBookForm.addEventListener("submit", function (e) {
    // Prevent the form from submitting
    e.preventDefault();

    // Get form fields we need to get data from
    let inputBookID = document.getElementById("mySelect");  // Ensure this contains bookID
    let inputGenre = document.getElementById("input-genre-update");

    // Get the values from the form fields
    let bookIDValue = parseInt(inputBookID.value);  // Convert to number
    let genreValue = parseInt(inputGenre.value);    // Convert to number

    // Ensure values are valid
    if (isNaN(bookIDValue) || isNaN(genreValue)) {
        console.error("Invalid input: bookID or genreID is missing or not a number.");
        return;
    }

    // Put our data in a JavaScript object
    let data = {
        bookID: bookIDValue,
        genre: genreValue
    };

    console.log("Sending AJAX request to /put-book-ajax with data:", JSON.stringify(data));

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "/put-book-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        console.log("AJAX ReadyState:", xhttp.readyState, "Status:", xhttp.status);

        if (xhttp.readyState == 4 && xhttp.status == 200) {
            console.log("Server Response:", xhttp.responseText);
            updateRow(JSON.parse(xhttp.responseText), bookIDValue);
        } else if (xhttp.readyState == 4) {
            console.error("Error updating book. Response:", xhttp.responseText);
        }
    };

    // Send the request
    xhttp.send(JSON.stringify(data));
});

// Function to update the table row after update
function updateRow(updatedBook, bookID) {
    console.log("Updating row for bookID:", bookID, "New Data:", updatedBook);

    let table = document.getElementById("book-table");

    for (let i = 0, row; row = table.rows[i]; i++) {
        if (table.rows[i].getAttribute("id") === `row-${bookID}`) {  
            let updateRowIndex = table.getElementsByTagName("tr")[i];

            // Find the correct <td> for genre
            let genreCell = updateRowIndex.getElementsByTagName("td")[3];  

            // Update Genre Name
            genreCell.innerHTML = updatedBook.genreName;

            console.log("Updated row successfully.");
        }
    }
}

  