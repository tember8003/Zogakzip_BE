import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';

import groupController from './controllers/groupController.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
app.use(express.json());

app.use('/api/groups', groupController);

app.use(errorHandler);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});