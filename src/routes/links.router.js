import { Router } from "express";
import { validamodelo } from "../middlewares/universal.middleware.js";
import { postshortenmodel } from "../model/links.model.js";
import { deleteURL, getUrlbyId, openURL, postShorten } from "../controllers/links.controller.js";

const linksrouter = Router();

linksrouter.post("/urls/shorten", validamodelo(postshortenmodel), postShorten);
linksrouter.get("/urls/:id", getUrlbyId);
linksrouter.delete("/urls/:id", deleteURL);
linksrouter.get("/urls/open/:shortUrl", openURL);


export default linksrouter;