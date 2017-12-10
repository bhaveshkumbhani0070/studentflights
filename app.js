var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var router = express.Router();
var apiRoutes = express.Router();

var apiurl = express.Router();
var busboy = require('connect-busboy');
var scrape = require(__dirname + '/scrape');
app.set('port', process.env.PORT || 8080);

app.use(bodyParser.urlencoded({
    limit: '500mb',
    extended: true,
    parameterLimit: 50000
}));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(expressValidator());
app.use(bodyParser.json());
app.use(busboy());
app.use(express.static(__dirname + '/public'));
// API
app.get('/scrape', scrape.scape);
app.use('/', router);
app.listen(app.get('port'));
console.log("apimodules Started on Port No. ", app.get('port'));