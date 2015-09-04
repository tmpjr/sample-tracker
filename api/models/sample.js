var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sampleSchema = new Schema({
    barcode: {
        type: String,
        required: true,
        index: { unique: true }
    },
    type: String,
    location: Number,
    collected_at: Date,
    _created_by: { type: Schema.ObjectId, ref: 'User' },
    _updated_by: { type: Schema.ObjectId, ref: 'User' },
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
