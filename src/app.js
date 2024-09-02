import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';

import postController from 'src/controller/postController.js';
import ImageController from './controllers/ImageController.js';
import posterrorHandler from 'src/middlewares/posterrorHandler.js';

const app = express();
app.use(express.json());

app.use('/api/groups/{groupId}/posts', postController);

app.use('/uploads', express.static('uploads'));
app.use(posterrorHandler);
app.use('/api/image', ImageController);

app.use(posterrorHandler);
const port = process.env.PORT ?? 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});