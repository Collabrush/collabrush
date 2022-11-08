const getPixel = (
	imageData: { width: number; height: number; data: string | any[] },
	x: number,
	y: number
) => {
	if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
		return [-1, -1, -1, -1] // impossible color
	} else {
		const offset = (y * imageData.width + x) * 4
		return imageData.data.slice(offset, offset + 4) as any[]
	}
}

export const setPixel = (
	imageData: { width: number; data: any[] },
	x: number,
	y: number,
	color: any[]
) => {
	const offset = (y * imageData.width + x) * 4
	imageData.data[offset + 0] = color[0]
	imageData.data[offset + 1] = color[1]
	imageData.data[offset + 2] = color[2]
	imageData.data[offset + 3] = color[0]
}

export const colorsMatch = (a: any[], b: any[]) => {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
}

export const floodFill = (
	ctx: {
		getImageData: (arg0: number, arg1: number, arg2: any, arg3: any) => any
		canvas: { width: any; height: any }
		putImageData: (arg0: any, arg1: number, arg2: number) => void
	},
	x: any,
	y: any,
	fillColor: any
) => {
	// read the pixels in the canvas
	const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)

	// get the color we're filling
	const targetColor = getPixel(imageData, x, y)

	// check we are actually filling a different color
	if (!colorsMatch(targetColor, fillColor)) {
		const pixelsToCheck = [x, y]
		while (pixelsToCheck.length > 0) {
			const y = pixelsToCheck.pop()
			const x = pixelsToCheck.pop()

			const currentColor = getPixel(imageData, x, y)
			if (colorsMatch(currentColor, targetColor)) {
				setPixel(imageData, x, y, fillColor)
				pixelsToCheck.push(x + 1, y)
				pixelsToCheck.push(x - 1, y)
				pixelsToCheck.push(x, y + 1)
				pixelsToCheck.push(x, y - 1)
			}
		}

		// put the data back
		ctx.putImageData(imageData, 0, 0)
	}
}

export default floodFill
