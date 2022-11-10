"use client"

import React, { MouseEvent, useState } from "react"
import styles from "../../styles/ColorButton.module.css"
import { SketchPicker } from "react-color"

const colors = [
	"#000000",
	"#464646",
	"#787878",
	"#980031",
	"#ed1d25",
	"#ff7d01",
	"#ffc30e",
	"#a7e71d",
	"#23b14c",
	"#03b8ef",
	"#4c6cf3",
	"#303699",
	"#6e3198",
	"#ffffff",
	"#dcdcdc",
	"#9c593c",
	"#ffa3b1",
	"#e5aa7a",
	"#f5e59c",
	"#fff9be",
	"#d3f9bc",
	"#9cbb60",
	"#99d9eb",
	"#6f99d2",
	"#536c8e",
	"#b5a5d6",
]

const SelectedColor = (props: { color: any }) => {
	const style = {
		backgroundColor: props.color,
	}

	return (
		<div
			className='border-black border-double border-2 h-8 m-2 w-8 outline-1 outline-[#b4b4b4]'
			style={style}
		/>
	)
}

const Color = (props: {
	color: any
	handleClick: (e: MouseEvent<HTMLDivElement>) => void
}) => {
	const style = {
		backgroundColor: props.color,
	}

	return (
		<div
			className='box-border w-4 h-4 m-px transition-transform duration-200 border border-black border-solid rounded-full hover:shadow-md'
			style={style}
			onClick={props.handleClick}
		/>
	)
}

const ColorPanel = (props: {
	selectedColor: any
	handleClick: (color: string) => void
}) => {
	const colorItems = colors.map((color) => (
		<Color
			color={color}
			key={color}
			handleClick={(e: any) =>
				props.handleClick((e.target as HTMLDivElement).style.backgroundColor)
			}
		/>
	))
	const [showColorPicker, setShowColorPicker] = useState(false)

	return (
		<div className='flex items-center'>
			<SelectedColor color={props.selectedColor} />
			<div className='grid grid-flow-col grid-rows-2 gap-0'>{colorItems}</div>
			<div className='relative'>
				<div
					className={styles.colorButton + " ml-3"}
					onClick={() => {
						setShowColorPicker(!showColorPicker)
					}}>
					<div className={styles.colorCenter}>
						<div
							className={
								styles.colorPin + " animate-[spin_3s_linear_infinite]"
							}></div>
					</div>
					<div className={styles.colorWheel}>
						<ul className={styles.colorColors}>
							<li className={styles.colorColor}></li>
							<li className={styles.colorColor}></li>
							<li className={styles.colorColor}></li>
							<li className={styles.colorColor}></li>
							<li className={styles.colorColor}></li>
							<li className={styles.colorColor}></li>
							<li className={styles.colorColor}></li>
							<li className={styles.colorColor}></li>
							<li className={styles.colorColor}></li>
							<li className={styles.colorColor}></li>
							<li className={styles.colorColor}></li>
							<li className={styles.colorColor}></li>
						</ul>
					</div>
				</div>
				{showColorPicker && (
					<div className='absolute mt-9 ml-3 z-40'>
						<SketchPicker
							color={props.selectedColor}
							onChange={(color: { hex: string }) => {
								console.log(color.hex)
								props.handleClick(color.hex)
								// setShowColorPicker(false)
							}}
						/>
					</div>
				)}
			</div>
		</div>
	)
}

export default ColorPanel
