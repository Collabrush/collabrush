"use client"

import React, { MutableRefObject, useEffect, useRef, useState } from "react"

import Toolbox from "./toolbox"

const Content = (props: {
	activeItem: string
	color: string | CanvasGradient | CanvasPattern
	items: any
	handleClick: any
	setColor: any
	strokeWidth: number
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
	const [ctx, setCtx] = useState<CanvasRenderingContext2D>()
	const [ctxOverlay, setCtxOverlay] = useState<CanvasRenderingContext2D>()

	useEffect(() => {
		if (!canvasRef.current || !canvasOverlayRef.current) return
		let canvasRect = canvasRef.current.getBoundingClientRect()
		const ctx = canvasRef.current.getContext("2d")
		setCtx(ctx)
		setCtxOverlay(canvasOverlayRef.current.getContext("2d"))
		setOffsetX(canvasRect.left + 3)
		setOffsetY(canvasRect.top + 3)
		ctx.fillStyle = "white"
		ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
		ctx.stroke()
	}, [canvasRef, canvasOverlayRef])

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

		if (activeItem === "Pencil" || activeItem === "Brush") {
			ctx.moveTo(e.clientX - offsetX, e.clientY - offsetY)
			if (activeItem === "Brush") ctx.lineWidth = 5 + 2 * props.strokeWidth
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
		}
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
		}

		if (props.activeItem === "Rectangle") {
			let width = e.clientX - offsetX - startX
			let height = e.clientY - offsetY - startY
			ctxOverlay.clearRect(0, 0, window.innerWidth, window.innerHeight)
			ctx.strokeRect(startX, startY, width, height)
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
		}

		ctx.closePath()
		setIsDrawing(false)
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
		} else {
			props.handleClick(_event, method, tool)
		}
	}

	return (
		<div className='flex flex-col h-full'>
			<Toolbox
				items={props.items}
				activeItem={props.activeItem}
				handleClick={handleToolBoxClick}
				color={props.color}
				setColor={props.setColor}
				strokeWidth={props.strokeWidth}
			/>
			<div className='relative flex-grow lg:w-screen lg:overflow-hidden p-4 border-black border-4 w-min'>
				<canvas
					className={"mx-auto bg-[#C7B9FF] border-4 border-black " + cursor}
					width={window.innerWidth - 64}
					height={(4 * window.innerHeight) / 5}
					ref={canvasRef}
					id='canvas'
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
				/>
				<canvas
					className='absolute pointer-events-none top-0 m-4 mx-2'
					width={window.innerWidth - 64}
					height={(4 * window.innerHeight) / 5}
					ref={canvasOverlayRef}
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
