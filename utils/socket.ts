/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import { io } from "socket.io-client"

function useSocket(url) {
	const [socket, setSocket] = useState(null)

	useEffect(() => {
		const socketIo = io(url)
		setSocket(socketIo)
		function cleanup() {
			socketIo.disconnect()
		}
		return cleanup
		// should only run once and not on every re-render,
		// so pass an empty array
	}, [])
	return socket
}

export default useSocket
