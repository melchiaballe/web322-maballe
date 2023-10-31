const express = require('express');
const path = require('path');
const router = express();

router.use(express.static(__dirname + 'views'));
router.use(express.static('assets'));

const db = require("../models/rentals-db");
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
      subject: 'Sending with SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
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

module.exports = router;