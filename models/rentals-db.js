const rentalModel = require("../models/rentalsModel");

let rentals = [
  {
    headline: "Modern Minimalist Home",
    numSleeps: 6,
    numBedrooms: 3,
    numBathrooms: 2,
    pricePerNight: 480,
    city: "Ottawa",
    province: "Ontario",
    imageUrl: "house1.jpg",
    featuredRental: true
  },
  {
    headline: "Modern house with Pool",
    numSleeps: 4,
    numBedrooms: 2,
    numBathrooms: 2,
    pricePerNight: 600,
    city: "Ottawa",
    province: "Ontario",
    imageUrl: "house2.jpg",
    featuredRental: true
  },
  {
    headline: "Bungalow close to Downtown",
    numSleeps: 6,
    numBedrooms: 3,
    numBathrooms: 2,
    pricePerNight: 340,
    city: "Ottawa",
    province: "Ontario",
    imageUrl: "house3.jpg",
    featuredRental: false
  },
  {
    headline: "Cozy Cabin Retreat",
    numSleeps: 2,
    numBedrooms: 3,
    numBathrooms: 4,
    pricePerNight: 400,
    city: "Ottawa",
    province: "Ontario",
    imageUrl: "house4.jpg",
    featuredRental: false
  },
  {
    headline: "Lakefront Condo",
    numSleeps: 3,
    numBedrooms: 1,
    numBathrooms: 1,
    pricePerNight: 170,
    city: "Toronto",
    province: "Ontario",
    imageUrl: "house5.jpg",
    featuredRental: true
  },
  {
    headline: "Boho Rooftop Retreat",
    numSleeps: 4,
    numBedrooms: 2,
    numBathrooms: 1,
    pricePerNight: 300,
    city: "Toronto",
    province: "Ontario",
    imageUrl: "house6.jpg",
    featuredRental: true
  }
]

function getFeaturedRentals() {
  let featuredRentals = rentals.filter(({ featuredRental }) => featuredRental == true);
  return featuredRentals
}

function getRentalsByCityAndProvince() {
  let groupedRentals = [];
  rentals.forEach((rental) => {
    let key = `${rental.city}, ${rental.province}`;
    if(!groupedRentals.find(({cityProvince}) => cityProvince == key)) {
      groupedRentals.push({
        cityProvince: key,
        rentals: [],
      });
    }
    groupedRentals.find(({cityProvince}) => cityProvince == key).rentals.push(rental);
  });
  return groupedRentals;
}


function getAllRentals() {
  return rentals;
}

module.exports = {
  getFeaturedRentals,
  getRentalsByCityAndProvince,
  getAllRentals
}
