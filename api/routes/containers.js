var express = require('express');
var router = express.Router();
var _ = require('lodash');

var Container = require('../models/container');

router.get('/', function(req, res, next) {
    Container
    .find()
    .populate('samples')
    .exec(function(err, container) {
        if (err) {
            return next(err);
        }

        res.json(container);
    });
});

router.post('/', function(req, res, next) {
    var container = new Container(req.body);
    container.save(function(err) {
        if (err) {
            return next(err);
        }

        res.send({message: 'Container added'});
    });
});

router.get('/:id', function(req, res, next) {
    Container
    .findOneById()
    .populate('samples')
    .exec({ _id:req.params.id }, function(err, sample) {
        if (err) {
            return next(err);
        } 

        if (_.isEmpty(container)) {
            return res.status(404).send({
                success: false,
                message: 'Resource not found.'
            });
        }

        res.json(container);
    });
});

router.put('/:id', function(req, res, next) {
    var id = req.params.id;
    var body = req.body;

    Container
    .findByIdAndUpdate(id, body, { "new": true }, function(err, container) {
        if (err) {
            return next(err);
        }

        res.json(container);
    });
});

module.exports = router;
