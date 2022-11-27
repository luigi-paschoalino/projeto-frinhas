var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var db = require('./db');
const port = 3000;

app.use(express.static(__dirname + '/styles'));
app.use(express.static(__dirname + '/scripts'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index');
});

app.listen(port, err => {
    if (err) {
        return console.log('Erro: ', err);
    }
    console.log('Servidor rodando na porta ' + port);
});