const express = require('express');
const path = require('path');
const router = express();


const db = require("../models/rentals-db");

const rentalModel = require("../models/rentalsModel");

router.use(express.static(__dirname + 'views'));
router.use(express.static('assets'));


router.get('/rentals', (req, res) => {
    if(req.session.user && req.session.ctype === 'data-clerk') {
        rentalModel.countDocuments().then(count => {
            if(count === 0) {
                rentalModel.insertMany(db.getAllRentals()).then( data => {
                    res.redirect("/load-data/success");
                }).catch(err => {
                    res.send("Couldn't insert the data");
                })
            } else {
                res.redirect("/load-data/failed");
            }
        }).catch(err => {
            console.log(err);
        })
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

router.get('/success', (req, res) => {
    if(req.session.user && req.session.ctype === 'data-clerk') {
        message = { header: "Congratulations", content:"Added rentals to the database"}

        res.render("pages/Rentals/rentals-loading-data.ejs", {
            additionalCSS: "css/Rentals/rentals-loading.css",
            message
        });
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

router.get('/failed', (req, res) => {
    if(req.session.user && req.session.ctype === 'data-clerk') {
        message = { header: "Ooooops", content:"Rentals have already been added to the database"}
        res.render("pages/Rentals/rentals-loading-data.ejs", {
            additionalCSS: "css/Rentals/rentals-loading.css",
            message
        });
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

module.exports = router;