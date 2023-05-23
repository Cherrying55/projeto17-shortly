import express from "express";
import { Router } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import linksrouter from "./routes/links.router.js";
import userrouter from "./routes/user.router.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const router = Router();
router.use(linksrouter);
router.use(userrouter);
app.use(router);

app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});
