"use client"

import React, { useState } from "react"

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
	const [fileName, setFileName] = useState("NewFile.png")
	return (
		<div className='bg-[#FFC700] flex justify-between items-center h-12 w-full border-black border-4 px-4'>
			<div className='font-medium text-center text-black'>Collabrush</div>
			<input
				className='font-medium text-center text-black bg-transparent border-none'
				placeholder='Untitled.png'
				value={fileName}></input>
			<div className='flex flex-row items-center space-x-2'>
				{/* <div className="bg-[#5551FF] text-white text-base rounded-md px-2 py-1">
          Share
        </div> */}
				<div className='p-4 rounded-full bg-[#F24E1D]'></div>
			</div>
			{/* <MenuItem text="File" />
      <MenuItem text="Edit" />
      <MenuItem text="View" />
      <MenuItem text="Image" />
      <MenuItem text="Colors" />
      <MenuItem text="Help" /> */}
		</div>
	)
}

export default MenuBar
