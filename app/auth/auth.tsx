import { useState } from "react"
import LogIn from "./logIn"
import SignUp from "./signUp"

export default function Auth({
	signInFunction,
	loadingSignIn,
	signInError,
	signUpFunction,
	loadingSignUp,
	signUpError,
}: {
	signInFunction: (email: string, password: string) => Promise<void>
	loadingSignIn: boolean
	signInError: any
	signUpFunction: (email: string, password: string) => Promise<void>
	loadingSignUp: boolean
	signUpError: any
}) {
	const [showLogin, setShowLogin] = useState(true)

	const handleLogInClick = () => {
		setShowLogin(true)
	}
	const handleSignUpClick = () => {
		setShowLogin(false)
	}

	return (
		<>
			<div className='flex flex-col justify-center pb-12 sm:px-6 lg:px-8 min-h-[550px] scale-[2] md:scale-100'>
				<div className='sm:mx-auto sm:w-full sm:max-w-md'>
					<h2 className='text-center text-3xl font-extrabold text-white'>
						Sign in to your account
					</h2>
				</div>

				<div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
					<div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
						<div className='flex mb-4 cursor-pointer rounded-md shadow-sm border-gray-300 sm:text-sm text-center'>
							{/* <div className={`basis-1/2 w-full rounded-l-md py-2 ${(showLogin) ? `text-white bg-indigo-600` : `text-gray-500 hover:text-gray-700`}`} onClick={handleLogInClick}> Log in</div>
                  <div className={`basis-1/2 w-full rounded-r-md py-2 ${(!showLogin) ? `text-white bg-indigo-600` : `text-gray-500 hover:text-gray-700`}`} onClick={handleSignUpClick}> Sign up</div> */}
							<div
								className={`basis-1/2 w-full rounded-l-md py-2 ${
									showLogin
										? `text-gray-900 border-b-2 border-indigo-600 border-solid`
										: `text-gray-500 hover:text-gray-700 border-r-2 border-gray-200`
								}`}
								onClick={handleLogInClick}>
								{" "}
								Log in
							</div>
							<div
								className={`basis-1/2 w-full rounded-r-md py-2 ${
									!showLogin
										? `text-gray-900 border-b-2 border-indigo-600 border-solid`
										: `text-gray-500 hover:text-gray-700 border-l-2 border-gray-200`
								}`}
								onClick={handleSignUpClick}>
								{" "}
								Sign up
							</div>
						</div>

						{showLogin ? (
							<LogIn
								logInFunction={signInFunction}
								loadingSignIn={loadingSignIn}
								signInError={signInError}
							/>
						) : (
							<SignUp
								signUpFunction={signUpFunction}
								loadingSignUp={loadingSignUp}
								signUpError={signUpError}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	)
}
