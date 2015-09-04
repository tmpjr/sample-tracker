var express = require('express');
var router = express.Router();
var _ = require('lodash');

var User = require('../models/user');

router.post('/', function(req, res, next) {
    var user = new User(req.body);
    user.save(function(err) {
        if (err) {
            return next(err);
        }

        console.log('User saved successfully');
        res.send({ success: true });
    });
});

router.get('/', function(req, res, next) {
    User
    .find({}, 'username roles')
    .exec(function(err, users) {
        if (err) {
            return next(err);
        }

        res.json(users);
    });
});

module.exports = router;
