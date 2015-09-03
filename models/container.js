var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var containerSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: { unique: true }
    },
    barcode: {
        type: String,
        required: true,
        index: { unique: true }
    },
    cols: {
        type: Number,
        required: true
    },
    rows: {
        type: Number,
        required: true
    }
});
