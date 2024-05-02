const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
let { procesarHorarios, existeHora, existeCliente } = require('./helpers');
const { db } = require('./mysql');
const { nuevoPago, confirmarPago } = require('./transbank');
const { consultarEnvio, test, crearEnvio } = require("./chilexpress")
//Setting app
app.set('port',3000)
//Credenciales para https
const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'felipe'
}

//Middlewares
app.use(express.json()); // Poder enviar y recibir JSON
app.use(express.urlencoded({extended: false})); //Decodifica las peticiones del navegador para que sean legibles

//Routes
app.get('/', (req, res) => {
    res.send('Este es el directoiro raiz.')
})

//Trae las horas en la fecha del datetime
app.get('/getHours', async (req,res)=> {

    //Extraigo la fecha de la peticion, creo una nueva para la sentencia sql
    let { datetime } = req.body; let date = new Date(datetime); let nextDate = new Date(date);nextDate.setDate(nextDate.getDate()+1);

    //Crear sentencia SQL para la consulta a la base de datos.
    let sql = 'SELECT * FROM Horas WHERE TIMESTAMP(Fecha) BETWEEN ? AND ?'; let values = [date.toISOString().split('T')[0], nextDate.toISOString().split('T')[0]];
    // let sql = "SELECT * FROM Horas WHERE CONVERT_TZ(Fecha, '-04:00', 'America/Santiago') BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY);"; let values = [date.toISOString().split('T')[0], nextDate.toISOString().split('T')[0]];

    //Hacer consulta, capturar error si existe, manejar el resultado de la base de datos
    let response = await procesarHorarios(date, sql, values);

    res.send(response)

    })


app.post('/postHour', async (req,res) => {
    let body = req.body;
    try {
        const { rut, name, lastname, email, reason, datetime, number } = body;


        let query_hour = 'INSERT INTO horas (RUT, Disponible, Fecha, Motivo) VALUES (?, ?, ?, ?)'
        let values_hour = [rut, 1, datetime, reason];
        let query_client = 'INSERT INTO clientes (RUT, Nombre, Apellido, Correo, Numero) VALUES (?, ?, ?, ?, ?)'
        let values_client = [rut, name, lastname, email, number];
        let existeH = await existeHora(datetime);
        let existeC = await existeCliente(rut);
        if (existeH) {
            res.send('La hora no pudo ser agendada, está ocupada.')
        } else {
            db.query(query_hour, values_hour, (error, result) => {
                if (error) throw error;
                console.log('Hora agendada correctamente.')
            })
            if (!existeC) {
                db.query(query_client, values_client, (error, result) => {
                    if (error) throw error;
                    console.log('Cliente agregado correctamente.')
                })
                
            }

        }

        
        db.query('SELECT * FROM horas WHERE RUT = ?', [rut], (error, result) => {
            if (error) throw error;
            res.send(result);
        })

        //res.send('Hora agendada con éxito')


    } catch (e) {
        throw e;
    }
})

app.get('/nuevoPago',nuevoPago)


app.use('/confirmarPago',confirmarPago)

app.post("/consultarEnvio", consultarEnvio)

app.get("/test", test)

app.post("/crearEnvio", crearEnvio)

https.createServer(options, app).listen(8000, () => {
    console.log('Servidor corriendo en https://localhost:8000/')
})

