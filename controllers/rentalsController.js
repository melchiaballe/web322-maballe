const express = require('express');
const path = require('path');
const router = express();
const crypto = require("crypto");
var fs = require('fs');

// const db = require("../models/rentals-db");

const rentalModel = require("../models/rentalsModel");

router.use(express.static(__dirname + 'views'));
router.use(express.static('assets'));

router.get('', (req, res) => {
    rentalModel.find({}).then(data => {
        groupedRentals = [];
        data.forEach((rental) => {
            let key = `${rental.city}, ${rental.province}`;
            if(!groupedRentals.find(({cityProvince}) => cityProvince == key)) {
                groupedRentals.push({
                cityProvince: key,
                rentals: [],
                });
            }
            groupedRentals.find(({cityProvince}) => cityProvince == key).rentals.push(rental);
        });
        res.render("pages/Rentals/rentals", {
            additionalCSS: "css/Rentals/rentals.css",
            groupedRentals: groupedRentals,
        });
    }).catch(err => {
        console.log(err);
    })
});

router.get('/list', (req, res) => {
    if(req.session.user && req.session.ctype === 'data-clerk') {
        rentalModel.find({}).then(data => {
            res.render("pages/Rentals/rentals-list", {
                additionalCSS: "css/Rentals/rentals-list.css",
                rentals: data
            });
        }).catch(err => {
            console.log(err);
        })
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

router.get('/add', (req, res) => {
    if(req.session.user && req.session.ctype === 'data-clerk') {
        res.render("pages/Rentals/rental-form", {
            additionalCSS: "css/Rentals/rental-form.css",
            formData: {
                headline: '',
                city: '',
                province: '',
                numSleeps: '',
                numBedrooms: '',
                numBathrooms: '',
                pricePerNight: '',
                imageUrl: '',
                featuredRental: false,
            },
            errors: {},
            id: null
        });
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

router.post('/add', (req, res) => {
    if(req.session.user && req.session.ctype === 'data-clerk') {
        const { headline, city, province, numSleeps, numBedrooms, numBathrooms, pricePerNight, featuredRental } = req.body;
        const errors = {};

        const isFeatured = featuredRental === undefined ? false : (featuredRental === 'on' ? true : false);

        for (const [key, value] of Object.entries(req.body)) {
            if(!value) {
                let errorMsg = "";
                if(key === "headline" || key === "city" || key === "province" || key === "numSleeps" || key === "numBedrooms" || key === "numBathrooms" || key === "pricePerNight") {
                    errorMsg = `${key} is required.`;
                    errors[key] = errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1).toLowerCase();
                }
            } else {
                if(key === "numSleeps" || key === "numBedrooms" || key === "numBathrooms" || key === "pricePerNight") {
                    if(isNaN(value)) {
                        errorMsg = `${key} should be a number.`;
                        errors[key] = errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1).toLowerCase();
                    }
                }
            }
        }

        if(!req.files) {
            errors.imageUrl = `image is required`;
        } 

        if (Object.keys(errors).length > 0) { // Check if there are errors
            // Render the form again with error messages
            return res.render("pages/Rentals/rental-form", {
                additionalCSS: "css/Rentals/rental-form.css",
                formData: {
                    headline: headline,
                    city: city,
                    province: province,
                    numSleeps: numSleeps,
                    numBedrooms: numBedrooms,
                    numBathrooms: numBathrooms,
                    pricePerNight: pricePerNight,
                    imageUrl: '',
                    featuredRental: isFeatured
                },
                errors,
                id: null
            });
        } else {
            const rentalImage = req.files.imageUrl;
            const id = crypto.randomBytes(8).toString("hex");
            const uniqueName = `rental-${id}${path.parse(rentalImage.name).ext}`;

            rentalImage.mv(`assets/images/${uniqueName}`).then(() => {
                imageUrl = uniqueName;

                const newRental = new rentalModel({ 
                    headline, city, province, numSleeps, numBedrooms, numBathrooms, pricePerNight, imageUrl, featuredRental: isFeatured, 
                });

                newRental.save().then(rental => {
                    res.redirect('/rentals/list');
                }).catch(err => {
                    console.log(err);
                })
                
            }).catch(err => {
                errors.imageUrl = "Error in uploading image";
                return res.render("pages/Rentals/rental-form", {
                    additionalCSS: "css/Rentals/rental-form.css",
                    formData: {
                        headline: headline,
                        city: city,
                        province: province,
                        numSleeps: numSleeps,
                        numBedrooms: numBedrooms,
                        numBathrooms: numBathrooms,
                        pricePerNight: pricePerNight,
                        imageUrl: '',
                        featuredRental: isFeatured
                    },
                    errors,
                    id: null
                });
            })
            
        }
        
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

router.get('/edit/:id', (req, res) => {
    const id = req.params.id
    if(req.session.user && req.session.ctype === 'data-clerk') {
        rentalModel.findOne({_id: id}).then(data => {
            // const appRoot = require('app-root-path');
            // console.log(path.join(process.cwd(), 'assets/images', data.imageUrl));
            res.render("pages/Rentals/rental-form", {
                additionalCSS: "/css/Rentals/rental-form.css",
                formData: {
                    headline: data.headline,
                    city: data.city,
                    province: data.province,
                    numSleeps: data.numSleeps,
                    numBedrooms: data.numBedrooms,
                    numBathrooms: data.numBathrooms,
                    pricePerNight: data.pricePerNight,
                    imageUrl: data.imageUrl,
                    featuredRental: data.featuredRental
                },
                errors: {},
                id: id
            });
        }).catch(err => {
            console.log(err);
        })
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});


router.post('/edit/:id', (req, res) => {
    if(req.session.user && req.session.ctype === 'data-clerk') {
        const id = req.params.id;
        const { headline, city, province, numSleeps, numBedrooms, numBathrooms, pricePerNight, imageUrl, featuredRental } = req.body;
        const errors = {};

        const isFeatured = featuredRental === undefined ? false : (featuredRental === 'on' ? true : false);

        for (const [key, value] of Object.entries(req.body)) {
            if(!value) {
                let errorMsg = "";
                if(key === "headline" || key === "city" || key === "province" || key === "numSleeps" || key === "numBedrooms" || key === "numBathrooms" || key === "pricePerNight") {
                    errorMsg = `${key} is required.`;
                    errors[key] = errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1).toLowerCase();
                }
            } else {
                if(key === "numSleeps" || key === "numBedrooms" || key === "numBathrooms" || key === "pricePerNight") {
                    if(isNaN(value)) {
                        errorMsg = `${key} should be a number.`;
                        errors[key] = errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1).toLowerCase();
                    }
                }
            }
        }

        if (Object.keys(errors).length > 0) { // Check if there are errors
            // Render the form again with error messages
            rentalModel.findOne({_id: id}).then(data => {
                res.render("pages/Rentals/rental-form", {
                    additionalCSS: "/css/Rentals/rental-form.css",
                    formData: {
                        headline: headline,
                        city: city,
                        province: province,
                        numSleeps: numSleeps,
                        numBedrooms: numBedrooms,
                        numBathrooms: numBathrooms,
                        pricePerNight: pricePerNight,
                        imageUrl: data.imageUrl,
                        featuredRental: isFeatured
                    },
                    errors: errors,
                    id: id
                });
            }).catch(err => {
                console.log(err)
            })

        } else {
            if(!req.files) {
                rentalModel.updateOne({_id: id}, {
                    $set: {
                        headline: headline,
                        city: city,
                        province: province,
                        numSleeps: numSleeps,
                        numBedrooms: numBedrooms,
                        numBathrooms: numBathrooms,
                        pricePerNight: pricePerNight,
                        featuredRental: isFeatured
                    }
                }).then( data => {
                    res.redirect("/rentals/list")
                })
            } else {
                //unlink file
                rentalModel.findOne({_id: id}).then(data => {
                    if(data.imageUrl) {
                        fs.unlinkSync(path.join(process.cwd(), 'assets/images', data.imageUrl));
                    }
                    
                    const rentalImage = req.files.imageUrl;
                    const uuid = crypto.randomBytes(8).toString("hex");
                    const uniqueName = `rental-${uuid}${path.parse(rentalImage.name).ext}`;
        
                    rentalImage.mv(`assets/images/${uniqueName}`).then(() => {
    
                        rentalModel.updateOne({_id: id}, {
                            $set: {
                                headline: headline,
                                city: city,
                                province: province,
                                numSleeps: numSleeps,
                                numBedrooms: numBedrooms,
                                numBathrooms: numBathrooms,
                                pricePerNight: pricePerNight,
                                imageUrl: uniqueName,
                                featuredRental: isFeatured
                            }
                        }).then( data => {
                            res.redirect("/rentals/list")
                        })
    
                        
                    }).catch(err => {
                        errors.imageUrl = "Error in uploading image";
                        return res.render("pages/Rentals/rental-form", {
                            additionalCSS: "css/Rentals/rental-form.css",
                            formData: {
                                headline: headline,
                                city: city,
                                province: province,
                                numSleeps: numSleeps,
                                numBedrooms: numBedrooms,
                                numBathrooms: numBathrooms,
                                pricePerNight: pricePerNight,
                                imageUrl: '',
                                featuredRental: isFeatured
                            },
                            errors,
                            id: null
                        });
                    })
                }).catch(err => {
                    console.log(err);
                })
            }
        }
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

router.get('/remove/:id', (req, res) => {
    const id = req.params.id;
    if(req.session.user && req.session.ctype === 'data-clerk') {
        res.render("pages/Rentals/remove-rental-confirmation", {
            additionalCSS: "/css/Rentals/remove-rental-confirmation.css",
            id: id
        });
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

router.post('/remove/:id', (req, res) => {
    const id = req.params.id;
    if(req.session.user && req.session.ctype === 'data-clerk') {
        rentalModel.findOne({_id: id}).then(data => {
            if(data.imageUrl) {
                fs.unlinkSync(path.join(process.cwd(), 'assets/images', data.imageUrl));
            }

            rentalModel.deleteOne({_id: id}).then(data => {
                res.redirect("/rentals/list");
            }).catch(err => {
                console.log(err);
            })
        }).catch(err => {
            console.log(err);
        })
    } else {
        res.status(401).json({'error': 'You are not authorized to view this page'});
    }
});

module.exports = router;