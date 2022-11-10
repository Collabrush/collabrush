"use client"

import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import supabase from "../../utils/supabaseClient"

// const MenuItem = (props: {
// 	text:
// 		| string
// 		| number
// 		| boolean
// 		| React.ReactElement<any, string | React.JSXElementConstructor<any>>
// 		| React.ReactFragment
// 		| React.ReactPortal
// }) => {
// 	return (
// 		<div className='cursor-default text-xs leading-9 py-0 px-4 text-[#6e6e6e] hover:border-b-2 hover:border-b-[#7c73b3]'>
// 			{props.text}
// 		</div>
// 	)
// }

const MenuBar = (props: { board: any }) => {
	const [fileName, setFileName] = useState(props.board.name)

	const router = useRouter()

	useEffect(() => {
		setFileName(props.board.name)
	}, [props.board.name])

	return (
		<div className='bg-[#FFC700] flex justify-between items-center h-12 w-full border-black border-4 px-4'>
			<div className='font-medium text-center text-black'>Collabrush</div>
			<input
				className='font-medium text-center text-black bg-transparent border-none'
				placeholder='Untitled.png'
				value={fileName}
				onChange={(e) => {
					setFileName(e.target.value)
				}}
				onBlur={async () => {
					console.log(props.board.boardID)

					const { data, error } = await supabase
						.from("boards")
						.update({ name: fileName })
						.eq("boardID", props.board.boardID)
					if (error) {
						console.log(error)
						return
					}
					console.log(data)
				}}
			/>
			<div className='flex flex-row items-center space-x-2'>
				{/* <div className="bg-[#5551FF] text-white text-base rounded-md px-2 py-1">
          Share
        </div> */}
				<button
					type='button'
					className='p-3 py-1.5 text-black border-black border font-semibold rounded-full bg-[#F24E1D]'
					onClick={() => {
						router.push("/dashboard")
					}}>
					Dashboard
				</button>
			</div>
		</div>
	)
}

export default MenuBar
