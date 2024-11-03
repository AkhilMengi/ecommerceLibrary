const mongoose = require('mongoose')

const UserRegister = new mongoose.Schema({
    FirstName: {
        type: String,
        required: true,
        lowercase: true,
        minLength: 2
    }, LastName: {
        type: String,
        required: true,
        lowercase: true,
        minLength: 2
    }, email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    }, phoneNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
    }, password: {
        type: String,
        required: true,
        minLength: 6,
        validate: {
            validator: function (v) {
                // Regular expression to ensure at least one special character
                return /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(v);
            },
            message: props => `${props.value} must contain at least one special character!`
        }
    },

})

const Register = mongoose.model('Register', UserRegister);
module.exports = Register