import bodyParser from 'body-parser';
import express from 'express';
import userRoutes from './routes/userRoutes.js';
import swaggerSpec from './api-docs.js';
import swaggerUI from "swagger-ui-express";

const app = express();

app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api-docs', swaggerUI.serve,
    swaggerUI.setup(swaggerSpec));
    
export default app;