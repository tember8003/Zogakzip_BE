import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';

import groupController from './controllers/groupController.js';
import ImageController from './controllers/ImageController.js';
import postController from './controllers/postController.js';
import errorHandler from './middlewares/errorHandler.js';
import commentController from './controllers/commentController.js';

const app = express();
app.use((req, res) => {
    res.header("Access-Control-Allow-Origin", "*"); // 모든 도메인 허용
});
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

app.options('*', cors());
app.get('/', (req, res) => {
    res.status(201).json('Welcome');
    console.log("welcome!");
});
app.use('/uploads', express.static('uploads'));
app.use('/api/groups', groupController);
app.use('/api/posts', postController);
app.use('/api/image', ImageController);
app.use('/api/comments', commentController);

app.use(errorHandler);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});