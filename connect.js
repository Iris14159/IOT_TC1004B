/*----------------------------------------------------------
 * connect.js
 *
 * Date: 21-Nov-2023
 * Authors:
 *           A01799387 Renato Garcia Moran
 *           A01798048 Maximilisno De La Cruz Lima
 *           A01798199 Fidel Alexander Bonilla Montalvo
 *----------------------------------------------------------*/
let mysql = require("mysql");

const databaseName = "retofinal";

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: databaseName,
});

connection.connect((err) => {
  if (err) return console.error("Error: " + err.message);
  console.log("Connected to " + databaseName + " database.");
});

// connection.destroy();
connection.end((err) => {
  if (err) return console.error("Error: " + err.message);
  console.log("Closing connection.");
});