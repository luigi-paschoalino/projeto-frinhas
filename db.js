const Sequelize = require('sequelize');
const sequelize = new Sequelize('unifei2', 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres'
});

async function conexao(){
    try{
        await sequelize.authenticate();
        console.log('Conectado com sucesso!');
    }
    catch(error){
        console.error('Não foi possível conectar: ', error.message);
    }
}

conexao();

module.exports = sequelize;