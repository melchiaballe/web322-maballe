const express = require('express');
const path = require('path');
const router = express();

const db = require("../models/rentals-db");

router.use(express.static(__dirname + 'views'));
router.use(express.static('assets'));

router.get('', (req, res) => {
    res.render("pages/Rentals/rentals", {
      additionalCSS: "css/Rentals/rentals.css",
      groupedRentals: db.getRentalsByCityAndProvince()
    });
});

router.get('/list', (req, res) => {
    if(req.session.user && req.session.ctype === 'data-clerk') {
        res.render("pages/Rentals/rentals-list", {
            additionalCSS: "css/Rentals/rentals-list.css"
          });
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

module.exports = router;