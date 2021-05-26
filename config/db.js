const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try{
        await mongoose.connect(db, {
            useNewURLParser: true
        });
        console.log('Mongo DB connected ...')
        // Avisar que estamos online

    } catch(err) {
        // si no se connecta, que imprima el mensaje de error y que explote todo con process.exit
        console.error(err.message);
        process.exit(1);
    }
}

// Le hago export a la funcion para poder llamarla en mi server.js
module.exports = connectDB;