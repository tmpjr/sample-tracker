var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var containerSchema = new Schema({
    barcode: {
        type: String,
        required: true,
        index: { unique: true }
    },
    desc: {
        type: String,
        required: true
    },
    size: {
        rows: Number,
        cols: Number
    },
    samples: [{
        type: Schema.ObjectId, ref: 'Sample'
    }]
});

module.exports = mongoose.model('Container', containerSchema);
