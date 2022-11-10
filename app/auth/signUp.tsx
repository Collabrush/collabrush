import { useEffect, useState } from "react"

export default function Signup({
	signUpFunction,
	loadingSignUp,
	signUpError,
}: {
	signUpFunction: (email: string, password: string) => Promise<void>
	loadingSignUp: boolean
	signUpError: any
}) {
	// const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [passwordConfirmation, setPasswordConfirmation] = useState("")
	const [showError, setShowError] = useState<Array<any>>([false, ""])

	return (
		<div className='space-y-6'>
			{/* <div>
				<label
					htmlFor='name'
					className='block text-sm font-medium text-gray-700'>
					Display Name
				</label>
				<div className='mt-1'>
					<input
						id='name'
						name='name'
						type='name'
						autoComplete='name'
						required
						className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
						onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
							setName(e.target.value)
						}
					/>
				</div>
			</div> */}

			<div>
				<label
					htmlFor='email'
					className='block text-sm font-medium text-gray-700'>
					Email address
				</label>
				<div className='mt-1'>
					<input
						id='email'
						name='email'
						type='email'
						autoComplete='email'
						required
						className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
						onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
							setEmail(e.target.value)
						}
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor='password'
					className='block text-sm font-medium text-gray-700'>
					Password
				</label>
				<div className='mt-1'>
					<input
						id='password'
						name='password'
						type='password'
						autoComplete='current-password'
						required
						className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
						onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
							setPassword(e.target.value)
						}
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor='password'
					className='block text-sm font-medium text-gray-700'>
					Confirm Password
				</label>
				<div className='mt-1'>
					<input
						id='confirmpassword'
						name='confirmpassword'
						type='password'
						autoComplete='current-password'
						required
						className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
						onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
							setPasswordConfirmation(e.target.value)
						}
					/>
				</div>
			</div>

			<div className='mt-4'>
				<button
					type='submit'
					className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
					onClick={() => {
						async function signUp() {
							// if (name === "") {
							// 	setShowError([true, "Please enter a valid name"])
							// 	return
							// }
							if (email === "") {
								setShowError([true, "Please enter an email address"])
								return
							}
							if (password === "") {
								setShowError([true, "Please enter a password"])
								return
							}
							if (passwordConfirmation === "") {
								setShowError([true, "Please enter a password confirmation"])
								return
							}
							if (password !== passwordConfirmation) {
								setShowError([
									true,
									"Password and Confirm password must be the same",
								])
								return
							}
							await signUpFunction(email, password)
						}
						signUp()
					}}>
					{!loadingSignUp && !signUpError && "Sign up"}
					{!loadingSignUp &&
						signUpError &&
						"Some Error occured - " + signUpError?.message}
					{loadingSignUp && !signUpError && (
						<>
							<svg
								role='status'
								className='mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-white'
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
							<span className='my-auto text-md'>Loading...</span>
						</>
					)}
				</button>
				{showError[0] && <span className='text-red-500'>{showError[1]}</span>}
			</div>
		</div>
	)
}
