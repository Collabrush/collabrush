import { Server, Socket } from "socket.io"

const messageHandler = (_io: Server, socket: Socket) => {
	const createdMessage = (msg: any) => {
		socket.broadcast.emit("newIncomingMessage", msg)
	}

	socket.on("createdMessage", createdMessage)
}

export default messageHandler
