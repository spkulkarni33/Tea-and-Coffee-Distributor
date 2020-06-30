var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;
var Tea = new Schema({
    bname : String,
    image : String,
    description: String,
    price : String,
    stock : String,
    softdelete: String
});

module.exports = mongoose.model('teas', Tea);