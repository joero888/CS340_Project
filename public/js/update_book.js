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
