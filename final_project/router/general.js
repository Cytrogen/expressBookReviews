const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const getBooks = () => {
    return new Promise((resolve, reject) => {
        if (Object.keys(books).length === 0) {
            reject({message: "No books found"});
        } else {
            resolve(JSON.stringify(books, null, 4));
        }
    });
}

const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(JSON.stringify(book, null, 4));
        } else {
            reject({message: "Book not found"});
        }
    });
}

const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        const bookList = Object.values(books);
        const filteredBooks = bookList.filter(book => book.author === author);
        if (filteredBooks.length > 0) {
            resolve(JSON.stringify(filteredBooks, null, 4));
        } else {
            reject({message: "Book not found"});
        }
    });
}

const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        const bookList = Object.values(books);
        const filteredBooks = bookList.filter(book => book.title === title);
        if (filteredBooks.length > 0) {
            resolve(JSON.stringify(filteredBooks, null, 4));
        } else {
            reject({message: "Book not found"});
        }
    });
}


public_users.post("/register", (req,res) => {
    let formData = req.body;
    if (!formData["username"]) {
        return res.status(400).json({message: "Username is required"});
    } else if (!formData["password"]) {
        return res.status(400).json({message: "Password is required"});
    }

    let username = formData["username"];
    let password = formData["password"];
    if (isValid(username)) {
        return res.status(409).json({message: "Username already exists"});
    } else {
        users[username] = password;
        return res.status(201).json({message: "User created"});
    }
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
    getBooks()
    .then((books) => {
        return res.status(200).send(books);
    })
    .catch((err) => {
        return res.status(500).json({message: err});
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    let isbn = req.params.isbn;

    getBookByISBN(isbn)
    .then((book) => {
        return res.status(200).send(book);
    })
    .catch((err) => {
        return res.status(404).json({message: err});
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let author = req.params.author;

    getBooksByAuthor(author)
    .then((book) => {
        return res.status(200).send(book);
    })
    .catch((err) => {
        return res.status(404).json({message: err});
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let title = req.params.title;

    getBooksByTitle(title)
    .then((book) => {
        return res.status(200).send(book);
    })
    .catch((err) => {
        return res.status(404).json({message: err});
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let isbn = req.params.isbn;
    if (books[isbn]) {
        let book = JSON.stringify(books[isbn].reviews, null, 4);
        return res.status(200).send(book);
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});

module.exports.general = public_users;
