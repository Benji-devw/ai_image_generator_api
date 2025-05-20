import express from 'express';
// import multer from 'multer';
import dotenv from 'dotenv';
import routers from './routes/routers.js';

dotenv.config();

const app = express();
// const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});
app.use('/api/ai', routers);

app.listen(8806, () => {
  console.log('🚀 Serveur prêt sur http://localhost:8806');
});
