const {db, query } = require('./mysql')

function generarHoras(fecha, horariosOcupados = []) {

    // Comprueba si la fecha es un día de semana (lunes a viernes)
    if (fecha.getDay() >= 0 && fecha.getDay() < 5) {
        console.log('Es día de semana')

        // Establece la hora de la fecha proporcionada a las 9 de la mañana
        fecha.setHours(5, 0, 0, 0);

        // Crea un arreglo para almacenar los objetos con disponibilidad y fecha
        let horasDisponibles = [];

        // Genera objetos desde las 9 de la mañana hasta las 12 del mediodía
        for (let i = 0; i <= 3; i++) {
            let hora = new Date(fecha.getTime());
            hora.setHours(fecha.getHours() + i);
            horasDisponibles.push({ Disponible: true, Fecha: hora });
        }

        // Establece la hora de la fecha proporcionada a las 2 de la tarde
        fecha.setHours(10, 0, 0, 0);

        // Genera objetos desde las 2 hasta las 5 de la tarde
        for (let i = 0; i <= 3; i++) {
            let hora = new Date(fecha.getTime());
            hora.setHours(fecha.getHours() + i);
            horasDisponibles.push({ Disponible: true, Fecha: hora });
        }

        // Compara y excluye las horas ocupadas
        let horasFinales = horasDisponibles.map(horaDisponible => {
            // Buscar si existe una hora ocupada que coincida con la hora disponible
            let horaOcupadaEncontrada = horariosOcupados.find(horaOcupada => 
                horaOcupada.Fecha.getHours() === horaDisponible.Fecha.getHours());
        
            // Si se encuentra una coincidencia, retornar la hora ocupada con la marca de no disponible
            if (horaOcupadaEncontrada) {
                return { ...horaOcupadaEncontrada, Disponible: false };
            } else {
                // Si no hay coincidencia, mantener la hora disponible
                return horaDisponible;
            }
        });
    
        return horasFinales;
    } else {
        // Si no es un día de semana, devuelve un arreglo vacío
        console.log('No es un dia de semana')
        return [];
    }
}

async function procesarHorarios(datetime, sql, values) {
    let arregloDeHoras = [];
    try {
        //Se hace la consulta a la base de datos y obtengo un arreglo como respuesta
        let horariosOcupados = await query(sql, values);
            
        console.log(horariosOcupados)
        
        // Procesa los horarios, crea disponibles, mantiene los existentes
        arregloDeHoras = generarHoras(datetime, horariosOcupados);
            
        } catch (error) {
            console.log(error);
            //Crea horarios para la fecha seleccionada
            arregloDeHoras = generarHoras(datetime);
        }

    //Retorna el valor que corresponda dependiendo de el resultado
    return arregloDeHoras;
  }



async function existeCliente(rut) {
    try {
        const result = await query('SELECT * FROM clientes WHERE RUT = ?', [rut]);
        return result.length !== 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function existeHora(datetime){
    try {
        const result = await query('SELECT * FROM horas WHERE Fecha = ?', [datetime]);
        return result.length !== 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = {
    generarHoras,
    procesarHorarios,
    existeCliente,
    existeHora
}
  