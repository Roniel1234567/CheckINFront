import "reflect-metadata";
import { DataSource } from "typeorm";
import { Taller } from "./models/Taller";
import { FamiliaProfesional } from "./models/familia_profecional";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "checkinfront",
    synchronize: true,
    logging: true,
    entities: [Taller, FamiliaProfesional],
    subscribers: [],
    migrations: [],
})

// Inicializar la conexión
AppDataSource.initialize()
    .then(() => {
        console.log("Conexión a la base de datos establecida");
    })
    .catch((error) => {
        console.error("Error durante la inicialización de la base de datos:", error);
    }); 