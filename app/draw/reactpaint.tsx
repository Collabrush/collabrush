"use client"

import React, { MouseEvent, useState } from "react"

import MenuBar from "./menubar"
import Content from "./content"
import ColorPanel from "./colorpanel"

const defaultColor = "black"
const defaultTool = "Pencil"

import pencil from "./images/pencil.svg"
import line from "./images/line.svg"
import brush from "./images/brush.svg"
import fill from "./images/fill.svg"
import rectangle from "./images/rectangle.svg"
import text from "./images/text.svg"
import circle from "./images/circle.svg"
import erase from "./images/erase.svg"
import picker from "./images/picker.svg"

const defaultToolbarItems = [
	{ name: "Pencil", image: pencil },
	{ name: "Line", image: line },
	{ name: "Brush", image: brush },
	{ name: "Fill", image: fill },
	{ name: "Text", image: text },
	{ name: "Rectangle", image: rectangle },
	{ name: "Circle", image: circle },
	{ name: "Erase", image: erase },
	{ name: "Picker", image: picker },
]

const ReactPaint = () => {
	const [color, setColor] = useState(defaultColor)
	const [selectedItem, setSelectedItem] = useState(defaultTool)
	const [toolbarItems, setToolbarItems] = useState(defaultToolbarItems)

	const changeColor = (e: MouseEvent<HTMLDivElement>) => {
		setColor((e.target as HTMLDivElement).style.backgroundColor)
	}

	const changeTool = (_event: any, tool: any) => {
		setSelectedItem(tool)
	}

	return (
		<>
			<MenuBar />
			<Content
				items={toolbarItems}
				activeItem={selectedItem}
				handleClick={changeTool}
				color={color}
			/>
			<ColorPanel selectedColor={color} handleClick={changeColor} />
		</>
	)
}

export default ReactPaint
