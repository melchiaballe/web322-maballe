const express = require('express');
const path = require('path');
const router = express();

const db = require("../models/rentals-db");

const sgMail = require('@sendgrid/mail');
const bcryptjs = require('bcryptjs');
const userModel = require('../models/userModel');

const rentalModel = require("../models/rentalsModel");


// Home Page
router.get('', (req, res) => {
    rentalModel.find({featuredRental: true}).then(data => {
        res.render("pages/Home/home", {
            additionalCSS: "css/Home/home.css",
            featured: data
        });
    }).catch( err => {
        console.log(err);
    })

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
        const newUser = new userModel({
            firstName: fname,
            lastName: lname,
            email: email,
            password: password,
        });

        userModel.findOne({email: email}).then(is_found => {
            if(is_found) {
                // fix here add error to frontend duplicate email or email already exist
                errors.email = "Email already exist";
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
                newUser.save().then(userSaved => {
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
        
                    sgMail.send(msg).then(() => {
                        console.log('Email sent')
                    }).catch((err) => {
                        console.error("Error while sending email (failing silently):", err);
                    });

                    req.session.user = userSaved;
                    req.session.ctype = 'data-clerk';

                    res.redirect('/welcome');
        
                }).catch(err => {
                    console.log("Error while saving: ", err);
                    errors.main = "Invalid sign up contact administrator";
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
                })
            }
        }).catch(err => {
            console.log("Error while finding: ", err);
            errors.main = "Invalid sign up contact administrator";
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
        });
    }
    
});

// Login Page
router.get('/log-in', (req, res) => {
    res.render("pages/Login/log-in", {
      additionalCSS: "css/Login/log-in.css",
      formData: {
        email: '',
        password: '',
        ctype: ''
      },
      errors: {},
    });
});

router.post('/log-in', (req, res) => {
    const { email, password, ctype, } = req.body;
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
    } else {

        userModel.findOne({ email : email}).then(user => {
            if(user) {
                // password validation
                bcryptjs.compare(password, user.password).then(isMatched => {

                    if(isMatched) {

                        req.session.user = user;
                        req.session.ctype = ctype;

                        if(ctype === 'data-clerk') {
                            res.redirect('/rentals/list');
                        } else {
                            res.redirect('/cart');
                        }

                    } else {
                        errors.main = "Sorry, you entered an invalid email and/or password";
                        return res.render("pages/Login/log-in", {
                            additionalCSS: "css/Login/log-in.css",
                            formData: {
                                email: email,
                                password: password,
                            },
                            errors
                        });
                    }

                }).catch( err => {
                    console.log("Error found on comparison: ", err);
                    errors.main = "Invalid login contact administrator";
                    return res.render("pages/Login/log-in", {
                        additionalCSS: "css/Login/log-in.css",
                        formData: {
                            email: email,
                            password: password,
                        },
                        errors
                    });
                });

            } else {
                errors.main = "Sorry, you entered an invalid email and/or password";
                return res.render("pages/Login/log-in", {
                    additionalCSS: "css/Login/log-in.css",
                    formData: {
                        email: email,
                        password: password,
                    },
                    errors
                });
            }
        }).catch(err => {
            console.log("Error found while finding: ", err);
            errors.main = "Invalid login contact administrator";
            return res.render("pages/Login/log-in", {
                additionalCSS: "css/Login/log-in.css",
                formData: {
                    email: email,
                    password: password,
                },
                errors
            });
        });
    }
});
  
// Welcome Page
router.get('/welcome', (req, res) => {
    res.render("pages/Welcome/welcome", {
        additionalCSS: "css/Welcome/welcome.css"
    });
});

// Logout User
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/log-in');
});

