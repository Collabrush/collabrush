import express, { Express, Request, Response } from "express"
import * as http from "http"
import next, { NextApiHandler } from "next"
import * as socketio from "socket.io"

const port: number = parseInt(process.env.PORT || "3000", 10)
const dev: boolean = process.env.NEXT_PUBLIC_NODE_ENV !== "production"
const nextApp = next({ dev })
const nextHandler: NextApiHandler = nextApp.getRequestHandler()

const pointerColors = [
	"#EF4444",
	"#F97316",
	"#F59E0B",
	"#EAB308",
	"#84CC16",
	"#22C55E",
	"#10B981",
	"#14B8A6",
	"#06B6D4",
	"#3B82F6",
	"#6366F1",
	"#8B5CF6",
	"#A855F7",
	"#D946EF",
	"#EC4899",
	"#F43F5E",
	"#78716C",
	"#71717A",
	"#64748B",
]

nextApp.prepare().then(async () => {
	const app: Express = express()
	const server: http.Server = http.createServer(app)
	const io: socketio.Server = new socketio.Server()
	io.attach(server)

	app.get("/hello", async (_: Request, res: Response) => {
		res.send("Hello World")
	})

	io.on("connection", (socket: socketio.Socket) => {
		// Assign color to new connected socket user
		const socketColor =
			pointerColors[Math.floor(Math.random() * pointerColors.length)]

		socket.data.color = socketColor

		socket.on("join", (boardID: string) => {
			socket.join(boardID)
			socket.data.boardID = boardID
			console.log("connected " + socket.id + " to board " + boardID)

			// send array of already connected users
			const alreadyConnectedUsers = Array.from(
				io.sockets.adapter.rooms.get(boardID)
			)
			console.log("alreadyConnectedUsers", alreadyConnectedUsers)

			socket.emit(
				"users",
				alreadyConnectedUsers.map((id) => {
					return {
						id,
						color: io.sockets.sockets.get(id).data.color,
					}
				})
			)
			socket.broadcast
				.to(boardID)
				.emit("user connected", socket.id, socket.data.color)
			socket.emit("color", socket.data.color)
		})

		socket.on("sendMessage", (message: string) => {
			io.emit("recievedMessage", message)
		})

		// socket.on("startDrawing", (data) => {
		// 	data.id = socket.id
		// 	socket.broadcast.emit("startDrawing", data)
		// })

		// socket.on("stopDrawing", () => {
		// 	socket.broadcast.emit("stopDrawing")
		// })

		socket.on("canvasData", (data) => {
			socket.broadcast.to(socket.data.boardID).emit("canvasData", data)
		})

		socket.on("mousemove", (data) => {
			data.id = socket.id
			socket.broadcast.to(socket.data.boardID).emit("moving", data)
		})

		socket.on("disconnect", () => {
			console.log("client disconnected")
			socket.broadcast
				.to(socket.data.boardID)
				.emit("clientdisconnect", socket.id)
		})
	})

	app.all("*", (req: any, res: any) => nextHandler(req, res))

	server.listen(port, () => {
		console.log(`> Ready on http://localhost:${port}`)
	})
})
