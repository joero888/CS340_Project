document.querySelector("#add-genre-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const genreName = formData.get("genreName");

    if (!genreName || genreName.trim() === "") {
        alert("Genre name cannot be empty!");
        return;
    }

    const response = await fetch("/add-genre-ajax", {  // ✅ Match this to app.js route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genreName })
    });

    if (response.ok) {
        const newGenre = await response.json(); // Get the newly added genre

        // Dynamically add the new genre row to the table
        const table = document.querySelector("tbody");
        const newRow = document.createElement("tr");
        newRow.id = `row-${newGenre.genreID}`;
        newRow.innerHTML = `
            <td>${newGenre.genreID}</td>
            <td>${newGenre.genreName}</td>
            <td><button class="delete-button" data-genreid="${newGenre.genreID}">Delete</button></td>
        `;

        table.appendChild(newRow); // Append the new row without reloading

        // Add event listener to the new delete button
        newRow.querySelector(".delete-button").addEventListener("click", async () => {
            const response = await fetch(`/delete-genre/${newGenre.genreID}`, { method: "DELETE" });
            if (response.ok) {
                newRow.remove(); // Remove row from the table
            } else {
                alert("Error deleting genre.");
            }
        });

        event.target.reset(); // Clear the form
    } else {
        const errorData = await response.json();
        alert("Error adding genre: " + errorData.error);
    }
});
