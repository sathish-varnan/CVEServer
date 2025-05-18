import express, { Express, Request, Response } from 'express';
import { customer } from './routers/router';
import cors from 'cors';

const app: Express = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/customer', customer);

app.listen(PORT, () => {
    console.log(`Server started listening to port ${PORT}`);
});