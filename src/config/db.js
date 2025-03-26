import dotenv from 'dotenv';
import { Sequelize } from "sequelize";
dotenv.config();
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
    }
);
sequelize.authenticate()
    .then(() => console.log('conexion con exito'))
    .catch(err => console.error('no se pudo conectar', err));

export default sequelize;