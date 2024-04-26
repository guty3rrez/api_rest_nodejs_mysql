# Funcionamiento
## /getHours
Retorna un arreglo con objetos con los horarios disponibles y ocupados para el agendamiento de hora, puede retornar un arreglo vacío en caso de que se consulte por una fecha no hábil, como sábado o domingo.

El json que retorna es así dependiendo de si está disponible o no el horario.
```javascript
{
    "Disponible": true,
    "Fecha": "2024-04-21T09:00:00.000Z"
},
{
    "ID": 1,
    "RUT": "11.222.333-4",
    "Disponible": false,
    "Fecha": "2024-04-23T16:00:00.000Z",
    "Motivo": "Este es el motivo por el que se agendó la hora."
}
```

## /postHours
Para este endpoint hay que entregar en el body la información del formulario, como el RUT, Fecha, Motivo, Nombre, Apellido, Correo, y Número de teléfono.
El formato para enviar los datos es el siguiente:
```javascript
{
    "rut":"11.222.333-4",
    "name":"Nombre",
    "lastname":"Apellido",
    "email":"Correo",
    "number":123456789,
    "datetime":"2024-04-24 11:00",
    "reason":"Motivo"
}
```
Al momento de hacer el post, poner 4 horas menos a la que se requiere