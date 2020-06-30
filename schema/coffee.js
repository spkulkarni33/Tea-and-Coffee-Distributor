var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;
var Coffee = new Schema({
    coffeename : String,
    image : String,
    description: String,
    price : String,
    stock : String,
    softdelete: String
});

module.exports = mongoose.model('coffees', Coffee);