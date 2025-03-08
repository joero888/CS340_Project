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
