console.log("borrowers.js is loaded and running"); // Ensure script is loaded

// Handle Adding a Borrower
document.querySelector("#add-borrower-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get input values
    const borrowerName = document.querySelector("input[name='borrowerName']").value.trim();
    const borrowerEmail = document.querySelector("input[name='borrowerEmail']").value.trim();

    // ✅ Debugging: Log the values before sending
    console.log("Borrower Form Submitted - Sending Data:", { borrowerName, borrowerEmail });

    // Validate input
    if (!borrowerName || !borrowerEmail) {
        alert("Borrower name and email cannot be empty!");
        return;
    }

    try {
        // Send the data to the server
        const response = await fetch("/add-borrower", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ borrowerName, borrowerEmail })  
        });

        console.log("Fetch request sent - Waiting for response");

        // Get raw response text for debugging
        const responseText = await response.text();
        console.log("Raw Server Response:", responseText);

        // Check if request was successful
        if (!response.ok) {
            throw new Error(`Server error: ${responseText}`);
        }

        // Parse the response JSON
        const newBorrower = JSON.parse(responseText);
        console.log("Borrower Added Successfully:", newBorrower);

        // Dynamically add the new borrower row to the table
        const table = document.querySelector("tbody");
        const newRow = document.createElement("tr");
        newRow.id = `row-${newBorrower.borrowerID}`;
        newRow.innerHTML = `
            <td>${newBorrower.borrowerID}</td>
            <td>${newBorrower.borrowerName}</td>
            <td>${newBorrower.borrowerEmail || "N/A"}</td>
            <td><button class="delete-button" data-borrowerid="${newBorrower.borrowerID}">Delete</button></td>
        `;

        table.appendChild(newRow);

        // Add delete event listener to the new button
        newRow.querySelector(".delete-button").addEventListener("click", async () => {
            await deleteBorrower(newBorrower.borrowerID, newRow);
        });

        // Reset form
        event.target.reset();
    } catch (error) {
        console.error("Error Adding Borrower:", error);
        alert("Error adding borrower: " + error.message);
    }
});

// ✅ Function to handle borrower deletion
async function deleteBorrower(borrowerID, rowElement) {
    try {
        console.log(`Attempting to delete borrower ID: ${borrowerID}`);
        const response = await fetch(`/delete-borrower/${borrowerID}`, { method: "DELETE" });

        if (!response.ok) {
            throw new Error("Failed to delete borrower.");
        }

        console.log(`Borrower ID ${borrowerID} deleted successfully`);
        rowElement.remove();
    } catch (error) {
        console.error("Error deleting borrower:", error);
        alert("Error deleting borrower.");
    }
}

// ✅ Event Delegation for Delete Buttons (Handles dynamically added elements)
document.querySelector("tbody").addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("delete-button")) {
        const borrowerID = event.target.dataset.borrowerid;
        const row = document.querySelector(`#row-${borrowerID}`);

        if (!row) {
            console.warn(`Row for borrower ${borrowerID} not found.`);
            return;
        }

        await deleteBorrower(borrowerID, row);
    }
});
