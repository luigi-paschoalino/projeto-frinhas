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
    res.render('index', { admin: req.session.admin || false });
});

app.get('/admin', function (req, res) {
    if (!req.session.admin) {
        res.render('admin', { admin: false });
    } else {
        res.render('adminPage', { admin: req.session.admin || false });
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
        res.render('cadNoticias', { bairros: bairros, admin: req.session.admin || false });
    }
});

app.get('/admin/users', async function (req, res) {
    if (!req.session.admin) {
        res.redirect('/admin');
    } else {
        const usuarios = await models.Usuario.findAll();
        res.render('users', { usuarios: usuarios, admin: req.session.admin || false });
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
        res.render('noticias', { noticias: noticias, admin: req.session.admin || false });
    }
    else {
        const noticia = await models.Noticia.findOne({
            raw: true,
            where: {
                idnoticia: req.query.id
            }
        });
        res.render('noticia', { noticia: noticia, admin: req.session.admin || false });
    }
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
            bairro: bairro,
            senha: req.body.senha
        }, { transaction: t });
        await t.commit();
        console.log('Usuário cadastrado com sucesso!');
        res.redirect('/');
    }
    catch (error) {
        console.error(error.message);
        await t.rollback();
    }
});

app.get('/update', function (req, res) {
    res.render('update', { admin: req.session.admin || false });
});

app.post('/update', async function (req, res) {
    const t = await db.transaction();
    try {
        let result = await models.Usuario.findOne({
            raw: true,
            where: {
                email: req.body.emailOld
            }
        });
        if (result != null) {
            if (req.body.emailNew == null || req.body.emailNew == undefined) {
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
                var bairro = await getBairro();
                await models.Usuario.update({
                    nome: req.body.nome,
                    senha: req.body.senha,
                    cep: req.body.cep,
                    bairro: bairro
                }, {
                    where: {
                        email: req.body.emailOld
                    }
                }, { transaction: t });
            }
            else {
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
                var bairro = await getBairro();
                await models.Usuario.update({
                    nome: req.body.nome,
                    email: req.body.emailNew,
                    senha: req.body.senha,
                    cep: req.body.cep,
                    bairro: bairro
                }, {
                    where: {
                        email: req.body.emailOld
                    }
                }, { transaction: t });
            }
            await t.commit();
            console.log('Usuário atualizado com sucesso!');
            res.redirect('/');
        }
    }
    catch (error) {
        console.error(error.message);
        await t.rollback();
    }
});

app.get('/unsubscribe', function (req, res) {
    res.render('unsubscribe', { admin: req.session.admin || false });
});

app.post('/unsubscribe', async function (req, res) {
    const t = await db.transaction();
    try {
        let result = await models.Usuario.findOne({
            raw: true,
            where: {
                email: req.body.email
            }
        });
        if (result != null) {
            await models.Usuario.destroy({
                where: {
                    email: req.body.email,
                    senha: req.body.senha
                }
            }, { transaction: t });
            await t.commit();
            console.log('Usuário excluído com sucesso!');
            res.redirect('/');
        }
    }
    catch (error) {
        console.error(error.message);
        await t.rollback();
        res.redirect('/unsubscribe');
    }
});

app.get('/logout', function (req, res) {
    req.session.admin = false;
    res.redirect('/');
});

app.get('/contatos', async function (req, res) {
    let result = await models.Contato.findAll({
        raw: true,
        order: [
            ['idcontato', 'ASC']
        ]
    });
    res.render('contatos', { admin: req.session.admin || false, contatos: result });
});

app.get('/admin/contatos', async function (req, res) {
    if (!req.session.admin) {
        res.redirect('/admin');
    }
    else {
        res.render('cadContatos', { admin: req.session.admin || false });
    }
});

app.post('/admin/contatos', async function (req, res) {
    const t = await db.transaction();
    try {
        await models.Contato.create({
            attributes: ['nome', 'telefone', 'endereco', 'bairro', 'complemento'],
            nome: req.body.nome,
            telefone: req.body.telefone,
            endereco: req.body.endereco,
            bairro: req.body.bairro,
            complemento: req.body.complemento || null
        }, { transaction: t });
        await t.commit();
        console.log('Contato cadastrado com sucesso!');
        res.redirect('/contatos');
    }
    catch (error) {
        console.error(error.message);
        await t.rollback();
        res.redirect('/admin/contatos');
    }
});

