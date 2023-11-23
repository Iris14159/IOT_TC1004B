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

const jsonData = fs.readFileSync('eventData.json', 'utf8');
const data = JSON.parse(jsonData);

const connection = mysql.createConnection(config);

data.forEach((registro) => {
    const { Tempfloat, time } = registro;

    const sql = 'INSERT INTO temperatura (idUsuario, temperatura, fecha) VALUES (1, ?, ?)';

    connection.query(sql, [Tempfloat, time], (error, results, fields) => {
        if (error) throw error;

        console.log(`Registro insertado con ID: ${results.insertId}`);
    });
});

connection.end();