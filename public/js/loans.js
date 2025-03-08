console.log("loans.js loaded");

// Ensure script runs only after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Loaded - loans.js Running");

    // Select the form
    const loanForm = document.querySelector("#add-loan-form");
    if (!loanForm) {
        console.error("Loan form not found!");
        return;
    }

    loanForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Ensure inputs exist before reading their values
        const returnDateInput = document.querySelector("input[name='returnDate']");
        const loanDateInput = document.querySelector("input[name='loanDate']");
        const borrowerDropdown = document.querySelector("select[name='borrowerID']");

        if (!returnDateInput || !loanDateInput || !borrowerDropdown) {
            console.error("One or more form elements are missing!");
            return;
        }

        // Get input values
        const returnDate = returnDateInput.value.trim();
        const loanDate = loanDateInput.value.trim();
        const borrowerID = borrowerDropdown.value;

        // Debugging Log
        console.log("Loan Form Submitted - Sending Data:", { returnDate, loanDate, borrowerID });

        // Ensure all fields are filled
        if (!returnDate || !loanDate || !borrowerID) {
            alert("All fields must be filled!");
            return;
        }

        try {
            // Send data to backend
            const response = await fetch("/add-loan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ returnDate, loanDate, borrowerID })
            });

            // Get raw response text for debugging
            const responseText = await response.text();
            console.log("Raw Server Response:", responseText);

            if (!response.ok) {
                throw new Error(`Server error: ${responseText}`);
            }

            // Parse response
            const newLoan = JSON.parse(responseText);
            console.log("Loan Added Successfully:", newLoan);

            // Add new loan to table
            const table = document.querySelector("tbody");
            const newRow = document.createElement("tr");
            newRow.id = `row-${newLoan.loanID}`;
            newRow.innerHTML = `
                <td>${newLoan.loanID}</td>
                <td>${newLoan.returnDate}</td>
                <td>${newLoan.loanDate}</td>
                <td>${newLoan.borrowerName}</td>
                <td><button class="delete-button" data-loanid="${newLoan.loanID}">Delete</button></td>
            `;

            table.appendChild(newRow);

            // Add event listener to the new delete button
            newRow.querySelector(".delete-button").addEventListener("click", async () => {
                await deleteLoan(newLoan.loanID, newRow);
            });

            // Reset form
            loanForm.reset();
        } catch (error) {
            console.error("Error Adding Loan", error);
            alert("Error adding Loan " + error.message);
        }
    });

    // ✅ Handle Delete Loan
    document.querySelector("tbody").addEventListener("click", async (event) => {
        if (event.target && event.target.classList.contains("delete-button")) {
            const loanID = event.target.dataset.loanid;
            const row = document.querySelector(`#row-${loanID}`);

            if (!row) {
                console.warn(`Row for loan ${loanID} not found.`);
                return;
            }

            await deleteLoan(loanID, row);
        }
    });

    // ✅ Function to handle loan deletion
    async function deleteLoan(loanID, rowElement) {
        try {
            console.log(`Attempting to delete loan ID: ${loanID}`);
            const response = await fetch(`/delete-loan/${loanID}`, { method: "DELETE" });

            if (!response.ok) {
                throw new Error("Failed to delete loan.");
            }

            console.log(`Loan ID ${loanID} deleted successfully`);
            rowElement.remove();
        } catch (error) {
            console.error("Error deleting loan:", error);
            alert("Error deleting loan.");
        }
    }
});
