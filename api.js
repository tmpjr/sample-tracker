var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var log4js = require('log4js');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var _ = require('lodash');

var app = express();
var router = express.Router();

var config = require('./config');

var Sample = require('./models/sample');
var Container = require('./models/container');
var User = require('./models/user');

mongoose.connect(config.database);

app.set('jwt_public_cert', fs.readFileSync(process.env.NODE_KEY_PATH + '/jwt-public.pem'));
app.set('jwt_private_cert', fs.readFileSync(process.env.NODE_KEY_PATH + '/jwt-private.pem'));

var appLog = log4js.getLogger();
var httpLog = morgan("combined", {
    "stream": {
        write: function(str) { appLog.debug(str); }
    }
});
app.use(httpLog);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
                    var cert = app.get('jwt_private_cert');
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

router.use(function(err, req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        var cert = app.get('jwt_public_cert');
        jwt.verify(token, cert, function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token' });
            } else {
                req.decoded = decoded;
                app.set('user', decoded);
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

router.post('/users', function(req, res, next) {
    var user = new User(req.body);
    user.save(function(err) {
        if (err) {
            return next(err);
        }

        console.log('User saved successfully');
        res.send({ success: true });
    });
});

router.get('/users', function(req, res, next) {
    User.find(function(err, users) {
        if (err) {
            return next(err);
        }

        res.json(users);
    });
});

router.post('/containers', function(req, res, next) {
    var container = new Container(req.body);
    container.save(function(err) {
        if (err) {
            return next(err);
        }

        res.send({message: 'Container added'});
    });
});

router.get('/containers', function(req, res, next) {
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

router.put('/containers/:id', function(req, res, next) {
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

router.get('/samples', function(req, res, next) {
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

router.post('/samples', function(req, res, next) {
    var user = app.get('user');
    var sample = new Sample(req.body);
    sample._created_by = user; 

    sample.save(function(err) {
        if (err) {
            return next(err);
        }

        res.json({message: 'Sample added'});
    });
});

router.put('/samples/:id', function(req, res, next) {
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
    
router.get('/samples/:id', function(req, res, next) {
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
    
router.delete('/samples/:id', function(req, res, next) {
    Sample.remove({
        _id: req.params.id
    }, function(err, sample) {
        if (err) {
            return next(err);
        }

        res.json({ message: "Successfully deleted" })
    });
});

router.get('/', function(req, res) {
    res.json({ message: 'Sample API' });
});

app.use('/api', router);

// Middleware: Handle all app errors
app.use(function(err, req, res, next) {
    appLog.error(err.message);

    res.status(500).json({
        'success': false,
        'message': 'Internal Server Error'
    });
});


app.set('port', 8000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});
