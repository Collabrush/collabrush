"use client"

import React, { MutableRefObject, useState } from "react"

import MenuBar from "./menubar"
import Content from "./content"

const defaultTool = "Pencil"

import pencil from "./images/pencil.svg"
import line from "./images/line.svg"
// import stroke from "./images/stroke.svg"
import brush from "./images/brush.svg"
import fill from "./images/fill.svg"
import erase from "./images/erase.svg"
import rectangle from "./images/rectangle.svg"
import circle from "./images/circle.svg"
import text from "./images/text.svg"
import picker from "./images/picker.svg"
import { Socket } from "socket.io-client"

const defaultToolbarItems = [
	{ name: "Pencil", image: pencil },
	{ name: "Line", image: line },
	// { name: "Stroke", image: stroke },
	{ name: "Brush", image: brush },
	{ name: "Erase", image: erase },
	{ name: "Fill", image: fill },
	{ name: "Rectangle", image: rectangle },
	// { name: "Text", image: text },
	{ name: "Oval", image: circle },
	{ name: "Picker", image: picker },
]

const ReactPaint = (props: {
	board: any
	canvasElement: MutableRefObject<HTMLCanvasElement>
	socket: Socket
	buffer: string[]
	setBuffer: Function
	undoBuffer: string[]
	setUndoBuffer: Function
	redoBuffer: string[]
	setRedoBuffer: Function
}) => {
	const [color, setColor] = useState("black")
	const [strokeWidth, setStrokeWidth] = useState(1)
	const [selectedItem, setSelectedItem] = useState(defaultTool)
	const [toolbarItems, setToolbarItems] = useState(defaultToolbarItems)

	const handleClick = (_event: any, method: string, tool: any) => {
		if (method === "changeTool") {
			if (selectedItem === "Erase" && strokeWidth > 32) setStrokeWidth(32)
			setSelectedItem(tool)
		} else if (method === "increaseStroke") {
			if (strokeWidth < (selectedItem === "Erase" ? 72 : 32))
				setStrokeWidth(strokeWidth + 1)
		} else if (method === "decreaseStroke") {
			if (strokeWidth > 1) setStrokeWidth(strokeWidth - 1)
		}
	}

	return (
		<>
			<MenuBar board={props.board} />
			<Content
				board={props.board}
				items={toolbarItems}
				activeItem={selectedItem}
				handleClick={handleClick}
				color={color}
				setColor={setColor}
				strokeWidth={strokeWidth}
				canvasElement={props.canvasElement}
				socket={props.socket}
				buffer={props.buffer}
				setBuffer={props.setBuffer}
				undoBuffer={props.undoBuffer}
				setUndoBuffer={props.setUndoBuffer}
				redoBuffer={props.redoBuffer}
				setRedoBuffer={props.setRedoBuffer}
			/>
		</>
	)
}

export default ReactPaint