app.get('/updateContato', async function (req, res) {
    if (!req.session.admin) {
        res.redirect('/admin');
    }
    else {
        let result = await models.Contato.findOne({
            raw: true,
            where: {
                idcontato: req.query.id
            }
        });
        res.render('updateContato', { admin: req.session.admin || false, contato: result });
    }
});

app.post('/updateContato', async function (req, res) {
    const t = await db.transaction();
    try {
        await models.Contato.update({
            nome: req.body.nome,
            telefone: req.body.telefone,
            endereco: req.body.endereco,
            bairro: req.body.bairro,
            complemento: req.body.complemento || null
        }, {
            where: {
                idcontato: req.body.idcontato
            }
        }, { transaction: t });
        await t.commit();
        console.log('Contato atualizado com sucesso!');
        res.redirect('/contatos');
    }
    catch (error) {
        console.error(error.message);
        await t.rollback();
        res.redirect('/updateContato?id=' + req.body.id);
    }
});

app.get('/deleteContato', async function (req, res) {
    if (!req.session.admin) {
        res.redirect('/admin');
    }
    else {
        const t = await db.transaction();
        try {
            await models.Contato.destroy({
                where: {
                    idcontato: req.query.id
                }
            }, { transaction: t });
            await t.commit();
            console.log('Contato excluído com sucesso!');
            res.redirect('/contatos');
        }
        catch (error) {
            console.error(error.message);
            await t.rollback();
            res.redirect('/contatos');
        }
    }
});

app.get('/abrigos', async function (req, res) {
    let result = await models.Abrigo.findAll({
        raw: true,
        order: [
            ['idabrigo', 'ASC']
        ]
    });
    res.render('abrigos', { admin: req.session.admin || false, abrigos: result });
});

app.get('/admin/abrigos', async function (req, res) {
    if (!req.session.admin) {
        res.redirect('/admin');
    }
    else {
        res.render('cadAbrigos', { admin: req.session.admin || false });
    }
});

app.post('/admin/abrigos', async function (req, res) {
    const t = await db.transaction();
    try {
        await models.Abrigo.create({
            attributes: ['nome', 'endereco', 'bairro', 'complemento', 'capacidade'],
            nome: req.body.nome,
            endereco: req.body.endereco,
            bairro: req.body.bairro,
            complemento: req.body.complemento || null,
            capacidade: req.body.capacidade
        }, { transaction: t });
        await t.commit();
        console.log('Abrigo cadastrado com sucesso!');
        res.redirect('/abrigos');
    }
    catch (error) {
        console.error(error.message);
        await t.rollback();
        res.redirect('/admin/abrigos');
    }
});

app.get('/updateAbrigo', async function (req, res) {
    if (!req.session.admin) {
        res.redirect('/admin');
    }
    else {
        let result = await models.Abrigo.findOne({
            raw: true,
            where: {
                idabrigo: req.query.id
            }
        });
        res.render('updateAbrigo', { admin: req.session.admin || false, abrigo: result });
    }
});

app.post('/updateAbrigo', async function (req, res) {
    const t = await db.transaction();
    try {
        await models.Abrigo.update({
            nome: req.body.nome,
            endereco: req.body.endereco,
            bairro: req.body.bairro,
            complemento: req.body.complemento || null,
            capacidade: req.body.capacidade
        }, {
            where: {
                idabrigo: req.body.idabrigo
            }
        }, { transaction: t });
        await t.commit();
        console.log('Abrigo atualizado com sucesso!');
        res.redirect('/abrigos');
    }
    catch (error) {
        console.error(error.message);
        await t.rollback();
        res.redirect('/updateAbrigo?id=' + req.body.id);
    }
});

app.get('/deleteAbrigo', async function (req, res) {
    if (!req.session.admin) {
        res.redirect('/admin');
    }
    else {
        const t = await db.transaction();
        try {
            await models.Abrigo.destroy({
                where: {
                    idabrigo: req.query.id
                }
            }, { transaction: t });
            await t.commit();
            console.log('Abrigo excluído com sucesso!');
            res.redirect('/abrigos');
        }
        catch (error) {
            console.error(error.message);
            await t.rollback();
            res.redirect('/abrigos');
        }
    }
});

app.listen(port, err => {
    if (err) {
        return console.log('Erro: ', err);
    }
    console.log('Servidor rodando na porta ' + port);
});