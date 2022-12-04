var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');
const nReadlines = require('n-readlines');
const https = require('https');
var db = require('./db');
const models = require('./models');
const port = 3000;

app.use(express.static(path.join(__dirname + '/styles')));
app.use(express.static(path.join(__dirname + '/scripts')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'our little secret',
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/admin', function (req, res) {
    if (!req.session.admin) {
        res.render('admin');
    } else {
        res.render('adminPage');
    }
});

app.post('/admin', async function (req, res) {
    retorno = await models.Usuario.findOne({
        where: {
            email: req.body.email,
            senha: req.body.password
        }
    });
    if (retorno != null) {
        req.session.admin = true;
    }
    res.redirect('/admin');
});

app.get('/admin/noticias', function (req, res) {
    if (!req.session.admin) {
        res.redirect('/admin');
    } else {
        const arquivo = new nReadlines('./files/bairros.txt');
        let line;
        let bairros = [];
        while (line = arquivo.next()) {
            let bairro = line.toString('utf8');
            bairro = bairro.replace(/(\r)/gm, "");
            bairros.push(bairro);
        }
        res.render('cadNoticias', { bairros: bairros });
    }
});

app.post('/cadNoticia', async function (req, res) {
    if (!req.session.admin) {
        res.status(500).redirect('/admin');
    } else {
        const t = await db.transaction();
        try {
            await models.Noticia.create({
                attributes: ['tipo_noticia', 'bairro_afetado', 'descricao'],
                tipo_noticia: req.body.desastre,
                bairro_afetado: req.body.bairro,
                descricao: req.body.descricao
            }, { transaction: t });
            await t.commit();
            res.redirect('/');
        }
        catch (err) {
            await t.rollback();
            console.log(err);
            res.status(500).redirect('/admin/noticias');
        }
    }
});

app.get('/noticias', async function (req, res) {
    if (req.query.id == null || req.query.id == undefined) {
        const noticias = await models.Noticia.findAll({
            order: [
                ['idnoticia', 'DESC']
            ]
        });
        res.render('noticias', { noticias: noticias });
    }
    else {
        const noticia = await models.Noticia.findOne({
            raw: true,
            where: {
                idnoticia: req.query.id
            }
        });
        res.render('noticia', { noticia: noticia });
    }
});

app.get('/debug', async function (req, res) {
    retorno = await models.Usuario.findAll({ raw: true });
    console.log(retorno);
    res.json(retorno);
});

app.get('/teste', async function (req, res) {

});

app.post('/cadastro', async function (req, res) {
    function getBairro() {
        return new Promise((resolve) => {
            https.get('https://viacep.com.br/ws/' + req.body.cep + '/json/', (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                })
                resp.on('end', async () => {
                    resolve(JSON.parse(data).bairro);
                }).on("error", (err) => {
                    throw err;
                });
            })
        })
    }
    const t = await db.transaction();
    try {
        var bairro = await getBairro();
        console.log(bairro)
        await models.Usuario.create({
            attributes: ['nome', 'email', 'cep', 'bairro'],
            nome: req.body.nome,
            email: req.body.email,
            cep: req.body.cep,
            bairro: bairro
        }, { transaction: t });
        await t.commit();
        console.log('Usuário cadastrado com sucesso!');
        res.redirect('/');
    }
    catch (error) {
        console.error(error.message);
        await t.rollback();
    }
})

app.listen(port, err => {
    if (err) {
        return console.log('Erro: ', err);
    }
    console.log('Servidor rodando na porta ' + port);
});