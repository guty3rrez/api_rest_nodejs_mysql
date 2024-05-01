var mysql  = require('mysql2');
const util = require('util');

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'abogados_db'
});

db.connect((e) => {
  if (e) {
    throw e;
  } else {
    console.log('Conexión con abodagos_db exitosa!');
  }
})

const query = util.promisify(db.query).bind(db);

module.exports = { db, query }