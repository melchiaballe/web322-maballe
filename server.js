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

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.use(bodyParser.urlencoded({ extended: false }));

// Add your routes here
// e.g. app.get() { ... }



// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.


const router = express();

router.use(express.static(__dirname + 'views'));
router.use(express.static('assets'));

const db = require("./models/rentals-db");
const { error } = require('console');

const sgMail = require('@sendgrid/mail')
const dotenv = require('dotenv').config()

// Home Page
router.get('/', (req, res) => {
  res.render("pages/Home/home", {
    additionalCSS: "css/Home/home.css",
    featured: db.getFeaturedRentals()
  });
});

// Rentals Page
router.get('/rentals', (req, res) => {
  res.render("pages/Rentals/rentals", {
    additionalCSS: "css/Rentals/rentals.css",
    groupedRentals: db.getRentalsByCityAndProvince()
  });
});

// Registration Page
router.get('/sign-up', (req, res) => {
  res.render("pages/Signup/sign-up", {
    additionalCSS: "css/Signup/sign-up.css",
    formData: {
      fname: '',
      lname: '',
      email: '',
      password: '',
    },
    errors: {},
  });
});

// Login Page
router.get('/log-in', (req, res) => {
  res.render("pages/Login/log-in", {
    additionalCSS: "css/Login/log-in.css",
    formData: {
      email: '',
      password: ''
    },
    errors: {},
  });
});

// Welcome Page
router.get('/welcome', (req, res) => {
  res.render("pages/Welcome/welcome", {
    additionalCSS: "css/Welcome/welcome.css"
  });
});

// FORMS
router.post("/sign-up", (req, res) => {
  const { fname, lname, email, password } = req.body;
  const errors = {};

  if (!fname) {
    errors.fname = "Firstname is required.";
  }
  if (!lname) {
    errors.lname = "Lastname is required.";
  }
  if (!password) {
    errors.password = 'Password is required.';
  } else {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,12}$/;

    if (!password.match(passwordRegex)) {
      errors.password = 'Password must be 8-12 characters, contain at least one lowercase letter, one uppercase letter, one number, and one symbol.';
    }
  }
  if (!email) {
    errors.email = "Email is required.";
  } else {
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

    if(!email.match(emailRegex)) {
      errors.email = "Invalid email address."
    }
  }

  if (Object.keys(errors).length > 0) { // Check if there are errors
    // Render the form again with error messages
    return res.render("pages/Signup/sign-up", {
      additionalCSS: "css/Signup/sign-up.css",
      formData: {
        fname: fname,
        lname: lname,
        password: password,
        email: email,
      },
      errors
    });
  } else {
    // send email
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
      to: email, // Change to your recipient
      from: 'dev.melchiaballe@gmail.com', // Change to your verified sender
      subject: 'Welcome to Homely Havens',
      html: `
        <div>
            <h2>Welcome ${fname} ${lname}</h2>
        </div>
        <div>
            We welcome you to <strong><i>Homely Havens</i></strong>
        </div>
        <div>
            <h6> Created by: Melchi Lloyd Aballe</h6>
        <div>
        `,
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })
  }

  res.redirect('/welcome');
});

router.post('/log-in', (req, res) => {
  const { email, password } = req.body;
  const errors = {};
  if (!email) {
    errors.email = "Email is required.";
  }
  if (!password) {
    errors.password = "Password is required."
  }

  if (Object.keys(errors).length > 0) { // Check if there are errors
    // Render the form again with error messages
    return res.render("pages/Login/log-in", {
      additionalCSS: "css/Login/log-in.css",
      formData: {
        email: email,
        password: password,
      },
      errors
    });
  }
})

// module.exports = router;
// const routes = require('./core/routes.js');
app.use('', router);

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
app.listen(HTTP_PORT, onHttpStart);