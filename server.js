/*************************************************************************************
* WEB322 - 2237 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Melchi Lloyd Aballe
* Student ID    : 174047217
* Course/Section: WEB322/NEE
*
**************************************************************************************/

const path = require("path");
const express = require("express");
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config({path: "./config/.env"})
const mongoose = require("mongoose");
const session = require('express-session');
const fileUpload = require('express-fileupload');

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use(session({
  secret: process.env.APP_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.ctype = req.session.ctype;
  next();
})

app.use(express.static(__dirname + 'views'));
app.use(express.static('assets'));

const { error } = require('console');

// Add your routes here
// e.g. app.get() { ... }

const generalRoutes = require('./controllers/generalController.js');
app.use('/', generalRoutes);

const rentalsRoutes = require('./controllers/rentalsController.js');
app.use('/rentals', rentalsRoutes);

const loadDataRoutes = require('./controllers/loadDataController.js');
app.use('/load-data', loadDataRoutes);


// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
mongoose.connect(process.env.MONGODB_CONN_STRING).then(() => {
  app.listen(HTTP_PORT, onHttpStart);
})
