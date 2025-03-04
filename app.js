// App.js

/*
    SETUP
*/
var express = require('express');   // We are using the express library for the web server
var app     = express();            // We need to instantiate an express object to interact with the server in our code
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

PORT        = 64423;                 // Set a port number at the top so it's easy to change in the future

// Database
var db = require('./database/db-connector')

const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
const { debugPort } = require('process');
app.engine('.hbs', engine({extname: ".hbs"}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.

/*
    ROUTES
*/

app.get('/', function(req, res)
{  
  let query1;
  
  if (req.query.title == undefined) {
    if (req.query.isbn == undefined) {
      query1 = "SELECT * FROM Books;";                    // Define our queries 
    }
    else {
      query1 = `SELECT * FROM Books WHERE isbn LIKE "${req.query.isbn}";`;
    }
  }
  else if (req.query.isbn == undefined) {
    if (req.query.title == undefined) {
      query1 = "SELECT * FROM Books;"; 
    }
    else {
      `SELECT * FROM Books WHERE title LIKE "${req.query.title}";`;
    }
  }
  else {
    query1 = `SELECT * FROM Books WHERE (title LIKE "${req.query.title}") AND (isbn LIKE "${req.query.isbn}");`;
  }

  let query2 = "SELECT * FROM Genres;";                   

  db.pool.query(query1, function(error, rows, fields){    // Execute the query

    let books = rows;

    db.pool.query(query2, (error, rows, fields) => {
      let genres = rows;

      let genremap = {}
      genres.map(genreID => {
        let id = parseInt(genreID.genreID, 10);

        genremap[id] = genreID["genreName"];
      })

      books = books.map(book => {
        return Object.assign(book, {genreID: genremap[book.genreID]})
      })

      return res.render('index', {data: books, genres: genres});
    })
  })                                                      
});                                                         // received back from the query

app.post('/add-book-ajax', function(req, res) 
{
  // Capture the incoming data and parse it back to a JS object
  let data = req.body;

  // Capture NULL values
  let genreID = parseInt(data.genreID);
  if (isNaN(genreID))
  {
      genreID = 'NULL'
  }

  let status = parseInt(data.status);
  if (isNaN(status))
  {
      status = 'NULL'
  }

  // Create the query and run it on the database
  query1 = `INSERT INTO Books (ISBN, title, genreID, status) VALUES ('${data.ISBN}', '${data.title}', ${genreID}, ${status})`;
  db.pool.query(query1, function(error, rows, fields){

    // Check to see if there was an error
    if (error) {

      // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
      console.log(error)
      res.sendStatus(400);
    }
    else
    {
      // If there was no error, perform a SELECT * on bsg_people
      query2 = `SELECT * FROM Books;`;
      db.pool.query(query2, function(error, rows, fields){

        let books = rows;

          // If there was an error on the second query, send a 400
        if (error) {
            
          // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
          console.log(error);
          res.sendStatus(400);
        }
        // If all went well, send the results of the query back.
        else
        {
          query3 = `SELECT * FROM Genres;`;
          db.pool.query(query3, function(error, rows, fields){

            let genres = rows;

            let genremap = {}
            genres.map(genreID => {
              let id = parseInt(genreID.genreID, 10);

              genremap[id] = genreID["genreName"];
            })

            books = books.map(book => {
              return Object.assign(book, {genreID: genremap[book.genreID]})
            })
          })

          res.send(books);
        }
      })
    }
  })
});

app.put('/put-book-ajax', function(req,res,next){
  let data = req.body;

  let genre = parseInt(data.genre);
  let title = parseInt(data.title);

  let queryUpdateGenre = `UPDATE Books SET genreID = ? WHERE Books.bookID = ?`;
  let selectGenre = `SELECT * FROM Genres WHERE genreID = ?`

        // Run the 1st query
        db.pool.query(queryUpdateGenre, [genre, title], function(error, rows, fields){
            if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error);
            res.sendStatus(400);
            }

            // If there was no error, we run our second query and return that data so we can use it to update the people's
            // table on the front-end
            else
            {
                // Run the second query
                db.pool.query(selectGenre, [genre], function(error, rows, fields) {

                    if (error) {
                        console.log(error);
                        res.sendStatus(400);
                    } else {
                        res.send(rows);
                    }
                })
            }
})});

app.delete('/delete-book-ajax', function(req, res, next){ // figure out how to get the page to update automatically without refreshing
  let data = req.body;
  let bookID = parseInt(data.id);
  let deleteBook= `DELETE FROM Books WHERE bookID = ?`;
  let deleteBookLoans =  `DELETE FROM BookLoans WHERE bookID = ?`;
  let deleteBookAuthors = `DELETE FROM BookAuthors WHERE bookID = ?`;

  // Run the 1st query
  db.pool.query(deleteBook, [bookID], function(error, rows, fields){
    if (error) {

    // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
    console.log(error);
    res.sendStatus(400);
    }
    else {
      db.pool.query(deleteBookLoans, [bookID], function(error, rows, fields) {
        if (error) {
          console.log(error);
          res.sendStatus(400);
        }
        else {
          db.pool.query(deleteBookAuthors, [bookID], function(error, rows, fields) {
            if (error) {
              console.log(error);
              res.sendStatus(400);
            }
            else {
              res.sendStatus(204);
            }
          })
        }
      })
    }
})});

/*
    LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});