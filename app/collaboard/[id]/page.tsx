// @refresh reset
"use client"

import React, { MutableRefObject, useEffect, useRef, useState } from "react"
import useSocket from "../../../utils/socket"
import { useRouter } from "next/navigation"
import Pointer from "../pointer"
import ReactPaint from "../reactpaint"
import { User } from "@supabase/supabase-js"
import supabase from "../../../utils/supabaseClient"
import { toast } from "react-toastify"
import { Socket } from "socket.io-client"

function debounce(fn: Function, ms: number) {
	let timer: any
	return () => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			timer = null
			fn(fn, [])
		}, ms)
	}
}

function now() {
	return new Date().getTime()
}

const Draw = ({ params }) => {
	// Supabase States
	const [boardId, setBoardID] = useState()
	const [user, setUser] = useState<User>()
	const [board, setBoard] = useState({
		boardID: "",
		name: "",
		creatorID: "",
		isPublic: false,
		isViewOnly: false,
	})
	const [isLoading, setIsLoading] = useState(true)

	// Paint States
	const pointers = useRef<{
		[key: string]: Node
	}>({})
	const clients = useRef<{
		[key: string]: {
			id: string
			x: number
			y: number
			drawing: boolean
			updated: number
		}
	}>({})
	const userColor = useRef<string>("#3B82F6")
	// const [currUserPointer, setCurrUserPointer] = useState<HTMLDivElement>()
	const pointersElement =
		useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>

	const socket = useSocket("/")

	// Data recieved from clients for drawing
	const [buffer, setBuffer] = useState<string[]>([])
	const [undoBuffer, setUndoBuffer] = useState<string[]>([])
	const [redoBuffer, setRedoBuffer] = useState<string[]>([])

	const [dimensions, setDimensions] = useState({
		height: window.innerHeight,
		width: window.innerWidth,
	})

	const router = useRouter()
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

	useEffect(() => {
		if (!router) return
		;(async () => {
			const user = await supabase.auth.getUser()
			if (!user) {
				router.push("/")
			}
			setUser(user.data.user)
		})()
		const boardId = params.id
		if (boardId) {
			setBoardID(boardId)
		} else {
			toast.error("Board ID not found")
			router.push("/")
		}
	}, [params.id, router])

	useEffect(() => {
		if (!boardId || !user?.email) return
		;(async () => {
			const { data, error } = await supabase
				.from("boards")
				.select("*")
				.eq("boardID", boardId)
			if (error) {
				toast.error("Error fetching board")
				router.push("/")
				return
			}
			if (data.length === 0) {
				toast.error("Board not found")
				router.push("/")
				return
			}
			setBoard(data[0])

			// check if user has access
			if (data[0].creatorID !== user.id) {
				const { data: access, error: accessError } = await supabase
					.from("writeAccess")
					.select("*")
					.eq("boardID", boardId)
					.eq("email", user.email)
				if (accessError) {
					toast.error("Error fetching board")
					router.push("/")
					return
				}
				if (access.length === 0) {
					toast.error("You don't have access to this board")
					router.push("/")
					return
				}
			}
			setIsLoading(false)
		})()
	}, [boardId, router, user])

	// // initialize socket on hot reload
	// useEffect(() => {
	// 	if (!router || socket) return
	// 	router.refresh()
	// }, [router, socket])

	// handle window resize
	useEffect(() => {
		const debouncedHandleResize = debounce(function handleResize() {
			setDimensions({
				height: window.innerHeight,
				width: window.innerWidth,
			})
		}, 1000)

		window.addEventListener("resize", debouncedHandleResize)

		return () => {
			window.removeEventListener("resize", debouncedHandleResize)
		}
	})

	// socket events
	useEffect(() => {
		console.log(socket, pointersElement.current)

		if (!socket || !pointersElement.current) return

		console.log("socket connected")

		socket.emit("join", boardId)

		socket.on(
			"users",
			(
				users: {
					id: string
					color: string
				}[]
			) => {
				console.log(users)
				const newPointers = {}
				const newClients = {}
				users.forEach((user) => {
					if (user.id === socket.id || clients.current.hasOwnProperty(user.id))
						return
					console.log("new user", user)
					newPointers[user.id] = pointersElement.current.appendChild(
						document.getElementById("pointer-" + user.color).cloneNode(true)
					)
					newPointers[user.id].style.display = "block"
					newClients[user.id] = {
						id: user.id,
						x: 0,
						y: 0,
						drawing: false,
						updated: now(),
					}
				})
				pointers.current = newPointers
				clients.current = newClients
			}
		)

		socket.on("color", (color: string) => {
			userColor.current = color
		})

		socket.on("user connected", (id: string, socketColor: string) => {
			if (id === socket.id || clients.current.hasOwnProperty(id)) return
			console.log("user connected", id, socketColor)
			pointers.current = {
				...pointers.current,
				[id]: (function () {
					const newPointer = pointersElement.current.appendChild(
						// currUserPointer.cloneNode()
						document.getElementById("pointer-" + socketColor).cloneNode(true)
					) as HTMLDivElement
					newPointer.style.display = "block"
					return newPointer
				})(),
			}
			clients.current = {
				...clients.current,
				[id]: {
					id,
					x: 0,
					y: 0,
					drawing: false,
					updated: now(),
				},
			}
		})

		socket.on("canvasData", (data: any) => {
			setBuffer([...buffer, data])
		})

		socket.on(
			"moving",
			(data: {
				id: string
				mx: number
				my: number
				x: number
				y: number
				drawing: boolean
				tool: string
				updated: number
			}) => {
				const dataPointer = pointers.current[data.id] as HTMLDivElement

				dataPointer.style.left = Math.min(data.mx, dimensions.height) + "px"
				dataPointer.style.top = Math.min(data.my, dimensions.width) + "px"
				pointers.current = { ...pointers.current, [data.id]: dataPointer }

				// if (data.drawing && clients.current[data.id] && canvasContext) {
				// 	canvasContext.moveTo(
				// 		clients.current[data.id].x,
				// 		clients.current[data.id].y
				// 	)
				// 	canvasContext.lineTo(data.x, data.y)
				// 	canvasContext.stroke()
				// }

				// clients.current[data.id] = data
				// clients.current[data.id].updated = now()
				data.updated = now()
				clients.current = { ...clients.current, [data.id]: data }
			}
		)

		socket.on("clientdisconnect", (id: string) => {
			// delete clients.current[id]
			if (!clients.current.hasOwnProperty(id)) return
			const newClients = clients.current
			if (newClients.hasOwnProperty(id)) delete newClients[id]
			clients.current = newClients
			if (pointers.current[id]) {
				console.log("removing pointer", id)
				console.log(pointers.current[id].parentNode)
				pointers.current[id].parentNode?.removeChild(pointers.current[id])
				const newPointers = pointers.current
				if (newPointers.hasOwnProperty(id)) delete newPointers[id]
				pointers.current = newPointers
			}
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket])

	return (
		<div>
			<div className='hidden'>
				{pointerColors.map((color, i) => (
					<div
						key={i}
						id={`pointer-${color}`}
						className='absolute -rotate-12 -translate-x-1 -translate-y-1'>
						<Pointer color={color} />
					</div>
				))}
			</div>
			<div id='pointers' ref={pointersElement} className='z-50'></div>
			{/* <canvas
				id='canvas'
				width={dimensions.width}
				height={dimensions.height}
				ref={canvasElement}
				onMouseMove={(e) => {
					handleMouseMove(e)
				}}
				onMouseUp={(e) => {
					handleMouseUp(e)
				}}
				onMouseDown={(e) => {
					handleMouseDown(e)
				}}></canvas> */}
			<ReactPaint
				board={board}
				userId={user?.id}
				socket={socket}
				buffer={buffer}
				setBuffer={setBuffer}
				undoBuffer={undoBuffer}
				setUndoBuffer={setUndoBuffer}
				redoBuffer={redoBuffer}
				setRedoBuffer={setRedoBuffer}
			/>
			{process.env.NEXT_PUBLIC_NODE_ENV === "development" && (
				<div className='absolute bottom-0 h-fit w-full z-10 p-10'>
					{/* DEBUGGING INNTERFACE */}
					<div className='flex flex-row space-x-3 justify-evenly w-full'>
						<span
							className='text-white h-fit p-2'
							style={{ backgroundColor: userColor.current }}>
							Id: {socket?.id}
						</span>
						<div className='flex flex-col'>
							<div
								className='text-white p-2'
								style={{ backgroundColor: userColor.current }}>
								Clients
							</div>
							<div className='bg-blue-100 p-2'>
								{Object.keys(clients.current).map((id) => (
									<div key={id}>{id}</div>
								))}
								{/* {JSON.stringify(clients.current)} */}
							</div>
						</div>
						<div className='flex flex-col'>
							<div
								className='text-white p-2'
								style={{ backgroundColor: userColor.current }}>
								Pointers
							</div>
							<div className='bg-blue-100 p-2'>
								{Object.keys(pointers.current).map((id) => (
									<div key={id}>{id}</div>
								))}
								{/* {JSON.stringify(pointers.current)} */}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default Draw
