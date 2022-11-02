"use client"

import React from "react"

const MenuItem = (props: {
	text:
		| string
		| number
		| boolean
		| React.ReactElement<any, string | React.JSXElementConstructor<any>>
		| React.ReactFragment
		| React.ReactPortal
}) => {
	return (
		<div className='cursor-default text-xs leading-9 py-0 px-4 text-[#6e6e6e] hover:border-b-2 hover:border-b-[#7c73b3]'>
			{props.text}
		</div>
	)
}

const MenuBar = (props: any) => {
	return (
		<div className='bg-white flex justify-start h-8 w-full'>
			<MenuItem text='File' />
			<MenuItem text='Edit' />
			<MenuItem text='View' />
			<MenuItem text='Image' />
			<MenuItem text='Colors' />
			<MenuItem text='Help' />
		</div>
	)
}

export default MenuBar
