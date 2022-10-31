import express, { Express, Request, Response } from "express"
import * as http from "http"
import next, { NextApiHandler } from "next"
import * as socketio from "socket.io"

const port: number = parseInt(process.env.PORT || "3000", 10)
const dev: boolean = process.env.NODE_ENV !== "production"
const nextApp = next({ dev })
const nextHandler: NextApiHandler = nextApp.getRequestHandler()

nextApp.prepare().then(async () => {
	const app: Express = express()
	const server: http.Server = http.createServer(app)
	const io: socketio.Server = new socketio.Server()
	io.attach(server)

	app.get("/hello", async (_: Request, res: Response) => {
		res.send("Hello World")
	})

	io.on("connection", (socket: socketio.Socket) => {
		console.log("connected " + socket.id)
		socket.emit("status", "Hello from Socket.io")
		socket.on("sendMessage", (message: string) => {
			io.emit("recievedMessage", message)
		})
		socket.on("disconnect", () => {
			console.log("client disconnected")
		})
	})

	app.all("*", (req: any, res: any) => nextHandler(req, res))

	server.listen(port, () => {
		console.log(`> Ready on http://localhost:${port}`)
	})
})
