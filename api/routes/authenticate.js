var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var User = require('../models/user');

router.post('/', function(req, res) {
    User.findOne({
        username: req.body.username
    }, function(err, user) {
        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (err) throw err;

                if (isMatch) {
                    var cert = req.app.get('jwt_private_cert');
                    // if user is found and password matches, create a token
                    var token = jwt.sign(user, cert,  {
                        algorithm: 'RS256',
                        expiresInMinutes: 1440 // 24 hours
                    });

                    res.json({
                        success: true,
                        message: 'Here is your token',
                        token: token
                    });

                } else {
                    res.json({ success: false, message: 'Authentication failed. Wrong password.'  });
                }
            });
        }
    });
});

module.exports = router;
