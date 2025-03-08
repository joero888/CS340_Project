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

// Create Genre
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



/*
    LISTENER
*/
app.listen(PORT, function() {            
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
