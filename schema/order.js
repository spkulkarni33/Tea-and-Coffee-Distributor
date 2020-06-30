var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;
var Order = new Schema({
    userid : String,
    shipping_address: {
        firstname: String,
        lastname: String,
        address: String,
        phone: String,
        email: String
    },
    billing_address:{
        firstname: String,
        lastname: String,
        address: String,
        phone: String,
        email: String
    },
    total_amount : String,
    payment_method: String
});

module.exports = mongoose.model('orders', Order);