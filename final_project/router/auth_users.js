const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.includes(username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.filter(user => user.username === username && user.password === password).length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    if (!req.params.username) {
        return res.status(400).json({message: "Username is required"});
    } else if (!req.params.password) {
        return res.status(400).json({message: "Password is required"});
    }

    let username = req.params.username;
    let password = req.params.password;
    if (!isValid(username)) {
        return res.status(401).json({message: "Username does not exist"});
    } else if (!authenticatedUser(username,password)) {
        return res.status(401).json({message: "Username and password do not match"});
    } else {
        let token = jwt.sign(
            {username: username},
            'expressBookReviews',
            { expiresIn: 60 * 60 }
        );
        return res.status(200).json({message: "Login successful", token: token});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let review = req.params.review;
    let username = req.user.username;
    if (books[isbn]) {
        books[isbn].reviews[username] = review;
        return res.status(200).json({message: "Review added"});
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let username = req.params.username;
    if (books[isbn]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({message: "Review deleted"});
    } else {
        return res.status(404).json({message: "Book not found"});
    }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
