/* eslint-disable jsx-a11y/role-has-required-aria-props */
"use client"

import Image from "next/image"
import React, { MouseEvent, useEffect, useRef, useState } from "react"
import ColorPanel from "./colorpanel"

import share from "./images/share.svg"
import download from "./images/download.svg"
import undo from "./images/undo.svg"
import redo from "./images/redo.svg"
import image from "./images/image.svg"
import { toast } from "react-toastify"
import supabase from "../../utils/supabaseClient"

const Button = (props: {
	image: any
	active: any
	handleClick: (
		arg0: MouseEvent<HTMLDivElement, MouseEvent>,
		arg1: string,
		arg2: string
	) => void
	name: any
	overrideClass?: string
}) => {
	return (
		<div
			className={
				"rounded box-border h-8 m-px p-1 w-8 hover:bg-white duration-200 hover:shadow-md active:translate-y-0 active:opacity-80 group " +
				(props.active ? "bg-[#C7B9FF]" : "") +
				(props.overrideClass ? props.overrideClass : "")
			}
			onClick={(e: any) => props.handleClick(e, "changeTool", props.name)}>
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
	boardId: string
	activeItem: any
	items: any
	color: any
	setColor: any
	handleClick: (arg0: any, arg1: string, arg2: string) => void
	strokeWidth: number
}) => {
	const imageInput = useRef<HTMLInputElement>(null)
	const [showCollaborators, setShowCollaborators] = useState(false)
	const [collaborators, setCollaborators] = useState([])
	const [email, setEmail] = useState("")

	const items = props.items.map((item: { name: any; image: any }) => (
		<Button
			active={props.activeItem === item.name ? true : false}
			name={item.name}
			image={item.image}
			key={item.name}
			handleClick={props.handleClick}
		/>
	))

	useEffect(() => {
		if (!props.boardId) return
		;(async () => {
			const { data, error } = await supabase
				.from("writeAccess")
				.select("*")
				.eq("boardID", props.boardId)
			if (error) {
				toast.error(error.message)
			} else {
				const collabs = data.map((item: { email: any }) => item.email)
				setCollaborators(collabs)
				console.log(data)
			}
		})()
	}, [props.boardId])

	const changeColor = (color: string) => {
		props.setColor(color)
	}

	const handleShare = () => {
		navigator.clipboard.writeText(window.location.href)
		toast.success("Link Copied to clipboard!")
	}

	const handleDownload = () => {
		const canvas = document.getElementById("canvas") as HTMLCanvasElement
		const dataURL = canvas.toDataURL("image/png")
		const link = document.createElement("a")
		link.download = "image.png"
		link.href = dataURL
		link.click()
	}

	return (
		<div className='box-border flex flex-row justify-between p-2 bg-[#FEDD67] border-black border-4 items-center'>
			<div className='flex justify-start'>
				<div className='grid grid-flow-col grid-rows-2 gap-0 px-2 border-r-2 border-black mr-2'>
					{items}
				</div>
				<div className='flex flex-col px-2 border-r-2 border-black mr-2 pr-4'>
					<div className='flex flex-row justify-evenly select-none text-lg font-bold space-x-3 border-b border-black pb-2'>
						<div
							className='text-black cursor-pointer hover:bg-white bg-opacity-30 px-2 rounded-md flex justify-center items-center'
							onClickCapture={(e: any) =>
								props.handleClick(e, "decreaseStroke", "")
							}>
							-
						</div>
						<span className='text-black'>{props.strokeWidth} px</span>
						<div
							className='text-black cursor-pointer hover:bg-white bg-opacity-30 px-2 rounded-md flex justify-center items-center'
							onClickCapture={(e: any) =>
								props.handleClick(e, "increaseStroke", "")
							}>
							+
						</div>
					</div>
					<div className='flex flex-row justify-evenly pt-1'>
						<Button
							active={false}
							image={undo}
							name='undo'
							handleClick={(e: any) => props.handleClick(e, "undo", "")}
						/>
						<Button
							active={false}
							image={redo}
							name='redo'
							handleClick={(e: any) => props.handleClick(e, "redo", "")}
						/>
					</div>
				</div>
				<div className='flex flex-col border-r-2 border-black mr-2 pr-2'>
					<label
						htmlFor='file-input'
						className={
							"rounded box-border h-12 m-px p-1 w-12 hover:bg-white duration-200 hover:shadow-md active:translate-y-0 active:opacity-80"
						}>
						<Image src={image} alt='image' />
					</label>
					<input
						ref={imageInput}
						type='file'
						id='file-input'
						style={{ display: "none" }}
						onChange={(e: any) => {
							props.handleClick(imageInput.current.files, "imageImport", "")
							imageInput.current.files = null
							imageInput.current.value = ""
						}}
					/>
					<span
						className='text-black text-md'
						style={{ textTransform: "full-size-kana" }}>
						Import
					</span>
				</div>
				<div className='px-2 flex justify-center items-center'>
					<ColorPanel selectedColor={props.color} handleClick={changeColor} />
				</div>
			</div>
			<div className='flex justify-end space-x-4'>
				<div className='relative'>
					<div
						className='p-2 py-1.5 h-fit my-auto bg-blue-400 text-md font-semibold'
						onClick={() => {
							setShowCollaborators(!showCollaborators)
						}}>
						Collaborators
					</div>
					<div
						className={`absolute mt-8 -ml-12 z-50 ${
							showCollaborators ? "" : "hidden"
						}`}>
						<div className='mx-auto max-w-xl min-w-[10rem] transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all'>
							<div className='relative flex'>
								<input
									type='text'
									className='h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-800 placeholder-gray-400 focus:ring-0 sm:text-sm'
									placeholder='Add new collaborator email'
									role='combobox'
									aria-expanded='false'
									aria-controls='options'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
								<button
									className='bg-blue-200 p-1 rounded'
									type='button'
									onClick={async () => {
										const { data, error } = await supabase
											.from("writeAccess")
											.insert([
												{
													boardID: props.boardId,
													email: email,
												},
											])
											.select("*")
										if (error) {
											console.log(error)
										} else {
											setEmail("")
											if (data[0])
												setCollaborators([
													...collaborators,
													(data[0] as any).email,
												])
										}
									}}>
									Add
								</button>
							</div>

							<ul
								className='max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800'
								id='options'
								role='listbox'>
								{collaborators.map((collaborator) => {
									return (
										<li
											className='cursor-default select-none px-4 py-2'
											id={collaborator}
											key={collaborator}
											role='option'
											tabIndex={-1}>
											{collaborator}
										</li>
									)
								})}
							</ul>
						</div>
					</div>
				</div>
				<div className='grid grid-flow-col grid-rows-2 gap-0 px-2 mr-2 border-black rounded-lg border-x-2'>
					<Button
						active={props.activeItem === "Share" ? true : false}
						name={"Share"}
						image={share}
						handleClick={handleShare}
					/>
					<Button
						active={props.activeItem === "Download" ? true : false}
						name={"Download"}
						image={download}
						handleClick={handleDownload}
					/>
				</div>
			</div>
		</div>
	)
}

export default Toolbox
