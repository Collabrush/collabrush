const LightenDarkenColor = (initcol: string, amt: number) => {
	const col = parseInt(initcol, 16)
	return (
		((col & 0x0000ff) + amt) |
		((((col >> 8) & 0x00ff) + amt) << 8) |
		(((col >> 16) + amt) << 16)
	).toString(16)
}

const Pointer = (prop: Props) => {
	let { color } = prop
	if (color[0] === "#") color = color.slice(1)
	const darkerColor = LightenDarkenColor(color, -50)
	return (
		<svg
			version='1.1'
			xmlns='http://www.w3.org/2000/svg'
			xmlnsXlink='http://www.w3.org/1999/xlink'
			width='24px'
			height='24px'
			viewBox='0,0,256,256'>
			<g
				fill='none'
				fill-rule='nonzero'
				stroke='none'
				stroke-width='1'
				stroke-linecap='butt'
				stroke-linejoin='miter'
				stroke-miterlimit='10'
				stroke-dasharray=''
				stroke-dashoffset='0'
				font-family='none'
				font-weight='none'
				font-size='none'
				text-anchor='none'>
				<g transform='scale(2.56,2.56)'>
					<path
						d='M19.1,9.2v81.6c0,1.4 1.6,2.2 2.7,1.3l22.7,-19.8h34.7c1.4,0 2.2,-1.7 1.2,-2.8l-58.4,-61.4c-1,-1.1 -2.9,-0.4 -2.9,1.1z'
						fill={`#${color}`}></path>
					<path
						d='M79.2,70.3h-34.7l-22.7,19.8c-1.1,0.9 -2.7,0.1 -2.7,-1.3v2c0,1.4 1.7,2.2 2.7,1.3l22.7,-19.8h34.7c1.4,0 2.1,-1.6 1.3,-2.7c-0.2,0.4 -0.7,0.7 -1.3,0.7z'
						fill={`#${darkerColor}`}></path>
				</g>
			</g>
		</svg>
	)
}

type Props = {
	color: string
}

export default Pointer
