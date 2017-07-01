const mongoose = require('./mongoose');

// this schema can be reused in another schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: 'Укажите email', // true for default message
        unique: 'Такой email уже есть',
        validate: [{
            validator: function checkEmail(value) {
                return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
            },
            msg: 'Укажите, пожалуйста, корректный email.'
        }],
        lowercase: true, // to compare with another email
        trim: true
    },
    displayName: {
        type: String,
        required: 'Укажите имя',
        minlength: 3,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
