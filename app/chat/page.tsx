"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import useSocket from "../../utils/socket"

const Chat = () => {
	const [messages, setMessages] = useState([])
	const [message, setMessage] = useState("")
	const socket = useSocket("/")

	useEffect(() => {
		if (!socket) return
		socket.on("status", (msg: string) => {
			console.log(msg)
		})
		socket.on("recievedMessage", (msg: string) => {
			setMessages((messages) => [...messages, msg])
		})
	}, [socket])

	return (
		<div>
			<h1>Home</h1>
			{messages.map((message, index) => (
				<div key={index}>{message}</div>
			))}
			<form onSubmit={(e) => e.preventDefault()}>
				<input
					type='text'
					name='message'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<button
					type='submit'
					onClick={() => {
						socket.emit("sendMessage", message)
						setMessage("")
					}}>
					Send
				</button>
			</form>
		</div>
	)
}

export default Chat
