import { spawn } from "node:child_process"
import os from "node:os"

function pickLocalIpv4() {
  const interfaces = os.networkInterfaces()
  for (const entries of Object.values(interfaces)) {
    if (!entries) continue
    for (const entry of entries) {
      if (entry.family === "IPv4" && !entry.internal) {
        return entry.address
      }
    }
  }
  return "localhost"
}

const port = process.env.VITE_PORT || "5173"
const host = process.env.CAP_SERVER_HOST || pickLocalIpv4()
const protocol = process.env.CAP_SERVER_PROTOCOL || "http"
const serverUrl = `${protocol}://${host}:${port}`

console.log(`[dev:mobile] CAP_SERVER_URL=${serverUrl}`)

const args = ["--host", "0.0.0.0", "--port", port, ...process.argv.slice(2)]
const child = spawn("vite", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    CAP_SERVER_URL: serverUrl,
  },
})

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})
