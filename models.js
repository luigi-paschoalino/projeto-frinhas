const Sequelize = require('sequelize');
const db = require('./db');

const Usuario = db.define('usuario', {
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    senha: {
        type: Sequelize.STRING,
        allowNull: true
    },
    cep: {
        type: Sequelize.STRING,
        allowNull: false
    },
    is_adm: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    bairro: {
        type: Sequelize.STRING,
        allowNull: true
    }
},
{
    timestamps: false,
    freezeTableName: true
});

const Noticia = db.define('noticia', {
    idnoticia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    data_noticia: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    tipo_noticia: {
        type: Sequelize.STRING,
        allowNull: false
    },
    bairro_afetado: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descricao: {
        type: Sequelize.TEXT,
        allowNull: false
    }
},
{
    timestamps: false,
    freezeTableName: true
});

module.exports = { Usuario, Noticia, Sequelize };