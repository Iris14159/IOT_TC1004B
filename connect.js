let mysql = require("mysql");

const databaseName = "classicmodels";

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