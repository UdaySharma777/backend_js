import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js"

const router = Router();
router.use(verifyJWT);
router.route("/stats").post(getChannelStats);
router.route("/videos").post(getChannelVideos);

export default router