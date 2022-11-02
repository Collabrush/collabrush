"use client"

import React, { MutableRefObject, useEffect, useRef, useState } from "react"

import Toolbox from "./toolbox"

const Content = (props: {
	activeItem: string
	color: string | CanvasGradient | CanvasPattern
	items: any
	handleClick: any
}) => {
	const [isDrawing, setIsDrawing] = useState(false)
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
		setCtx(canvasRef.current.getContext("2d"))
		setCtxOverlay(canvasOverlayRef.current.getContext("2d"))
		setOffsetX(canvasRect.left)
		setOffsetY(canvasRect.top)
	}, [canvasRef, canvasOverlayRef])

	const handleMouseDown = (e: { clientX: number; clientY: number }) => {
		let activeItem = props.activeItem

		setIsDrawing(true)
		ctx.beginPath()
		ctx.strokeStyle = props.color
		ctx.lineWidth = 1
		ctx.lineJoin = ctx.lineCap = "round"

		if (activeItem === "Pencil" || activeItem === "Brush") {
			ctx.moveTo(e.clientX - offsetX, e.clientY - offsetY)
			if (activeItem === "Brush") ctx.lineWidth = 5
		} else if (activeItem === "Line" || activeItem === "Rectangle") {
			ctxOverlay.strokeStyle = props.color
			ctxOverlay.lineWidth = 1
			ctxOverlay.lineJoin = ctx.lineCap = "round"
			setStartX(e.clientX - offsetX)
			setStartY(e.clientY - offsetY)
		}
	}

	const handleMouseMove = (e: { clientX: number; clientY: number }) => {
		if (isDrawing) {
			if (props.activeItem === "Pencil" || props.activeItem === "Brush") {
				ctx.lineTo(e.clientX - offsetX, e.clientY - offsetY)
				ctx.stroke()
			}
			if (props.activeItem === "Line") {
				ctxOverlay.clearRect(0, 0, 600, 480)
				ctxOverlay.beginPath()
				ctxOverlay.moveTo(startX, startY)
				ctxOverlay.lineTo(e.clientX - offsetX, e.clientY - offsetY)
				ctxOverlay.stroke()
				ctxOverlay.closePath()
			}
			if (props.activeItem === "Rectangle") {
				ctxOverlay.clearRect(0, 0, 600, 480)
				let width = e.clientX - offsetX - startX
				let height = e.clientY - offsetY - startY
				ctxOverlay.strokeRect(startX, startY, width, height)
			}
		}
	}

	const handleMouseUp = (e: { clientX: number; clientY: number }) => {
		if (props.activeItem === "Line") {
			ctxOverlay.clearRect(0, 0, 600, 480)
			ctx.moveTo(startX, startY)
			ctx.lineTo(e.clientX - offsetX, e.clientY - offsetY)
			ctx.stroke()
		}

		if (props.activeItem === "Rectangle") {
			let width = e.clientX - offsetX - startX
			let height = e.clientY - offsetY - startY
			ctxOverlay.clearRect(0, 0, 600, 480)
			ctx.strokeRect(startX, startY, width, height)
		}

		ctx.closePath()
		setIsDrawing(false)
	}

	return (
		<div className='flex flex-grow h-full'>
			<Toolbox
				items={props.items}
				activeItem={props.activeItem}
				handleClick={props.handleClick}
			/>
			<div className='flex-grow p-1 bg-[#a7a7a7]'>
				<canvas
					className='bg-white cursor-crosshair'
					width='600px'
					height='480px'
					ref={canvasRef}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
				/>
				<canvas
					className='pointer-events-none absolute -translate-x-full'
					width='600px'
					height='480px'
					ref={canvasOverlayRef}
				/>
			</div>
		</div>
	)
}

export default Content