const express = require('express');
const path = require('path');
const router = express();

router.use(express.static(__dirname + 'views'));
router.use(express.static('assets'));

const db = require("../models/rentals-db")


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
    additionalCSS: "css/Signup/sign-up.css"
  });
});

// Login Page
router.get('/log-in', (req, res) => {
  res.render("pages/Login/log-in", {
    additionalCSS: "css/Login/log-in.css"
  });
});

module.exports = router;