const mongoose = require("mongoose");
require("dotenv").config();

mongoose.Promise = global.Promise;

const DB_HOST = process.env.DB_HOST;

mongoose.connection.on("error", (err) => {
  console.error(`Error en la conexión a la base de datos: ${err}`);
});

mongoose.connection.on("connected", () => {
  console.log("Conexión a la base de datos establecida con éxito");
});

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log(
      "Conexión a la base de datos cerrada debido a la terminación de la aplicación"
    );
    process.exit(0);
  });
});

const connection = mongoose.connect(DB_HOST, { dbName: "server" });

module.exports = connection;
