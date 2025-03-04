document.addEventListener("DOMContentLoaded", function () {  
  // Use event delegation to listen for delete button clicks on the table
  document.getElementById("book-table").addEventListener("click", function (event) {
      if (event.target && event.target.classList.contains("delete-button")) {
          let bookID = event.target.getAttribute("data-bookid"); // Get book ID
          deleteBook(bookID); // Call delete function
      }
  });
});


function deleteBook(bookID) {
  // Put our data we want to send in a javascript object
  let data = {
    id: bookID
  };

  // Setup our AJAX request
  var xhttp = new XMLHttpRequest();
  xhttp.open("DELETE", "/delete-book-ajax", true);
  xhttp.setRequestHeader("Content-type", "application/json");

  // Handle the response
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && xhttp.status == 204) {

      // Add the new data to the table
      deleteRow(bookID);

    }
    else if (xhttp.readyState == 4 && xhttp.status != 204) {
      console.log("Error deleting book.")
    }
  }
  // Send the request and wait for the response
  xhttp.send(JSON.stringify(data));
}

function deleteRow(bookID){
  /*
  let table = document.getElementById("book-table");
  for (let i = 0, row; row = table.rows[i]; i++) {
    //iterate through rows
    //rows would be accessed using the "row" variable assigned in the for loop
    if (table.rows[i].getAttribute("data-value") == bookID) {
      table.deleteRow(i);
      break;
    }
  }
  */
  let row = document.getElementById(`row-${bookID}`); // Find the row using its ID
  if (row) {
    row.remove(); // Instantly remove the row from the DOM
  }
}