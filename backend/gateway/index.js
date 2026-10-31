import "dotenv/config"
import express from "express"
import proxy from "express-http-proxy"
import cors from "cors"
import cookieParser from "cookie-parser"
import { getCurrentUser } from "./controllers/user.controller.js"
import protect from "./middleware/auth.middleware.js"
import { proxyWithHeader } from "./utils/proxyWithHeader.js"
import morgan from "morgan"
const port =process.env.PORT


const allowedOrigins = [
    "http://localhost:5173",
    "https://mayur-cortexai.online",
    "https://www.mayur-cortexai.online"
];
const app=express()
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(morgan("dev"))
app.use(cookieParser())
app.use("/api/auth",proxy(process.env.AUTH_SERVICE))
// Generated files are public; the random key in the URL acts as the access token
app.use("/api/files",proxy(process.env.AGENT_SERVICE,{proxyReqPathResolver:(req)=>`/files${req.url}`}))
app.use("/api/chat",protect,proxyWithHeader(process.env.CHAT_SERVICE))
app.use("/api/agent",protect,proxyWithHeader(process.env.AGENT_SERVICE))
app.use("/api/billing",protect,proxyWithHeader(process.env.BILLING_SERVICE))
app.get("/api/me",protect,getCurrentUser)
app.get("/",(req,res)=>{
    res.json({message:"hello from gateway v5"})
})

app.listen(port,()=>{
    console.log(`gateway started at ${port}`)
})
