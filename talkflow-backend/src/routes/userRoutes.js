import express from "express";

import { lookupUser, searchUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/lookup", lookupUser);
router.get("/search", searchUsers);

export default router;
