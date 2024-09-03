import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';

import groupController from './controllers/groupController.js';
import ImageController from './controllers/ImageController.js';
import postController from './controllers/postController.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
app.use(cors({
    origin: 'http://zogakzip.react.codeit.s3-website-ap-southeast-2.amazonaws.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

app.use('/uploads', express.static('uploads'));
app.use('/api/groups', groupController);
app.use('/api/posts', postController);
app.use('/api/image', ImageController);

app.use(errorHandler);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});