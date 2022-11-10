"use client"
import Head from "next/head"
import Image from "next/image"
import { useEffect, useState } from "react"
import supabase from "../utils/supabaseClient"
import styles from "../styles/Home.module.css"
import Auth from "./auth/auth"
import { useRouter } from "next/navigation"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.min.css"

export default function Home() {
	const [showAuthModal, setShowAuthModal] = useState(false)
	const [isLoggedIn, setLoggedIn] = useState(false)
	// const [user, setUser] = useState(null)

	const [loadingSignIn, setLoadingSignIn] = useState(false)
	const [loadingSignUp, setLoadingSignUp] = useState(false)

	useEffect(() => {
		;(async () => {
			const { data: user, error: _error } = await supabase.auth.getUser()
			if (!user.user) return
			// setUser(user)
			setLoggedIn(!!user.user)
		})()
	}, [])

	const router = useRouter()

	return (
		<div
			className={
				"min-h-screen min-w-screen bg-[#FFDE59] flex flex-col justify-center items-center noscroll " +
				styles.noscroll
			}>
			<Head>
				<title>Collabrush</title>
				<meta
					name='description'
					content='Collaborate and Paint online with natural brushes, and edit your drawings. Free. Import, save, and upload images.'
				/>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<ToastContainer />
			<div className='absolute top-1/2 md:top-0 w-full flex flex-col md:flex-row items-center justify-end h-24 px-12 space-y-4 md:space-y-0 md:space-x-4 scale-[2] md:scale-100'>
				<button
					type='button'
					className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
					onClick={() => {
						if (isLoggedIn) {
							supabase.auth.signOut()
							setLoggedIn(false)
						} else {
							setShowAuthModal(true)
						}
					}}>
					{isLoggedIn ? `Log Out` : `Log In`}
				</button>
				<button
					type='button'
					onClick={() => {
						router.push("/dashboard")
					}}
					className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500'>
					{isLoggedIn ? `Dashboard` : `Get Started`}
				</button>
			</div>
			<div
				className='w-[98vw] lg:h-screen h-[600px] md:h-[600px]'
				style={{
					backgroundImage: `url("/Collabrush.png")`,
					backgroundSize: "cover",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
				}}></div>
			{showAuthModal && (
				<div className='absolute w-full h-screen top-0 m-0 flex justify-center items-center'>
					<div
						className='absolute top-0 left-0 w-full h-screen bg-black bg-opacity-50 z-0'
						onClick={() => {
							setShowAuthModal(false)
						}}></div>
					<div className='relative mx-auto my-auto z-10'>
						<Auth
							signInFunction={async (email, password) => {
								setLoadingSignIn(true)
								const {
									data: { user, session },
									error,
								} = await supabase.auth.signInWithPassword({
									email,
									password,
								})
								if (error) {
									console.log(error)
									toast.error(error.message)
									setLoadingSignIn(false)
									return
								}
								setLoggedIn(!!user)
								setLoadingSignIn(false)
								setShowAuthModal(false)
								router.push("/dashboard")
							}}
							signUpFunction={async (email, password) => {
								setLoadingSignUp(true)
								const {
									data: { user, session },
									error,
								} = await supabase.auth.signUp({
									email,
									password,
								})
								setLoadingSignUp(false)
								setShowAuthModal(false)
								toast.success("Check your email for a confirmation link.", {
									autoClose: false,
								})
							}}
							loadingSignIn={loadingSignIn}
							loadingSignUp={loadingSignUp}
							signInError={false}
							signUpError={false}
						/>
					</div>
				</div>
			)}
			<footer className='absolute lg:relative bottom-0 px-4 py-2 text-sm text-center bg-blue-900 text-white w-full'>
				🧑🏻‍💻 Developed by Priyav and Sanskar
			</footer>
		</div>
	)
}
