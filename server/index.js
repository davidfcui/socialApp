import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from './controllers/auth.js';
import { verify } from 'crypto';
import { createPost } from './controllers/posts.js';
import { verifyToken } from './middleware/auth.js';
import User from './models/User.js';
import Post from './models/Post.js';
import { users, posts } from './data/index.js';

/* CONGIGURATION */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
/*
app.use(cors({
  origin: ['http://localhost:3000', 'https://social-app-tawny-six.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));*/
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan('common'));
app.use(bodyParser.json({limit: '30mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '30mb', extended: true}));
//app.use(cors()); 
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.options('*', cors());
/* FILE STORAGE */
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/assets');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage});

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost); // addPost

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect("mongodb+srv://dummyuser:960918cui@cluster0.t3orjee.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {

  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
     //User.insertMany(users);
     //Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));

export default app;
