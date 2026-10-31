import express from "express"
import { agent } from "../controllers/agent.controller.js"
import multer from "../config/multer.js"
import { getFile } from "../controllers/file.controller.js"

const router=express.Router()

router.post("/chat",multer.single("file"),agent)
router.get("/files/:key",getFile)

export default router