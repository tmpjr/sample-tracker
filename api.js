var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var fs = require('fs');

var app = express();
var router = express.Router();

var config = require('./config');
var Sample = require('./models/sample');
var User = require('./models/user');

mongoose.connect(config.database);

app.set('api', process.env.NODE_API_SECRET);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.post('/users', function(req, res) {
    var user = new User(req.body);
    user.save(function(err) {
        if (err) throw err;

        console.log('User saved successfully');
        res.send({ success: true });
    });
});

router.get('/users', function(req, res) {
    User.find(function(err, users) {
        if (err) throw err;

        res.json(users);
    });
});

router.post('/authenticate', function(req, res) {
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
                    var cert = fs.readFileSync(process.env.NODE_JWT_KEY);
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

router.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, app.get('apiSecret'), function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token' });
            } else {
                req.decoded = decoded;
                app.set('username', decoded.username);
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

router.get('/samples', function(req, res) {
    Sample.find(function(err, samples) {
        if (err) {
            res.send(err);
        }

        res.json(samples);
    });
});

router.post('/samples', function(req, res) {
    var sample = new Sample(req.body);
    sample.save(function(err) {
        if (err) {
            res.send(err);
        }

        res.send({message: 'Sample added'});
    });
});

router.put('/samples/:id', function(req, res) {
    Sample.findOne({ _id:req.params.id }, function(err, sample) {
        if (err) {
            res.send(err);
        } 

        for (prop in req.body) {
            sample[prop] = req.body[prop];
        }

        sample.save(function(err) {
            if (err) {
                res.send(err);
            }

            res.send(sample);
        });
    });
});
    
router.get('/samples/:id', function(req, res) {
    Sample.findOne({ _id:req.params.id }, function(err, sample) {
        if (err) {
            res.send(err);
        } 

        res.json(sample);
    });
});
    
router.delete('/samples/:id', function(req, res) {
    Sample.remove({
        _id: req.params.id
    }, function(err, sample) {
        if (err) {
            res.send(err);
        }

        res.json({ message: "Successfully deleted" })
    });
});

router.get('/', function(req, res) {
    res.json({ message: 'Sample API' });
});

app.use('/api', router);
app.set('port', 8000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});
