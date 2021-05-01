const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true},
    inStock: {type: Boolean, required: true},
    description: {type: String}
}, {collection: 'products'});

mongoose.model('product', productSchema);