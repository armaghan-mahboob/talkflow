import express from "express";

import { lookupUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/lookup", lookupUser);

export default router;
