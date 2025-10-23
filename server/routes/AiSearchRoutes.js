import express from "express";
import { aiSearch } from "../controllers/AiSearchController.js";
import wrapAsync from "../middlewares/wrapAsync.js";

const router = express.Router();

router.post('/search',  wrapAsync(aiSearch));


export default router;