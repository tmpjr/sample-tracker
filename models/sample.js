var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sampleSchema = new Schema({
    barcode: String,
    type: String,
    collected: Date,
    created_at: Date,
    updated_at: Date
});

sampleSchema.pre('save', function(next) {
    var currentDate = new Date();

    this.updated_at = currentDate;
    if (!this.created_at) {
        this.created_at = currentDate;
    }

    next();
});

module.exports = mongoose.model('Sample', sampleSchema);