import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";


const router = Router()
router.use(verifyJWT)

router.route("/channel/:channelId").get(getSubscribedChannels).post(toggleSubscription);
router.route("/user/:subscribedId").get(getUserChannelSubscribers);

export default router