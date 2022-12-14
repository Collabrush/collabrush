/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import React, {
	MutableRefObject,
	TouchEvent,
	TouchEventHandler,
	useEffect,
	useRef,
	useState,
} from "react"
import { Socket } from "socket.io-client"
import floodFill from "../../utils/floodFill"
import supabase from "../../utils/supabaseClient"
import useInterval from "../../utils/useIntervalhook"
import { decode } from "base64-arraybuffer"

import Toolbox from "./toolbox"
import dataURItoBlob from "../../utils/dataURItoblob"

const Content = (props: {
	board: any
	activeItem: string
	color: string | CanvasGradient | CanvasPattern
	items: any
	handleClick: any
	setColor: any
	strokeWidth: number
	socket: Socket
	buffer: string[]
	setBuffer: Function
	undoBuffer: string[]
	setUndoBuffer: Function
	redoBuffer: string[]
	setRedoBuffer: Function
}) => {
	const [isDrawing, setIsDrawing] = useState(false)
	const [cursor, setCursor] = useState("cursor-crosshair")
	const [editingImage, setEditingImage] = useState(false)
	const [imageData, setImageData] = useState(null)
	const [imagePosition, setImagePosition] = useState({
		x: 0,
		y: 0,
		x2: 0,
		y2: 0,
	})
	const [imageOffset, setImageOffset] = useState({
		offsetX: 0,
		offsetY: 0,
	})
	const pickerRef = useRef(null)
	const [offsetX, setOffsetX] = useState(0)
	const [offsetY, setOffsetY] = useState(0)
	const [startX, setStartX] = useState(0)
	const [startY, setStartY] = useState(0)
	const canvasRef =
		useRef<HTMLCanvasElement>() as MutableRefObject<HTMLCanvasElement>
	const canvasOverlayRef =
		useRef<HTMLCanvasElement>() as MutableRefObject<HTMLCanvasElement>
	const canvasSocketRef =
		useRef<HTMLCanvasElement>() as MutableRefObject<HTMLCanvasElement>

	const [ctx, setCtx] = useState<CanvasRenderingContext2D>()
	const [ctxOverlay, setCtxOverlay] = useState<CanvasRenderingContext2D>()
	const [ctxSocket, setCtxSocket] = useState<CanvasRenderingContext2D>()

	const [autoSave, setAutoSave] = useState(false)

	useEffect(() => {
		if (
			!canvasRef.current ||
			!canvasOverlayRef.current ||
			!canvasSocketRef.current ||
			props.board.boardID == ""
		)
			return
		let canvasRect = canvasRef.current.getBoundingClientRect()
		const ctx = canvasRef.current.getContext("2d")
		setCtx(ctx)
		setCtxOverlay(canvasOverlayRef.current.getContext("2d"))
		setCtxSocket(canvasSocketRef.current.getContext("2d"))
		setOffsetX(canvasRect.left + 3)
		setOffsetY(canvasRect.top + 3)
		ctx.fillStyle = "white"
		ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
		ctx.stroke()

		// check if canvas data exists in storage
		;(async () => {
			const { data: canvasData, error } = await supabase.storage
				.from("canvas")
				.list()
			if (error) {
				console.log(error)
			} else {
				console.log(canvasData)
				if (canvasData.length > 0) {
					let imagePresent = false
					canvasData.forEach(async (canvas) => {
						console.log(props.board.boardID)
						if (canvas.name == props.board.boardID + ".jpeg") {
							imagePresent = true
							const {
								data: { signedUrl: url },
							} = await supabase.storage
								.from("canvas")
								.createSignedUrl(canvas.name, 8)
							if (error) {
								console.log(error)
							}
							console.log(url)
							const img = new Image()
							img.crossOrigin = "anonymous"
							img.onload = () => {
								ctx.drawImage(img, 0, 0)
							}
							img.src = url
							return
						}
					})
					props.setUndoBuffer([canvasRef.current.toDataURL()])
					setTimeout(() => {
						setAutoSave(true)
					}, 5000)
				}
			}
		})()
	}, [canvasRef, canvasOverlayRef, canvasSocketRef, props.board])

	useEffect(() => {
		if (!ctx || isDrawing) return
		while (props.buffer.length > 0) {
			const img = new Image()
			img.onload = () => {
				ctx.drawImage(img, 0, 0)
			}
			img.src = props.buffer[0]
			const newBuffer = props.buffer
			newBuffer.shift()
			props.setBuffer(newBuffer)
		}
	}, [ctx, isDrawing, props.buffer])

	// auto save canvas
	useInterval(
		async () => {
			if (!ctx) return
			// save canvas to supabase storage
			const dataURL = canvasRef.current.toDataURL("image/jpeg", 0.05)
			const dataURLHD = canvasRef.current.toDataURL("image/jpeg")
			const { data: image, error } = await supabase.storage
				.from("thumbnails")
				.upload(props.board.boardID + ".jpeg", dataURItoBlob(dataURL), {
					contentType: "image/jpeg",
					upsert: true,
				})
			if (error) {
				console.log("Error uploading thumbnail", error)
			}
			const { data: _image, error: error2 } = await supabase.storage
				.from("canvas")
				.upload(props.board.boardID + ".jpeg", dataURItoBlob(dataURLHD), {
					contentType: "image/jpeg",
					upsert: true,
				})
			if (error2) {
				console.log("Error uploading thumbcanvas datanail", error)
			}
			const { data, error: _error } = await supabase
				.from("boards")
				.update({ thumbnail: image.path })
				.eq("boardID", props.board.boardID)
			if (_error) {
				console.log("Error updating thumbnail", error)
			}
		},
		autoSave ? 8000 : null
	)

	//helpers
	const getPixelColor = (x: number, y: number) => {
		var pxData = ctx.getImageData(x, y, 1, 1)
		return (
			"rgb(" +
			pxData.data[0] +
			"," +
			pxData.data[1] +
			"," +
			pxData.data[2] +
			")"
		)
	}

	// computer event handlers
	const handleMouseDown = (e: { clientX: number; clientY: number }) => {
		let activeItem = props.activeItem
		if (editingImage) {
			// check if click is outside image which is in contextOverlay
			if (
				e.clientX < imagePosition.x ||
				e.clientX > imagePosition.x2 ||
				e.clientY < imagePosition.y ||
				e.clientY > imagePosition.y2
			) {
				setEditingImage(false)
				setCursor("cursor-crosshair")
				ctxOverlay.clearRect(
					imagePosition.x,
					imagePosition.y,
					imagePosition.x2 - imagePosition.x,
					imagePosition.y2 - imagePosition.y
				)
				ctx.drawImage(imageData, imagePosition.x, imagePosition.y)
				return
			} else {
				setCursor("cursor-grabbing")
				setImageOffset({
					offsetX: e.clientX - imagePosition.x,
					offsetY: e.clientY - imagePosition.y,
				})
			}
		}
		if (activeItem === "Picker") {
			const color = getPixelColor(e.clientX - offsetX, e.clientY - offsetY)
			props.setColor(color)
			props.handleClick(null, "changeTool", "Brush")
			return
		}
		setIsDrawing(true)
		ctx.beginPath()
		ctx.strokeStyle = props.color
		ctx.lineWidth = props.strokeWidth
		ctx.lineJoin = ctx.lineCap = "round"
		// socket
		ctxSocket.beginPath()
		ctxSocket.strokeStyle = props.color
		ctxSocket.lineWidth = props.strokeWidth
		ctxSocket.lineJoin = ctx.lineCap = "round"

		if (activeItem === "Pencil" || activeItem === "Brush") {
			ctx.moveTo(e.clientX - offsetX, e.clientY - offsetY)
			if (activeItem === "Brush") ctx.lineWidth = 5 + 2 * props.strokeWidth
			// socket
			ctxSocket.moveTo(e.clientX - offsetX, e.clientY - offsetY)
			if (activeItem === "Brush")
				ctxSocket.lineWidth = 5 + 2 * props.strokeWidth
		} else if (
			activeItem === "Line" ||
			activeItem === "Rectangle" ||
			activeItem === "Oval"
		) {
			ctxOverlay.strokeStyle = props.color
			ctxOverlay.lineWidth = props.strokeWidth
			ctxOverlay.lineJoin = ctx.lineCap = "round"
			setStartX(e.clientX - offsetX)
			setStartY(e.clientY - offsetY)
		} else if (activeItem === "Erase") {
			ctx.strokeStyle = "white"
			ctx.moveTo(e.clientX - offsetX, e.clientY - offsetY)
			// socket
			ctxSocket.strokeStyle = "white"
			ctxSocket.moveTo(e.clientX - offsetX, e.clientY - offsetY)
		}

		// props.socket.emit("startDrawing", {
		// 	color: activeItem === "Erase" ? "white" : props.color,
		// 	stroke: props.strokeWidth,
		// })
	}

	const handleMouseMove = (e: {
		clientX: number
		clientY: number
		shiftKey: boolean
	}) => {
		if (isDrawing) {
			if (editingImage) {
				// check if mouse is over image
				if (
					e.clientX > imagePosition.x &&
					e.clientX < imagePosition.x2 &&
					e.clientY > imagePosition.y &&
					e.clientY < imagePosition.y2
				) {
					ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
					ctxOverlay.drawImage(
						imageData,
						e.clientX - imageOffset.offsetX,
						e.clientY - imageOffset.offsetY
					)
					setImagePosition({
						x: e.clientX - imageOffset.offsetX,
						y: e.clientY - imageOffset.offsetY,
						x2: e.clientX - imageOffset.offsetX + imageData.width,
						y2: e.clientY - imageOffset.offsetY + imageData.height,
					})
				}
			} else {
				if (
					props.activeItem === "Pencil" ||
					props.activeItem === "Brush" ||
					props.activeItem === "Erase"
				) {
					ctx.lineTo(e.clientX - offsetX, e.clientY - offsetY)
					ctx.stroke()
					ctxSocket.lineTo(e.clientX - offsetX, e.clientY - offsetY)
					ctxSocket.stroke()
				}
				if (props.activeItem === "Line") {
					ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
					ctxOverlay.beginPath()
					ctxOverlay.moveTo(startX, startY)
					ctxOverlay.lineTo(e.clientX - offsetX, e.clientY - offsetY)
					ctxOverlay.stroke()
					ctxOverlay.closePath()
				}
				if (props.activeItem === "Rectangle") {
					ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
					let width = e.clientX - offsetX - startX
					let height = e.clientY - offsetY - startY
					ctxOverlay.strokeRect(startX + 2, startY + 2, width + 2, height + 2)
				}
				if (props.activeItem === "Oval") {
					ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
					let width = e.clientX - offsetX - startX
					let height = e.clientY - offsetY - startY
					ctxOverlay.beginPath()
					if (e.shiftKey) {
						let radius = Math.min(Math.abs(width), Math.abs(height)) / 2
						ctxOverlay.ellipse(
							startX + width / 2 + 2,
							startY + height / 2 + 2,
							radius + 2,
							radius + 2,
							0,
							0,
							2 * Math.PI
						)
					} else {
						ctxOverlay.ellipse(
							startX + width / 2 + 2,
							startY + height / 2 + 2,
							Math.abs(width / 2) + 2,
							Math.abs(height / 2) + 2,
							0,
							0,
							2 * Math.PI
						)
					}
					ctxOverlay.stroke()
					ctxOverlay.closePath()
				}
			}
		} else {
			if (props.activeItem === "Picker") {
				const color = getPixelColor(e.clientX - offsetX, e.clientY - offsetY)
				pickerRef.current.style.backgroundColor = color
				pickerRef.current.style.top = e.clientY - offsetY - 60 + "px"
				pickerRef.current.style.left = e.clientX - offsetX + 50 + "px"
			}
		}
		if (props.socket) {
			props.socket.emit("mousemove", {
				mx: e.clientX,
				my: e.clientY,
				x: e.clientX - offsetX,
				y: e.clientY - offsetY,
				drawing: isDrawing,
				tool: props.activeItem,
			})
		}
	}

	const handleMouseUp = (e: {
		clientX: number
		clientY: number
		shiftKey: boolean
	}) => {
		if (editingImage) {
			// check if click is outside image which is in contextOverlay
			if (
				e.clientX < imagePosition.x ||
				e.clientX > imagePosition.x2 ||
				e.clientY < imagePosition.y ||
				e.clientY > imagePosition.y2
			) {
				setEditingImage(false)
				setCursor("cursor-crosshair")
				return
			} else {
				setCursor("cursor-grab")
			}
		}

		if (props.activeItem === "Line") {
			ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
			ctx.moveTo(startX, startY)
			ctx.lineTo(e.clientX - offsetX, e.clientY - offsetY)
			ctx.stroke()
			// socket
			ctxSocket.moveTo(startX, startY)
			ctxSocket.lineTo(e.clientX - offsetX, e.clientY - offsetY)
			ctxSocket.stroke()
		}

		if (props.activeItem === "Rectangle") {
			let width = e.clientX - offsetX - startX
			let height = e.clientY - offsetY - startY
			ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
			ctx.strokeRect(startX, startY, width, height)
			// socket
			ctxSocket.strokeRect(startX, startY, width, height)
		}

		if (props.activeItem === "Oval") {
			let width = e.clientX - offsetX - startX
			let height = e.clientY - offsetY - startY
			ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
			ctx.beginPath()
			if (e.shiftKey) {
				let radius = Math.min(Math.abs(width), Math.abs(height)) / 2
				ctx.ellipse(
					startX + width / 2,
					startY + height / 2,
					radius,
					radius,
					0,
					0,
					2 * Math.PI
				)
			} else {
				ctx.ellipse(
					startX + width / 2,
					startY + height / 2,
					Math.abs(width / 2),
					Math.abs(height / 2),
					0,
					0,
					2 * Math.PI
				)
			}
			ctx.stroke()
			// socket
			ctxSocket.beginPath()
			if (e.shiftKey) {
				let radius = Math.min(Math.abs(width), Math.abs(height)) / 2
				ctxSocket.ellipse(
					startX + width / 2,
					startY + height / 2,
					radius,
					radius,
					0,
					0,
					2 * Math.PI
				)
			} else {
				ctxSocket.ellipse(
					startX + width / 2,
					startY + height / 2,
					Math.abs(width / 2),
					Math.abs(height / 2),
					0,
					0,
					2 * Math.PI
				)
			}
			ctxSocket.stroke()
		}

		if (props.activeItem === "Fill") {
			const color = getPixelColor(e.clientX - offsetX, e.clientY - offsetY)
			if (color === props.color) return
			const startX = e.clientX - offsetX
			const startY = e.clientY - offsetY
			const splitColor = props.color.toString().slice(4, -1).split(",")
			const fillColor = [splitColor[0], splitColor[1], splitColor[2]]
			floodFill(ctx, startX, startY, fillColor, ctxSocket)
		}

		ctx.closePath()
		ctxSocket.closePath()
		setIsDrawing(false)
		if (props.socket) {
			// props.socket.emit("stopDrawing")
			// send data to socket
			props.socket.emit(
				"canvasData",
				canvasSocketRef.current.toDataURL("image/png")
			)
			ctxSocket.clearRect(0, 0, window.innerWidth, window.innerHeight)
		}
		const newBuffer = props.undoBuffer
		if (props.undoBuffer.length > 10) {
			newBuffer.shift()
		}
		props.setUndoBuffer([...newBuffer, canvasRef.current.toDataURL()])
		if (props.redoBuffer.length > 0) props.setRedoBuffer([])
	}

	// computer event handlers
	const handleTouchStart: TouchEventHandler<HTMLCanvasElement> = (
		e: TouchEvent<HTMLCanvasElement>
	) => {
		let activeItem = props.activeItem
		const clientX = e.targetTouches[0]
			? e.targetTouches[0].pageX
			: e.changedTouches[e.changedTouches.length - 1].pageX
		const clientY = e.targetTouches[0]
			? e.targetTouches[0].pageY
			: e.changedTouches[e.changedTouches.length - 1].pageY
		if (editingImage) {
			// check if click is outside image which is in contextOverlay
			if (
				clientX < imagePosition.x ||
				clientX > imagePosition.x2 ||
				clientY < imagePosition.y ||
				clientY > imagePosition.y2
			) {
				setEditingImage(false)
				setCursor("cursor-crosshair")
				ctxOverlay.clearRect(
					imagePosition.x,
					imagePosition.y,
					imagePosition.x2 - imagePosition.x,
					imagePosition.y2 - imagePosition.y
				)
				ctx.drawImage(imageData, imagePosition.x, imagePosition.y)
				return
			} else {
				setCursor("cursor-grabbing")
				setImageOffset({
					offsetX: clientX - imagePosition.x,
					offsetY: clientY - imagePosition.y,
				})
			}
		}
		if (activeItem === "Picker") {
			const color = getPixelColor(clientX - offsetX, clientY - offsetY)
			props.setColor(color)
			props.handleClick(null, "changeTool", "Brush")
			return
		}
		setIsDrawing(true)
		ctx.beginPath()
		ctx.strokeStyle = props.color
		ctx.lineWidth = props.strokeWidth
		ctx.lineJoin = ctx.lineCap = "round"
		// socket
		ctxSocket.beginPath()
		ctxSocket.strokeStyle = props.color
		ctxSocket.lineWidth = props.strokeWidth
		ctxSocket.lineJoin = ctx.lineCap = "round"

		if (activeItem === "Pencil" || activeItem === "Brush") {
			ctx.moveTo(clientX - offsetX, clientY - offsetY)
			if (activeItem === "Brush") ctx.lineWidth = 5 + 2 * props.strokeWidth
			// socket
			ctxSocket.moveTo(clientX - offsetX, clientY - offsetY)
			if (activeItem === "Brush")
				ctxSocket.lineWidth = 5 + 2 * props.strokeWidth
		} else if (
			activeItem === "Line" ||
			activeItem === "Rectangle" ||
			activeItem === "Oval"
		) {
			ctxOverlay.strokeStyle = props.color
			ctxOverlay.lineWidth = props.strokeWidth
			ctxOverlay.lineJoin = ctx.lineCap = "round"
			setStartX(clientX - offsetX)
			setStartY(clientY - offsetY)
		} else if (activeItem === "Erase") {
			ctx.strokeStyle = "white"
			ctx.moveTo(clientX - offsetX, clientY - offsetY)
			// socket
			ctxSocket.strokeStyle = "white"
			ctxSocket.moveTo(clientX - offsetX, clientY - offsetY)
		}
		e.preventDefault()

		// props.socket.emit("startDrawing", {
		// 	color: activeItem === "Erase" ? "white" : props.color,
		// 	stroke: props.strokeWidth,
		// })
	}

	const handleTouchMove: TouchEventHandler<HTMLCanvasElement> = (
		e: TouchEvent<HTMLCanvasElement>
	) => {
		const clientX = e.targetTouches[0]
			? e.targetTouches[0].pageX
			: e.changedTouches[e.changedTouches.length - 1].pageX
		const clientY = e.targetTouches[0]
			? e.targetTouches[0].pageY
			: e.changedTouches[e.changedTouches.length - 1].pageY
		if (isDrawing) {
			if (editingImage) {
				// check if mouse is over image
				if (
					clientX > imagePosition.x &&
					clientX < imagePosition.x2 &&
					clientY > imagePosition.y &&
					clientY < imagePosition.y2
				) {
					ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
					ctxOverlay.drawImage(
						imageData,
						clientX - imageOffset.offsetX,
						clientY - imageOffset.offsetY
					)
					setImagePosition({
						x: clientX - imageOffset.offsetX,
						y: clientY - imageOffset.offsetY,
						x2: clientX - imageOffset.offsetX + imageData.width,
						y2: clientY - imageOffset.offsetY + imageData.height,
					})
				}
			} else {
				if (
					props.activeItem === "Pencil" ||
					props.activeItem === "Brush" ||
					props.activeItem === "Erase"
				) {
					ctx.lineTo(clientX - offsetX, clientY - offsetY)
					ctx.stroke()
					ctxSocket.lineTo(clientX - offsetX, clientY - offsetY)
					ctxSocket.stroke()
				}
				if (props.activeItem === "Line") {
					ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
					ctxOverlay.beginPath()
					ctxOverlay.moveTo(startX, startY)
					ctxOverlay.lineTo(clientX - offsetX, clientY - offsetY)
					ctxOverlay.stroke()
					ctxOverlay.closePath()
				}
				if (props.activeItem === "Rectangle") {
					ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
					let width = clientX - offsetX - startX
					let height = clientY - offsetY - startY
					ctxOverlay.strokeRect(startX + 2, startY + 2, width + 2, height + 2)
				}
				if (props.activeItem === "Oval") {
					ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
					let width = clientX - offsetX - startX
					let height = clientY - offsetY - startY
					ctxOverlay.beginPath()
					if (e.shiftKey) {
						let radius = Math.min(Math.abs(width), Math.abs(height)) / 2
						ctxOverlay.ellipse(
							startX + width / 2 + 2,
							startY + height / 2 + 2,
							radius + 2,
							radius + 2,
							0,
							0,
							2 * Math.PI
						)
					} else {
						ctxOverlay.ellipse(
							startX + width / 2 + 2,
							startY + height / 2 + 2,
							Math.abs(width / 2) + 2,
							Math.abs(height / 2) + 2,
							0,
							0,
							2 * Math.PI
						)
					}
					ctxOverlay.stroke()
					ctxOverlay.closePath()
				}
			}
		} else {
			if (props.activeItem === "Picker") {
				const color = getPixelColor(clientX - offsetX, clientY - offsetY)
				pickerRef.current.style.backgroundColor = color
				pickerRef.current.style.top = clientY - offsetY - 60 + "px"
				pickerRef.current.style.left = clientX - offsetX + 50 + "px"
			}
		}
		if (props.socket) {
			props.socket.emit("mousemove", {
				mx: clientX,
				my: clientY,
				x: clientX - offsetX,
				y: clientY - offsetY,
				drawing: isDrawing,
				tool: props.activeItem,
			})
		}
		e.preventDefault()
	}

	const handleTouchEnd: TouchEventHandler<HTMLCanvasElement> = (
		e: TouchEvent<HTMLCanvasElement>
	) => {
		const clientX = e.targetTouches[0]
			? e.targetTouches[0].pageX
			: e.changedTouches[e.changedTouches.length - 1].pageX
		const clientY = e.targetTouches[0]
			? e.targetTouches[0].pageY
			: e.changedTouches[e.changedTouches.length - 1].pageY
		if (editingImage) {
			// check if click is outside image which is in contextOverlay
			if (
				clientX < imagePosition.x ||
				clientX > imagePosition.x2 ||
				clientY < imagePosition.y ||
				clientY > imagePosition.y2
			) {
				setEditingImage(false)
				setCursor("cursor-crosshair")
				return
			} else {
				setCursor("cursor-grab")
			}
		}

		if (props.activeItem === "Line") {
			ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
			ctx.moveTo(startX, startY)
			ctx.lineTo(clientX - offsetX, clientY - offsetY)
			ctx.stroke()
			// socket
			ctxSocket.moveTo(startX, startY)
			ctxSocket.lineTo(clientX - offsetX, clientY - offsetY)
			ctxSocket.stroke()
		}

		if (props.activeItem === "Rectangle") {
			let width = clientX - offsetX - startX
			let height = clientY - offsetY - startY
			ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
			ctx.strokeRect(startX, startY, width, height)
			// socket
			ctxSocket.strokeRect(startX, startY, width, height)
		}

		if (props.activeItem === "Oval") {
			let width = clientX - offsetX - startX
			let height = clientY - offsetY - startY
			ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
			ctx.beginPath()
			if (e.shiftKey) {
				let radius = Math.min(Math.abs(width), Math.abs(height)) / 2
				ctx.ellipse(
					startX + width / 2,
					startY + height / 2,
					radius,
					radius,
					0,
					0,
					2 * Math.PI
				)
			} else {
				ctx.ellipse(
					startX + width / 2,
					startY + height / 2,
					Math.abs(width / 2),
					Math.abs(height / 2),
					0,
					0,
					2 * Math.PI
				)
			}
			ctx.stroke()
			// socket
			ctxSocket.beginPath()
			if (e.shiftKey) {
				let radius = Math.min(Math.abs(width), Math.abs(height)) / 2
				ctxSocket.ellipse(
					startX + width / 2,
					startY + height / 2,
					radius,
					radius,
					0,
					0,
					2 * Math.PI
				)
			} else {
				ctxSocket.ellipse(
					startX + width / 2,
					startY + height / 2,
					Math.abs(width / 2),
					Math.abs(height / 2),
					0,
					0,
					2 * Math.PI
				)
			}
			ctxSocket.stroke()
		}

		if (props.activeItem === "Fill") {
			const color = getPixelColor(clientX - offsetX, clientY - offsetY)
			if (color === props.color) return
			const startX = clientX - offsetX
			const startY = clientY - offsetY
			const splitColor = props.color.toString().slice(4, -1).split(",")
			const fillColor = [splitColor[0], splitColor[1], splitColor[2]]
			floodFill(ctx, startX, startY, fillColor, ctxSocket)
		}

		ctx.closePath()
		ctxSocket.closePath()
		setIsDrawing(false)
		if (props.socket) {
			// props.socket.emit("stopDrawing")
			// send data to socket
			props.socket.emit(
				"canvasData",
				canvasSocketRef.current.toDataURL("image/png")
			)
			ctxSocket.clearRect(0, 0, window.innerWidth, window.innerHeight)
		}
		const newBuffer = props.undoBuffer
		if (props.undoBuffer.length > 10) {
			newBuffer.shift()
		}
		props.setUndoBuffer([...newBuffer, canvasRef.current.toDataURL()])
		if (props.redoBuffer.length > 0) props.setRedoBuffer([])
		e.preventDefault()
	}

	const loadImageURL = (url: string) => {
		var image = document.createElement("img")
		image.addEventListener("load", function () {
			var color = ctxOverlay.fillStyle,
				size = ctxOverlay.lineWidth
			// ctxOverlay.canvas.width = image.width
			// ctxOverlay.canvas.height = image.height
			ctxOverlay.drawImage(image, 0, 0)
			ctxOverlay.fillStyle = color
			ctxOverlay.strokeStyle = color
			ctxOverlay.lineWidth = size
			setImagePosition({
				x: 0,
				y: 0,
				x2: image.width,
				y2: image.height,
			})
			setImageData(image)
			setEditingImage(true)
			setCursor("cursor-grab")
		})
		image.src = url
	}

	const handleToolBoxClick = (_event: any, method: string, tool: any) => {
		if (method === "imageImport") {
			if (_event.length > 0) {
				const reader = new FileReader()
				reader.onload = (e) => {
					if (e.target) {
						loadImageURL(e.target.result as string)
					}
				}
				reader.readAsDataURL(_event[0])
			}
		} else if (method === "undo") {
			if (props.undoBuffer.length > 0) {
				const newBuffer = props.undoBuffer
				const currState = newBuffer.pop()
				props.setUndoBuffer(newBuffer)
				props.setRedoBuffer([...props.redoBuffer, currState])
				const img = new Image()
				img.onload = () => {
					ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
					ctx.drawImage(img, 0, 0)
				}
				img.src = newBuffer[newBuffer.length - 1]
			}
		} else if (method === "redo") {
			if (props.redoBuffer.length > 0) {
				const newBuffer = props.redoBuffer
				const newState = newBuffer.pop()
				props.setRedoBuffer(newBuffer)
				props.setUndoBuffer([...props.undoBuffer, newState])
				const img = new Image()
				img.onload = () => {
					ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
					ctx.drawImage(img, 0, 0)
				}
				img.src = newState
			}
		} else {
			props.handleClick(_event, method, tool)
		}
	}

	return (
		<div className='flex flex-col h-full overflow-hidden'>
			<Toolbox
				boardId={props.board.boardID}
				items={props.items}
				activeItem={props.activeItem}
				handleClick={handleToolBoxClick}
				color={props.color}
				setColor={props.setColor}
				strokeWidth={props.strokeWidth}
			/>
			<div className='relative bg-[#C7B9FF] flex-grow w-screen lg:overflow-hidden p-4 border-black border-4'>
				<canvas
					className={"mx-auto border-4 border-black " + cursor}
					width={window.innerWidth - 128}
					height={(4 * window.innerHeight) / 5}
					ref={canvasRef}
					id='canvas'
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
				/>
				<canvas
					className='absolute pointer-events-none top-0 m-4 mx-2'
					width={window.innerWidth - 128}
					height={(4 * window.innerHeight) / 5}
					ref={canvasOverlayRef}
				/>
				<canvas
					className='absolute invisible'
					width={window.innerWidth - 128}
					height={(4 * window.innerHeight) / 5}
					ref={canvasSocketRef}
				/>
				<div
					className={
						"absolute top-0 right-0 w-24 h-16 " +
						(props.activeItem === "Picker" ? "display-block" : "hidden")
					}
					ref={pickerRef}
					style={{
						border: "2px solid black",
					}}></div>
			</div>
		</div>
	)
}

export default Content
