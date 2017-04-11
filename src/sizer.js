
const sizer = {

	contain(srcWidth, srcHeight, destWidth, destHeight){
		// console.log('sizer.contain', srcWidth, srcHeight, destWidth, destHeight)
		var imageRatio = srcWidth / srcHeight
		var imageWidth, imageHeight

		if (imageRatio >= 1) { // landscape
			imageWidth = destWidth
			imageHeight = imageWidth / imageRatio
			if (imageHeight > destHeight) {
				imageHeight = destHeight
				imageWidth = destHeight * imageRatio
			}
		} else { // portrait
			imageHeight = destHeight
			imageWidth = imageHeight * imageRatio
			if (imageWidth > destWidth) {
				imageWidth = destWidth
				imageHeight = destWidth / imageRatio
			}
		}
		return {
			width: imageWidth,
			height: imageHeight,
			scale: Math.min(destWidth / srcWidth, destHeight / srcHeight)
		}
	}
}

module.exports = sizer
