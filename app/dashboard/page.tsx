"use client"

import { User } from "@supabase/supabase-js"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"
import supabase from "../../utils/supabaseClient"

interface Props {}

function Dashboard(props: Props) {
	const {} = props

	// initialization states
	const [isLoading, setLoading] = useState(true)
	const [user, setUser] = useState<User>(null)
	const [collaboards, setCollaboards] = useState([])
	const [sharedCollaboards, setSharedCollaboards] = useState([])

	// functionality states
	const [isCreatingCollaboard, setIsCreatingCollaboard] = useState(false)

	const router = useRouter()

	useEffect(() => {
		// if (!router) return;
		;(async () => {
			const user = await supabase.auth.getUser()
			if (!user) {
				router.push("/")
				console.log("user not found")
				return
			}
			setUser(user.data.user)
		})()
	}, [router])

	useEffect(() => {
		if (!user) return
		;(async () => {
			const { data, error } = await supabase
				.from("boards")
				.select("boardID,name,thumbnail")
				.eq("creatorID", user.id)
			if (error) {
				console.log(error)
				toast.error("Error loading collaboards")
				return
			}
			console.log(data)
			setCollaboards(data)

			const { data: sharedData, error: sharedError } = await supabase
				.from("writeAccess")
				.select("*")
				.eq("email", user.email)
			if (sharedError) {
				console.log(sharedError)
				toast.error("Error loading shared collaboards")
				return
			}
			console.log(sharedData)
			const boards = sharedData.map((board) => board.board)
			console.log(boards)
			setSharedCollaboards(boards)

			setLoading(false)
		})()
	}, [user])

	return (
		<>
			{isLoading ? (
				<div>Loading...</div>
			) : (
				<div className='min-h-screen min-w-screen bg-[#FFDE59] flex flex-col justify-center items-center noscroll'>
					<Head>
						<title>Collabrush | Dashboard</title>
						<meta
							name='description'
							content='Collaborate and Paint online with natural brushes, and edit your drawings. Free. Import, save, and upload images.'
						/>
						<link rel='icon' href='/favicon.ico' />
					</Head>
					<div className='absolute top-1/2 md:top-0 w-full flex flex-col md:flex-row items-center justify-end h-24 px-12 space-y-4 md:space-y-0 md:space-x-4 scale-[2] md:scale-100'>
						<button
							type='button'
							className='inline-flex items-center px-6 py-3 text-base font-medium text-white border border-transparent rounded-full shadow-sm bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
							onClick={() => {
								supabase.auth.signOut()
								router.push("/")
							}}>
							Log Out
						</button>
						<button
							type='button'
							onClick={() => {
								router.push("/")
							}}
							className='inline-flex items-center px-6 py-3 text-base font-medium text-white border border-transparent rounded-full shadow-sm bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500'>
							Home
						</button>
					</div>
					<div className='text-2xl text-black'>
						Hey, {(user?.email).split("@")[0]}
					</div>
					<div className='text-xl text-black '>Your Collaboards</div>
					<button
						type='button'
						className='inline-flex items-center px-6 py-3 mt-8 text-base font-medium text-white border border-transparent rounded-full shadow-sm bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
						onClick={async () => {
							setIsCreatingCollaboard(true)
							const { data: boards, error } = await supabase
								.from("boards")
								.insert({
									creatorID: user.id,
									isPublic: false,
									isViewOnly: false,
								})
								.select()
							if (error) {
								console.log(error)
								setIsCreatingCollaboard(false)
								toast.error("Error creating collaboard")
								return
							}
							console.log(boards)
							setIsCreatingCollaboard(false)
							router.push(`/collaboard/${(boards as any[])[0].boardID}`)
						}}>
						{isCreatingCollaboard ? (
							<>
								<svg
									role='status'
									className='w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-white'
									viewBox='0 0 100 101'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'>
									<path
										d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
										fill='currentColor'
									/>
									<path
										d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
										fill='currentFill'
									/>
								</svg>
								<span className='my-auto text-md'>Creating collaboard...</span>
							</>
						) : (
							"Create new collaboard"
						)}
					</button>
					<div className='my-8'>
						{collaboards.length === 0 ? (
							<div className='text-center'>
								<svg
									className='w-12 h-12 mx-auto text-gray-400'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
									aria-hidden='true'>
									<path
										vectorEffect='non-scaling-stroke'
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z'
									/>
								</svg>
								<h3 className='mt-2 text-sm font-medium text-gray-900'>
									No projects
								</h3>
								<p className='mt-1 text-sm text-gray-500'>
									Get started by creating a new project.
								</p>
								<div className='mt-6'>
									<button
										type='button'
										className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 24 24'
											fill='currentColor'
											className='w-5 h-5 mr-2 -ml-1'
											aria-hidden='true'>
											<path
												fillRule='evenodd'
												d='M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z'
												clipRule='evenodd'
											/>
										</svg>
										New Project
									</button>
								</div>
							</div>
						) : (
							<div className='grid min-[560px]:grid-cols-2 grid-cols-1 gap-4 md:grid-cols-3 min-[1240px]:grid-cols-5 lg:grid-cols-4 border-4 border-black bg-[#C7B9FF] p-4 mx-auto'>
								{collaboards.map((collaboard) => (
									<div
										key={collaboard.boardID}
										className='w-56 rounded-lg h-44 group'
										style={{
											backgroundImage: `url(${
												"https://witxacybuzwpgrvfoxmg.supabase.co/storage/v1/object/public/thumbnails/" +
													collaboard.thumbnail ?? "blank.png"
											})`,
										}}>
										<div
											onClick={() => {
												router.push(`/collaboard/${collaboard.boardID}`)
											}}
											className='inset-0 flex items-center justify-center invisible w-full h-full bg-black bg-opacity-25 rounded-lg group-hover:visible'>
											<div className='text-center'>
												<div className='text-2xl font-bold text-white'>
													{collaboard.name}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	)
}

export default Dashboard
