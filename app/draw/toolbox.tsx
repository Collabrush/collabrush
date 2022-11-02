"use client"

import Image from "next/image"
import React from "react"

const Button = (props: {
	image: any
	active: any
	handleClick: (
		arg0: React.MouseEvent<HTMLDivElement, MouseEvent>,
		arg1: any
	) => void
	name: any
}) => {
	return (
		<div
			className={
				"rounded box-border h-8 m-px p-1 w-8 hover:bg-white duration-200 hover:shadow-md active:translate-y-0 active:opacity-80 group " +
				(props.active ? "bg-[#5b5291]" : "")
			}
			onClick={(e) => props.handleClick(e, props.name)}>
			<Image
				src={props.image}
				alt={props.name}
				className={
					"fill-[#6e6e6e] group-hover:fill-black " +
					(props.active ? "fill-white" : "")
				}
			/>
		</div>
	)
}

const Toolbox = (props: {
	activeItem: any
	items: any
	handleClick: (
		arg0: React.MouseEvent<HTMLDivElement, MouseEvent>,
		arg1: any
	) => void
}) => {
	const items = props.items.map((item: { name: any; image: any }) => (
		<Button
			active={props.activeItem === item.name ? true : false}
			name={item.name}
			image={item.image}
			key={item.name}
			handleClick={props.handleClick}
		/>
	))

	return (
		<div className='box-border flex flex-wrap content-start p-4 w-16'>
			{items}
		</div>
	)
}

export default Toolbox
