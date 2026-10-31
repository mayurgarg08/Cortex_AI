// Runs the gateway and all services in a single container (used for the free Render deployment).
// The gateway listens on $PORT; services listen on fixed internal ports.
import { spawn } from "child_process"

const services = [
    { name: "auth", dir: "services/auth", port: 8001 },
    { name: "chat", dir: "services/chat", port: 8002 },
    { name: "agent", dir: "services/agent", port: 8003 },
    { name: "billing", dir: "services/billing", port: 8004 },
]

const serviceUrls = Object.fromEntries(
    services.map(s => [`${s.name.toUpperCase()}_SERVICE`, `http://localhost:${s.port}`])
)

// Each service uses its own database on the same cluster, e.g. .../auth, .../chat
const mongoUriFor = (db) => {
    const override = process.env[`${db.toUpperCase()}_MONGODB_URI`]
    if (override) return override
    if (!process.env.MONGODB_URI) return undefined
    const url = new URL(process.env.MONGODB_URI)
    url.pathname = `/${db}`
    return url.toString()
}

const run = (name, command, args, options = {}) => {
    const child = spawn(command, args, { stdio: "inherit", ...options })
    child.on("exit", (code) => {
        console.error(`${name} exited with code ${code}, shutting down`)
        process.exit(1)
    })
    return child
}

if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL not set, starting local redis (sessions will not survive restarts)")
    run("redis", "redis-server", ["--save", "", "--appendonly", "no"])
    process.env.REDIS_URL = "redis://localhost:6379"
}

for (const s of services) {
    run(s.name, "node", ["index.js"], {
        cwd: s.dir,
        env: { ...process.env, ...serviceUrls, PORT: String(s.port), MONGODB_URI: mongoUriFor(s.name) },
    })
}

run("gateway", "node", ["index.js"], {
    cwd: "gateway",
    env: { ...process.env, ...serviceUrls, PORT: process.env.PORT || "8000" },
})
