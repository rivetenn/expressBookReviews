const express = require('express');
const booksDB = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");

const publicUsersRouter = express.Router();

// Register a new user
publicUsersRouter.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Must provide username and password" });
    }

    if (!isValid(username)) {
        users.push({ username, password });
        return res.status(200).json({ message: `User ${username} registered successfully` });
    } else {
        return res.status(400).json({ message: `User ${username} already registered` });
    }
});

// Get the list of books available in the shop
publicUsersRouter.get('/', async (req, res) => {
    try {
        const books = await getBooks();
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get book details based on ISBN
publicUsersRouter.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    getByISBN(isbn)
        .then(result => res.json(result))
        .catch(error => res.status(error.status || 500).json({ message: error.message }));
});

// Get book details based on author
publicUsersRouter.get('/author/:author', (req, res) => {
    const author = req.params.author;
    getBooksByAuthor(author)
        .then(filteredBooks => res.json(filteredBooks))
        .catch(error => res.status(500).json({ message: error.message }));
});

// Get all books based on title
publicUsersRouter.get('/title/:title', (req, res) => {
    const title = req.params.title;
    getBooksByTitle(title)
        .then(filteredBooks => res.json(filteredBooks))
        .catch(error => res.status(500).json({ message: error.message }));
});

// Get book reviews by ISBN
publicUsersRouter.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    getByISBN(isbn)
        .then(result => res.json(result.reviews))
        .catch(error => res.status(error.status || 500).json({ message: error.message }));
});

// Helper functions
function getBooks() {
    return Promise.resolve(booksDB);
}

function getByISBN(isbn) {
    return new Promise((resolve, reject) => {
        const book = booksDB[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ status: 404, message: `ISBN ${isbn} not found` });
        }
    });
}

function getBooksByAuthor(author) {
    return getBooks()
        .then(bookEntries => Object.values(bookEntries))
        .then(books => books.filter(book => book.author === author));
}

function getBooksByTitle(title) {
    return getBooks()
        .then(bookEntries => Object.values(bookEntries))
        .then(books => books.filter(book => book.title === title));
}

module.exports = publicUsersRouter;
