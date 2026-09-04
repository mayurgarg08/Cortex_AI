import "dotenv/config"
import Redis from "ioredis"

const redis=new Redis(process.env.REDIS_URL, {
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false
})

redis.on("connect",()=>{
    console.log("redis connected")
})

redis.on("error", (error) => {
    console.error("Redis error:", error.message)
})

export default redis
