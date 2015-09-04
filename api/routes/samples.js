var express = require('express');
var router = express.Router();
var _ = require('lodash');

var Sample = require('../models/sample');

router.get('/', function(req, res, next) {
    Sample
    .find()
    .populate('_created_by _updated_by')
    .exec(function(err, samples) {
        if (err) {
            return next(err);
        }

        if (_.isEmpty(samples)) {
            return res.status(404).send({
                success: false,
                message: 'No records found'
            });
        }

        res.json(samples);
    });
});

router.post('/', function(req, res, next) {
    var user = app.get('user');
    var sample = new Sample(req.body);
    sample._created_by = user; 

    sample.save(function(err) {
        if (err) {
            return next(err);
        }

        res.json(sample);
    });
});

router.put('/:id', function(req, res, next) {
    var id = req.params.id;
    var body = req.body;
    body._updated_by = app.get('user');

    Sample
    .findByIdAndUpdate(id, body, { "new": true }, function(err, sample) {
        if (err) {
            return next(err);
        }

        res.json(sample);
    });
});
    
router.get('/:id', function(req, res, next) {
    Sample.findOne({ _id:req.params.id }, function(err, sample) {
        if (err) {
            return next(err);
        } 

        if (_.isEmpty(sample)) {
            return res.status(404).send({
                success: false,
                message: 'No records found'
            });
        }

        res.json(sample);
    });
});
    
router.delete('/:id', function(req, res, next) {
    Sample.remove({
        _id: req.params.id
    }, function(err, sample) {
        if (err) {
            return next(err);
        }

        res.json({ message: "Successfully deleted" })
    });
});

module.exports = router;
