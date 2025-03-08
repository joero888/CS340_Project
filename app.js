/*
    SETUP
*/
var express = require('express');   
var app = express();            
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

PORT = 64423;

// Database
var db = require('./database/db-connector');

const { engine } = require('express-handlebars');
app.engine('.hbs', engine({ extname: ".hbs" }));  
app.set('view engine', '.hbs');                

/*
    ROUTES
*/


app.get('/', (req, res) => {
    res.render('index');  
});

// READ Books
app.get('/books', function(req, res) {  
  let query1 = `
      SELECT Books.bookID, Books.ISBN, Books.title, Books.status, Genres.genreName 
      FROM Books 
      LEFT JOIN Genres ON Books.genreID = Genres.genreID;
  `;

  db.pool.query(query1, function(error, books) {    
      if (error) {
          console.error("Database query error:", error);
          return res.sendStatus(500);
      }

      console.log("Books Data Retrieved:", books);  // Log the books data

      let query2 = "SELECT * FROM Genres;"; 

      db.pool.query(query2, function(error, genres) {
          if (error) {
              console.error("Database query error:", error);
              return res.sendStatus(500);
          }

          console.log("Genres Data Retrieved:", genres);  // Log the genres data
          return res.render('books', { data: books, genres: genres });
      });
  });
});


// CREATE Book
app.post('/add-book-ajax', function(req, res) {
    let data = req.body;

    let genreID = parseInt(data.genreID);
    if (isNaN(genreID)) genreID = null;

    let status = parseInt(data.status);
    if (isNaN(status)) status = null;

    let query = `INSERT INTO Books (ISBN, title, genreID, status) VALUES (?, ?, ?, ?)`;
    db.pool.query(query, [data.ISBN, data.title, genreID, status], function(error, result) {
        if (error) {
            console.error(error);
            return res.sendStatus(400);
        }

        let selectQuery = `SELECT * FROM Books WHERE bookID = ?;`;
        db.pool.query(selectQuery, [result.insertId], function(error, rows) {
            if (error) {
                console.error(error);
                return res.sendStatus(400);
            }
            res.json(rows[0]);
        });
    });
});

// UPDATE Book
app.put('/put-book-ajax', function(req, res) {
    let data = req.body;
    let bookID = parseInt(data.bookID);
    let genreID = parseInt(data.genre);

    if (isNaN(bookID) || isNaN(genreID)) {
        return res.status(400).json({ error: "Invalid bookID or genreID" });
    }

    let queryUpdateGenre = `UPDATE Books SET genreID = ? WHERE Books.bookID = ?`;
    let selectUpdatedBook = `
        SELECT Books.bookID, Books.ISBN, Books.title, Books.status, Genres.genreName 
        FROM Books 
        LEFT JOIN Genres ON Books.genreID = Genres.genreID 
        WHERE Books.bookID = ?;
    `;

    db.pool.query(queryUpdateGenre, [genreID, bookID], function(error) {
        if (error) {
            console.error("Update error:", error);
            return res.sendStatus(400);
        }

        db.pool.query(selectUpdatedBook, [bookID], function(error, rows) {
            if (error) {
                console.error("Select updated book error:", error);
                return res.sendStatus(400);
            }
            res.json(rows[0]);  // Send the updated row
        });
    });
});

// DELETE Book
app.delete('/delete-book-ajax', function(req, res) {
    let data = req.body;
    let bookID = parseInt(data.id);

    if (isNaN(bookID)) {
        return res.status(400).json({ error: "Invalid book ID" });
    }

    let query = `DELETE FROM Books WHERE bookID = ?`;

    db.pool.query(query, [bookID], function(error, result) {
        if (error) {
            console.error(error);
            return res.sendStatus(400);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Book not found" });
        }

        res.sendStatus(204);
    });
});


// READ Genres
app.get('/genres', function(req, res) {
    let query = "SELECT * FROM Genres;";  // Query to get all genres

    db.pool.query(query, function(error, genres) {
        if (error) {
            console.error("Database query error:", error);
            return res.sendStatus(500);
        }

        console.log("Genres Data Retrieved:", genres);  // Log retrieved genres
        return res.render('genres', { data: genres });  // Render genres.hbs
    });
});

