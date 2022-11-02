"use client"

import React, { MutableRefObject, useEffect, useRef, useState } from "react"
import useSocket from "../../utils/socket"

function drawLine(
	canvasContext: CanvasRenderingContext2D,
	fromx: number,
	fromy: number,
	tox: number,
	toy: number
) {
	canvasContext.moveTo(fromx, fromy)
	canvasContext.lineTo(tox, toy)
	canvasContext.stroke()
}

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
	const [pointers, setPointers] = useState<{
		[key: string]: Node
	}>({})
	const [clients, setClients] = useState({})
	const [currUserPointer, setCurrUserPointer] = useState<HTMLDivElement>()
	const canvasElement =
		useRef<HTMLCanvasElement>() as MutableRefObject<HTMLCanvasElement>
	const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D>()
	const pointersElement =
		useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>

	const socket = useSocket("/")
	const [drawing, setDrawing] = useState(false)
	const [prevPos, setPrevPos] = useState({ x: 0, y: 0 })
	const onClientMouseMoveCallback = useRef<any>(() => {})
	const onClientDisconnectCallback = useRef<any>(() => {})
	const [dimensions, setDimensions] = useState({
		height: window.innerHeight,
		width: window.innerWidth,
	})

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
		onClientMouseMoveCallback.current = (data: {
			id: string
			x: number
			y: number
			drawing: boolean
			updated: number
		}) => {
			const dataPointer = pointers[data.id] as HTMLDivElement

			dataPointer.style.left = data.x + "px"
			dataPointer.style.top = data.y + "px"
			setPointers({ ...pointers, [data.id]: dataPointer })

			if (data.drawing && clients[data.id] && canvasContext) {
				drawLine(
					canvasContext,
					clients[data.id].x,
					clients[data.id].y,
					data.x,
					data.y
				)
			}

			// clients[data.id] = data
			// clients[data.id].updated = now()
			data.updated = now()
			setClients({ ...clients, [data.id]: data })
		}
		onClientDisconnectCallback.current = (id: string) => {
			// delete clients[id]
			if (!clients.hasOwnProperty(id)) return
			setClients((clients) => {
				const newClients = { ...clients }
				delete newClients[id]
				return newClients
			})
			if (pointers[id]) {
				console.log("removing pointer", id)
				console.log(pointers[id].parentNode)
				pointers[id].parentNode?.removeChild(pointers[id])
				setPointers((pointers) => {
					const newPointers = { ...pointers }
					delete newPointers[id]
					return newPointers
				})
			}
		}
	}, [canvasContext, clients, pointers])

	useEffect(() => {
		if (
			!socket ||
			!currUserPointer ||
			!canvasContext ||
			!pointersElement.current
		)
			return

		socket.on("users", (users: string[]) => {
			console.log(users)
			const newPointers = {}
			users.forEach((id) => {
				if (id === socket.id || clients.hasOwnProperty(id)) return
				console.log("new user", id)
				newPointers[id] = pointersElement.current.appendChild(
					currUserPointer.cloneNode()
				)
				newPointers[id].style.display = "block"
			})
			setPointers(newPointers)
		})

		socket.on("user connected", (id: string) => {
			if (id === socket.id || clients.hasOwnProperty(id)) return
			console.log("user connected", id)
			setPointers({
				...pointers,
				[id]: (function () {
					const newPointer = pointersElement.current.appendChild(
						currUserPointer.cloneNode()
					) as HTMLDivElement
					newPointer.style.display = "block"
					return newPointer
				})(),
			})
		})

		socket.on(
			"moving",
			(data: {
				id: PropertyKey
				x: number
				y: number
				drawing: boolean
				updated: number
			}) => {
				onClientMouseMoveCallback.current(data)
			}
		)

		socket.on("clientdisconnect", (id: string) => {
			onClientDisconnectCallback.current(id)
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

		canvasElement.current.onmouseup =
			canvasElement.current.onmousemove =
			canvasElement.current.onmousedown =
				function (e) {
					switch (e.type) {
						case "mouseup":
							setDrawing(false)
							break

						case "mousemove":
							// if (now() - lastEmit > 50) {
							socket.emit("mousemove", {
								x: e.pageX,
								y: e.pageY,
								drawing: drawing,
							})
							// lastEmit = now()
							// }

							if (drawing) {
								drawLine(canvasContext, prevPos.x, prevPos.y, e.pageX, e.pageY)
								setPrevPos({ x: e.pageX, y: e.pageY })
							}
							break

						case "mousedown":
							setDrawing(true)
							setPrevPos({ x: e.pageX, y: e.pageY })
							break

						default:
							break
					}
				}
	}, [canvasContext, currUserPointer, drawing, prevPos.x, prevPos.y, socket])

	return (
		<div>
			<div id='pointers' ref={pointersElement}></div>
			<canvas
				id='canvas'
				width={dimensions.width}
				height={dimensions.height}
				ref={canvasElement}></canvas>
		</div>
	)
}

export default Draw
