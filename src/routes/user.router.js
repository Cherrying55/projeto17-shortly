import { Router } from "express";
import { validamodelo } from "../middlewares/universal.middleware.js";
import { getRanking, getUserData, signIn, signUp } from "../controllers/user.controller.js";
import { signupmodel, signinmodel } from "../model/user.model.js";

const userrouter = Router();

userrouter.post("/sign-up", validamodelo(signupmodel), signUp);
userrouter.post("/sign-in", validamodelo(signinmodel), signIn);
userrouter.get("/users/me", getUserData);
userrouter.get("/ranking", getRanking);

export default userrouter;