// Create Genre and Insert into Database
app.post('/add-genre-ajax', function(req, res) {
    let data = req.body;

    let query = `INSERT INTO Genres (genreName) VALUES (?)`;
    db.pool.query(query, [data.genreName], function(error, result) {
        if (error) {
            console.error(error);
            return res.sendStatus(400);
        }

        // Fetch the newly inserted genre
        let selectQuery = `SELECT * FROM Genres WHERE genreID = ?;`;
        db.pool.query(selectQuery, [result.insertId], function(error, rows) {
            if (error) {
                console.error(error);
                return res.sendStatus(400);
            }
            res.json(rows[0]); // Send the newly added genre back to the frontend
        });
    });
});

// DELETE Genre
app.delete('/delete-genre/:id', async (req, res) => {
    const genreID = req.params.id;

    try {
        await db.pool.query("DELETE FROM Genres WHERE genreID = ?", [genreID]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting genre:", error);
        res.status(500).send("Internal Server Error");
    }
});

// READ Authors
app.get('/authors', function(req, res) {
    let query = "SELECT * FROM Authors;";  // Query to get all authors

    db.pool.query(query, function(error, authors) {
        if (error) {
            console.error("Database query error:", error);
            return res.sendStatus(500);
        }

        console.log("Authors Data Retrieved:", authors);  // Log retrieved authors
        return res.render('authors', { data: authors });  // Render authors.hbs
    });
});

// Create Author and Insert into Database
app.post('/add-author', function(req, res) {
    let data = req.body;

    let query = `INSERT INTO Authors (authorName) VALUES (?)`;
    db.pool.query(query, [data.authorName], function(error, result) {
        if (error) {
            console.error(error);
            return res.sendStatus(400);
        }

        // Fetch the newly inserted author
        let selectQuery = `SELECT * FROM Authors WHERE authorID = ?;`;
        db.pool.query(selectQuery, [result.insertId], function(error, rows) {
            if (error) {
                console.error(error);
                return res.sendStatus(400);
            }
            res.json(rows[0]); // Send the newly added author back to the frontend
        });
    });
});

// DELETE Author
app.delete('/delete-author/:id', async (req, res) => {
    const authorID = req.params.id;

    try {
        await db.pool.query("DELETE FROM Authors WHERE authorID = ?", [authorID]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting author:", error);
        res.status(500).send("Internal Server Error");
    }
});

// READ Borrowers
app.get('/borrowers', function(req, res) {
    let query = "SELECT * FROM Borrowers;";  // Query to get all borrowers

    db.pool.query(query, function(error, borrowers) {
        if (error) {
            console.error("Database query error:", error);
            return res.sendStatus(500);
        }

        console.log("Borrowers Data Retrieved:", borrowers);  // Log retrieved borrowers
        return res.render('borrowers', { data: borrowers });  // Render borrowers.hbs
    });
});

// Create Borrowers and Insert into Database
app.post('/add-borrower', function(req, res) {
    let data = req.body;
    console.log("📌 Received Borrower Data:", data);  // ✅ Debug Log

    if (!data.borrowerName || !data.borrowerEmail) {
        console.error("❌ Missing borrowerName or borrowerEmail:", data);
        return res.status(400).json({ error: "Borrower name and email cannot be empty" });
    }

    let query = `INSERT INTO Borrowers (borrowerName, borrowerEmail) VALUES (?, ?)`;  
    db.pool.query(query, [data.borrowerName, data.borrowerEmail], function(error, result) {
        if (error) {
            console.error("❌ Database Insert Error:", error);
            return res.status(400).json({ error: "Database error: " + error.message });
        }

        // ✅ Fetch the newly inserted borrower
        let selectQuery = `SELECT * FROM Borrowers WHERE borrowerID = ?;`;
        db.pool.query(selectQuery, [result.insertId], function(error, rows) {
            if (error) {
                console.error("❌ Error fetching new borrower:", error);
                return res.status(400).json({ error: "Failed to fetch borrower" });
            }
            console.log("✅ New Borrower Added:", rows[0]);  // ✅ Debug log
            res.json(rows[0]);  // ✅ Send borrower data to frontend
        });
    });
});


// DELETE Borrowers
app.delete('/delete-borrower/:id', async (req, res) => {
    const borrowerID = req.params.id;

    try {
        await db.pool.query("DELETE FROM Borrowers WHERE borrowerID = ?", [borrowerID]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting borrower:", error);
        res.status(500).send("Internal Server Error");
    }
});

// READ Loans
app.get('/loans', function(req, res) {
    let query1 = `
        SELECT Loans.loanID, Loans.returnDate, Loans.loanDate, 
               Borrowers.borrowerID, Borrowers.borrowerName 
        FROM Loans
        LEFT JOIN Borrowers ON Loans.borrowerID = Borrowers.borrowerID;
    `;

    db.pool.query(query1, function(error, loans) {
        if (error) {
            console.error("❌ Database query error (Loans):", error);
            return res.sendStatus(500);
        }

        let query2 = "SELECT borrowerID, borrowerName FROM Borrowers;";  // Fetch borrowers

        db.pool.query(query2, function(error, borrowers) {
            if (error) {
                console.error("❌ Database query error (Borrowers):", error);
                return res.sendStatus(500);
            }

            console.log("✅ Loans & Borrowers Retrieved:", { loans, borrowers });  // Debugging log
            return res.render('loans', { data: loans, borrowers: borrowers });
        });
    });
});


// Create Loan and Insert into Database
app.post('/add-loan', function(req, res) {
    let data = req.body;

    // Validate input
    if (!data.returnDate || !data.loanDate || !data.borrowerID) {
        console.error("❌ Missing loan input data:", data);
        return res.status(400).json({ error: "All fields are required!" });
    }

    let query = `INSERT INTO Loans (returnDate, loanDate, borrowerID) VALUES (?, ?, ?)`;

    db.pool.query(query, [data.returnDate, data.loanDate, data.borrowerID], function(error, result) {
        if (error) {
            console.error("❌ Error inserting loan:", error);
            return res.status(500).json({ error: "Failed to insert loan" });
        }

        // ✅ Fetch the newly inserted loan with borrower name
        let selectQuery = `
            SELECT Loans.loanID, Loans.returnDate, Loans.loanDate, 
                   Borrowers.borrowerID, Borrowers.borrowerName 
            FROM Loans
            LEFT JOIN Borrowers ON Loans.borrowerID = Borrowers.borrowerID
            WHERE Loans.loanID = ?;
        `;

        db.pool.query(selectQuery, [result.insertId], function(error, rows) {
            if (error) {
                console.error("❌ Error fetching new loan:", error);
                return res.status(500).json({ error: "Failed to retrieve new loan" });
            }

            console.log("✅ Loan Added Successfully:", rows[0]);  // Debugging log
            res.json(rows[0]); // Send the new loan back to frontend
        });
    });
});

// DELETE Loan
app.delete('/delete-loan/:id', async (req, res) => {
    const loanID = req.params.id;

    try {
        let deleteQuery = "DELETE FROM Loans WHERE loanID = ?";
        db.pool.query(deleteQuery, [loanID], function(error, result) {
            if (error) {
                console.error("❌ Error deleting loan:", error);
                return res.status(500).json({ error: "Failed to delete loan" });
            }

            if (result.affectedRows === 0) {
                console.warn(`❌ Loan ID ${loanID} not found.`);
                return res.status(404).json({ error: "Loan not found" });
            }

            console.log(`✅ Loan ID ${loanID} deleted successfully.`);
            res.sendStatus(204);
        });
    } catch (error) {
        console.error("❌ Unexpected error deleting loan:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


/*
    LISTENER
*/
app.listen(PORT, function() {            
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
