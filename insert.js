/*----------------------------------------------------------
 * insert.js
 *
 * Date: 21-Nov-2023
 * Authors:
 *           A01799387 Renato Garcia Moran
 *           A01798048 Maximilisno De La Cruz Lima
 *           A01798199 Fidel Alexander Bonilla Montalvo
 *----------------------------------------------------------*/

const fs = require('fs');
const mysql = require('mysql');
const config = require('./config.js');

// Leer el archivo JSON y convertirlo en un objeto
const jsonData = fs.readFileSync('eventData.json', 'utf8');
const data = JSON.parse(jsonData);

// Crear conexión a la base de datos
const connection = mysql.createConnection(config);

// Conectarse a la base de datos
connection.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos con éxito.');

    // Recorrer cada registro y realizar las inserciones
    data.forEach(registro => {
        const { 'Temperatura corporal': temperaturaCorporal, 'Humedad': humedad, 'Temperatura ambiental': temperaturaAmbiental, 'ppm': ritmoCardiaco, time } = registro;

        // Convertir el tiempo UNIX a formato de fecha y hora de SQL
        const fecha = new Date(time * 1000).toISOString().slice(0, 19).replace('T', ' ');

        // Insertar en la tabla de humedad
        const sqlHumedad = 'INSERT INTO humedo (idUsuario, humedad, fecha) VALUES (?, ?, ?);';
        connection.query(sqlHumedad, [1, humedad, fecha], handleError);

        // Insertar en la tabla de temperatura (corporal)
        const sqlTemperatura = 'INSERT INTO temperatura (idUsuario, temperatura, fecha) VALUES (?, ?, ?);';
        connection.query(sqlTemperatura, [1, temperaturaCorporal, fecha], handleError);

        // Insertar en la tabla de ritmo cardiaco
        const sqlRitmoCardiaco = 'INSERT INTO ritmocardiaco (idUsuario, rirmoCardiaco, fecha) VALUES (?, ?, ?);';
        connection.query(sqlRitmoCardiaco, [1, ritmoCardiaco, fecha], handleError);

        // Insertar en la tabla de temperatura ambiental
        const sqlTemperaturaAmbiental = 'INSERT INTO temperaturaambiental (idUsuario, temperatura, fecha) VALUES (?, ?, ?);';
        connection.query(sqlTemperaturaAmbiental, [1, temperaturaAmbiental, fecha], handleError);
    });

    // Función para manejar errores en las consultas
    function handleError(error, results) {
        if (error) {
            console.error('Error en la inserción:', error);
            return;
        }
        console.log(`Registro insertado con ID: ${results.insertId}`);
    }

    // Cerrar la conexión
    connection.end(err => {
        if (err) {
            console.error('Error al cerrar la conexión:', err);
        } else {
            console.log('Conexión a la base de datos cerrada con éxito.');
        }
    });
});