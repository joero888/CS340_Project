// Handle Adding an Author
document.querySelector("#add-author-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const authorName = formData.get("authorName");

    if (!authorName || authorName.trim() === "") {
        alert("Author name cannot be empty!");
        return;
    }

    const response = await fetch("/add-author", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName })
    });

    if (response.ok) {
        const newAuthor = await response.json(); // Get the newly added author

        // Dynamically add the new author row to the table
        const table = document.querySelector("tbody");
        const newRow = document.createElement("tr");
        newRow.id = `row-${newAuthor.authorID}`;
        newRow.innerHTML = `
            <td>${newAuthor.authorID}</td>
            <td>${newAuthor.authorName}</td>
            <td><button class="delete-button" data-authorid="${newAuthor.authorID}">Delete</button></td>
        `;

        table.appendChild(newRow);

        // Add event listener to the new delete button
        newRow.querySelector(".delete-button").addEventListener("click", async () => {
            const response = await fetch(`/delete-author/${newAuthor.authorID}`, { method: "DELETE" });
            if (response.ok) {
                newRow.remove(); // Remove row from the table
            } else {
                alert("Error deleting author.");
            }
        });

        event.target.reset(); // Clear the form
    } else {
        const errorData = await response.json();
        alert("Error adding author: " + errorData.error);
    }
});

// Handle Delete Author Button Click
document.querySelectorAll(".delete-button").forEach(button => {
    button.addEventListener("click", async () => {
        const authorID = button.dataset.authorid;

        const response = await fetch(`/delete-author/${authorID}`, { method: "DELETE" });

        if (response.ok) {
            document.querySelector(`#row-${authorID}`).remove(); // Remove author from table
        } else {
            alert("Error deleting author.");
        }
    });
});
