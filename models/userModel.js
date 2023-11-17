const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

userSchema.pre("save", function(next) {
    let user = this;
    bcryptjs.genSalt().then(salt => {
        bcryptjs.hash(user.password, salt).then(hashedPass => {
            user.password = hashedPass;
            next();
        }).catch(err => {
            console.log(err);
        })
    }).catch(err => {
        console.log(err);
    });
})

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;