// @refresh reset
"use client"

import React, { MutableRefObject, useEffect, useRef, useState } from "react"
import useSocket from "../../utils/socket"
import { useRouter } from "next/router"

// function drawLine(
// 	canvasContext: CanvasRenderingContext2D,
// 	fromx: number,
// 	fromy: number,
// 	tox: number,
// 	toy: number
// ) {
// 	canvasContext.moveTo(fromx, fromy)
// 	canvasContext.lineTo(tox, toy)
// 	canvasContext.stroke()
// }

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

const Draw = () => {
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
	const [currUserPointer, setCurrUserPointer] = useState<HTMLDivElement>()
	const canvasElement =
		useRef<HTMLCanvasElement>() as MutableRefObject<HTMLCanvasElement>
	const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D>()
	const pointersElement =
		useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>

	const socket = useSocket("/")
	const [drawing, setDrawing] = useState(false)
	const [prevPos, setPrevPos] = useState({ x: 0, y: 0 })
	const [dimensions, setDimensions] = useState({
		height: window.innerHeight,
		width: window.innerWidth,
	})

	const router = useRouter()

	useEffect(() => {
		if (!router || socket) return
		router.reload()
	}, [router, socket])

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

	useEffect(() => {
		if (
			!socket ||
			!currUserPointer ||
			!canvasContext ||
			!pointersElement.current
		)
			return

		socket.on("users", (users: string[]) => {
			// console.log(users)
			const newPointers = {}
			const newClients = {}
			users.forEach((id) => {
				if (id === socket.id || clients.current.hasOwnProperty(id)) return
				console.log("new user", id)
				newPointers[id] = pointersElement.current.appendChild(
					currUserPointer.cloneNode()
				)
				newPointers[id].style.display = "block"
				newClients[id] = {
					id,
					x: 0,
					y: 0,
					drawing: false,
					updated: now(),
				}
			})
			pointers.current = newPointers
			clients.current = newClients
		})

		socket.on("user connected", (id: string) => {
			if (id === socket.id || clients.current.hasOwnProperty(id)) return
			console.log("user connected", id)
			pointers.current = {
				...pointers.current,
				[id]: (function () {
					const newPointer = pointersElement.current.appendChild(
						currUserPointer.cloneNode()
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

		socket.on(
			"moving",
			(data: {
				id: string
				x: number
				y: number
				drawing: boolean
				updated: number
			}) => {
				const dataPointer = pointers.current[data.id] as HTMLDivElement

				dataPointer.style.left = data.x + "px"
				dataPointer.style.top = data.y + "px"
				pointers.current = { ...pointers.current, [data.id]: dataPointer }

				if (data.drawing && clients.current[data.id] && canvasContext) {
					canvasContext.moveTo(
						clients.current[data.id].x,
						clients.current[data.id].y
					)
					canvasContext.lineTo(data.x, data.y)
					canvasContext.stroke()
				}

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
	}, [socket, currUserPointer, canvasContext])

	useEffect(() => {
		if (!canvasElement.current || !pointersElement.current) return
		setCurrUserPointer(document.createElement("div"))
		const ctx = canvasElement.current.getContext(
			"2d"
		) as CanvasRenderingContext2D
		setCanvasContext(ctx)
	}, [canvasElement, pointersElement])

	useEffect(() => {
		if (!currUserPointer || !canvasElement.current || !canvasContext) return
		canvasContext.fillStyle = "white"
		canvasContext.fillRect(
			0,
			0,
			canvasElement.current.width,
			canvasElement.current.height
		)
		currUserPointer.setAttribute("class", "pointer")
		currUserPointer.style.display = "none"
	}, [canvasContext, currUserPointer, canvasElement])

	const handleMouseUp = (
		e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
	) => {
		// canvasContext.closePath()
		setDrawing(false)
	}

	const handleMouseMove = (
		e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
	) => {
		// if (now() - lastEmit > 50) {
		socket.emit("mousemove", {
			x: e.pageX,
			y: e.pageY,
			drawing: drawing,
		})
		// lastEmit = now()
		// }

		if (drawing) {
			canvasContext.moveTo(prevPos.x, prevPos.y)
			canvasContext.lineTo(e.pageX, e.pageY)
			canvasContext.stroke()
			setPrevPos({ x: e.pageX, y: e.pageY })
		}
	}

	const handleMouseDown = (
		e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
	) => {
		setDrawing(true)
		setPrevPos({ x: e.pageX, y: e.pageY })
	}

	return (
		<div>
			<div id='pointers' ref={pointersElement}></div>
			<canvas
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
				}}></canvas>
			<div className='absolute bottom-0 h-fit w-full z-10 p-10'>
				{/* DEBUGGING INNTERFACE */}
				<div className='flex flex-row space-x-3 justify-evenly w-full'>
					<span className='bg-blue-500 text-white h-fit p-2'>
						Id: {socket?.id}
					</span>
					<div className='flex flex-col'>
						<div className='bg-blue-500 text-white p-2'>Clients</div>
						<div className='bg-blue-100 p-2'>
							{Object.keys(clients.current).map((id) => (
								<div key={id}>{id}</div>
							))}
							{/* {JSON.stringify(clients.current)} */}
						</div>
					</div>
					<div className='flex flex-col'>
						<div className='bg-blue-500 text-white p-2'>Pointers</div>
						<div className='bg-blue-100 p-2'>
							{Object.keys(pointers.current).map((id) => (
								<div key={id}>{id}</div>
							))}
							{/* {JSON.stringify(pointers.current)} */}
						</div>
					</div>
					<div
						className='bg-blue-500 text-white p-2 cursor-pointer h-fit'
						onClick={() => {
							canvasContext.clearRect(
								0,
								0,
								canvasElement.current.width,
								canvasElement.current.height
							)
						}}>
						Clear canvas
					</div>
				</div>
			</div>
		</div>
	)
}

export default Draw
