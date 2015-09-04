var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var log4js = require('log4js');
var fs = require('fs');
var _ = require('lodash');

var samples = require('./routes/samples');
var containers = require('./routes/containers');
var authenticate = require('./routes/authenticate');
var users = require('./routes/users');

var app = express();
var router = express.Router();

var config = require('./config');

var Sample = require('./models/sample');
var Container = require('./models/container');
var User = require('./models/user');

mongoose.connect(config.database.url);

app.set('jwt_public_cert', fs.readFileSync(process.env.JWT_KEY_PATH + '/jwt-public.pem'));
app.set('jwt_private_cert', fs.readFileSync(process.env.JWT_KEY_PATH + '/jwt-private.pem'));

// Setup manual logging and send to http log
var appLog = log4js.getLogger();
var httpLog = morgan("combined", {
    "stream": {
        write: function(str) { appLog.debug(str); }
    }
});
app.use(httpLog);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

router.get('/', function(req, res) {
    res.json({ message: 'Sample API' });
});

app.use('/api', router);
app.use('/api/users', users);
app.use('/api/samples', samples);
app.use('/api/containers', containers);
app.use('/api/authenticate', authenticate);

// Middleware: Log full error message with stack.
// Send simple error back to client.
app.use(function(err, req, res, next) {
    appLog.error(err);

    res.status(500).json({
        'success': false,
        'message': 'Internal Server Error'
    });
});

app.set('port', config.http.port);

var server = app.listen(app.get('port'), function() {
     console.log('Express server listening on port ' + server.address().port);
});
