import React from "react"
import ReactPaint from "../reactpaint"

interface Props {}

function DrawReact(props: Props) {
	const {} = props

	return (
		<div className='flex flex-col h-full'>
			<ReactPaint />
		</div>
	)
}

export default DrawReact
