import express, { Express } from 'express';
import { customer, vendor, employee } from './routers/router';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || '8000';

app.use(cors());
app.use(express.json());

app.use('/customer', customer);
app.use('/vendor', vendor);
app.use('/employee', employee);

app.listen(PORT, () => {
  console.log(`Server started listening to port ${PORT}`);
});