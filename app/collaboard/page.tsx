import { useRouter } from "next/navigation"
import React, { useEffect } from "react"

interface Props {}

function Redirect(props: Props) {
	const {} = props
	const router = useRouter()

	useEffect(() => {
		if (!router) return
		router.push("/dashboard")
	}, [router])

	return <>Redirecting...</>
}

export default Redirect