// Cart page
router.get('/cart', async (req, res) => {
    if(req.session.user && req.session.ctype === 'customer') {
        let cart = req.session.cart || [];
        let rentals = [];

        if (req.session.cart) {
            await rentalModel.find({}).then(data => {
                filtered_rentals = data.filter(x => cart.some(y => y._id === x.id));
                filtered_rentals.forEach(x => {
                    x["numNights"] = cart.find(({ _id }) => _id === x.id).numNights;
                    x["subTotal"] = cart.find(({ _id }) => _id === x.id).subTotal;
                    rentals.push(x)
                });
            }).catch(err => {
                console.log(err);
            });
        } else {
            cart = [];
        }
        
        res.render("pages/Cart/cart", {
            additionalCSS: "/css/Cart/cart.css",
            rentals: rentals,
            cart: cart,
            errors: {}
        });
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

// Add rental to Cart
router.post('/cart/add/:id', async (req, res) => {
    if(req.session.user && req.session.ctype === 'customer') {
        const id = req.params.id;
        let cart = req.session.cart ? req.session.cart : [];

        await rentalModel.findOne({_id: id}).then(data => {
            cart.push({ 
                _id: req.params.id,
                numNights: 1,
                subTotal: data.pricePerNight
            });
        }).catch(err => {
            console.log(err);
        });
        
        req.session.cart = cart;

        res.redirect("/cart");
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

// Edit rental's number of nights
router.get('/cart/edit/:id/:action', async (req, res) => {
    if(req.session.user && req.session.ctype === 'customer') {
        const { id, action } = req.params;
        let cart = req.session.cart ? req.session.cart : [];

        await rentalModel.findOne({_id: id}).then(rental => {
            let cart_rental = cart.find(({ _id }) => _id === id);

            if(action === 'increase') {
                cart_rental['numNights'] = cart_rental['numNights'] + 1;
            } else if(action === 'decrease') {
                cart_rental['numNights'] > 1 ?  cart_rental['numNights'] =  cart_rental['numNights'] - 1 : '';
            }

            cart_rental['subTotal'] = cart_rental['numNights'] * rental.pricePerNight;
            req.session.cart = cart;

            res.redirect("/cart");
        }).catch(err => {
            console.log(err);
        });
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

// Remove rental from Cart
router.get('/cart/remove/:id', (req, res) => {
    if(req.session.user && req.session.ctype === 'customer') {
        const id = req.params.id;
        let cart = req.session.cart ? req.session.cart : [];

        cart = cart.filter(({ _id }) => _id !== id);
        req.session.cart = cart;

        res.redirect("/cart");
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

// Checkout Cart
router.post('/cart/checkout', async (req, res) => {
    if(req.session.user && req.session.ctype === 'customer') {
        let { subTotal, vatSubTotal, grandTotal } = req.body;
        let cart = req.session.cart ? req.session.cart : [];
        let rentals = [];

        await rentalModel.find({}).then(data => {
            filtered_rentals = data.filter(x => cart.some(y => y._id === x.id));
            filtered_rentals.forEach(x => {
                x["numNights"] = cart.find(({ _id }) => _id === x.id).numNights;
                x["subTotal"] = cart.find(({ _id }) => _id === x.id).subTotal;
                rentals.push(x)
            });
        }).catch(err => {
            console.log(err);
        });

        let html_content = `
            <div>
                <h2>Greetings!</h2>
            </div>
            <div>
                <span>This is to confirm your booking for:</span>
            </div>
        `;

        rentals.forEach(rental => {
            cart_rental = cart.find(({ _id }) => _id === rental.id);
            console.log("cart rental", cart_rental);
            html_content += `
                <div> 
                    <h6>${rental.headline}</h6>
                </div>
                <div>
                    <span>${rental.city}, ${rental.province}</span> 
                </div>
                <div>
                    <span>${cart_rental.numNights} ${cart_rental.numNights > 1 ? 'nights: ' : 'night: '} C$ ${cart_rental.subTotal}</span>
                </div>
            `;
        })

        html_content += `
            <div>
                <h6>Summary</h6>
            </div>
            <div>
                <span>${(cart.reduce((n, {numNights}) => n + numNights, 0))} ${(cart.reduce((n, {numNights}) => n + numNights, 0)) > 1 ? 'nights:' : 'night:'}</span>
                <h6>C$ ${subTotal}</h6>
            </div>
            <div>
                <span>VAT (20%): </span>
                <h6>C$ ${vatSubTotal}</h6>
            </div>
            <div>
                <h6>Total: C$ ${grandTotal}</h6>
            </div>
        `;

        sgMail.setApiKey("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")
        const msg = {
            to: req.session.user.email,
            from: 'dev.melchiaballe@gmail.com',
            subject: 'Homely Havens: Booking confirmation',
            html: html_content,
        }

        sgMail.send(msg).then(() => {
            console.log('Email sent')
        }).catch((err) => {
            console.error("Error while sending email (failing silently):", err);
        });

        cart = [];
        req.session.cart = cart;

        res.redirect("/rentals");
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

module.exports = router;