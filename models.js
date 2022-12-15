const Sequelize = require('sequelize');
const db = require('./db');

async function sync(){
    await db.sync();
    console.log('Sincronizado com sucesso!');
}

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

const Contato = db.define('contato', {
    idcontato: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    telefone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    endereco: {
        type: Sequelize.STRING,
        allowNull: false
    },
    bairro: {
        type: Sequelize.STRING,
        allowNull: false
    },
    complemento: {
        type: Sequelize.STRING,
        allowNull: true
    }
},
{
        timestamps: false,
        freezeTableName: true
});

const Abrigo = db.define('abrigo', {
    idabrigo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    endereco: {
        type: Sequelize.STRING,
        allowNull: false
    },
    bairro: {
        type: Sequelize.STRING,
        allowNull: false
    },
    complemento: {
        type: Sequelize.STRING,
        allowNull: true
    },
    capacidade: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
},
{
    timestamps: false,
    freezeTableName: true
});

sync();

module.exports = { Usuario, Noticia, Contato, Abrigo, Sequelize };