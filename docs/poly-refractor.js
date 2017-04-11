(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

const componentName = 'poly-refractor'
const sizer = require('./sizer')

const lifecycle = {
	created(){
		this.stats = new Stats()
	},
	inserted(){
		this.render()
		this.draw()
	},
	removed(){
		this._paused = true
	}
}

const cellGeneratorPresets = {
	rect: () => {

	},

	diamond: () => {

	}
}

const accessors = {
	/*
		method to use for creating cells
		function(){...}
	*/ 
	cellGenerator: {},
	src: {
		attribute: {},
		get(){return this.xtag.data.src},
		set(val){
			if(val === undefined) return
			this.xtag.data.src = val
			var img = document.createElement('img')
			img.onload = () => { this.invalidateSize() }
			img.src = this.src
			this.xtag.data.img = img
		}
	},
	cellsX: {
		attribute: {},
		get(){return this.xtag.data.cellsX},
		set(val){
			this.xtag.data.cellsX = parseInt(val)
			this.createCells()
		}
	},
	cellsY: {
		attribute: {},
		get(){return this.xtag.data.cellsY},
		set(val){
			this.xtag.data.cellsY = parseInt(val)
			this.createCells()
		}
	},
	offset: {
		attribute: {},
		get(){return this.xtag.data.offset},
		set(val){
			this.xtag.data.offset = parseInt(val)
			this.createCells()
		}
	},
	duration: {
		attribute: {},
		get(){return this.xtag.data.duration},
		set(val){
			this.xtag.data.duration = parseInt(val)
		}
	}
}

const methods = {

	draw(){
		if(this._paused) return
		requestAnimationFrame(this.draw.bind(this))
		if(!this.src) return // nothing to draw
		this.stats.begin()
		var ctx = this.ctx

		// render the cells!
		this.cells.forEach(cell => {

			ctx.save()
			ctx.beginPath()

			ctx.moveTo(cell.path[0].x * this.canvas.width, cell.path[0].y * this.canvas.height)
			cell.path.slice(1).forEach(path => {
				ctx.lineTo(path.x * this.canvas.width, path.y * this.canvas.height)
			})

			ctx.closePath()
			ctx.clip()
			ctx.drawImage(this.xtag.data.img, cell.offset.x, cell.offset.y, this.canvas.width, this.canvas.height)
			ctx.restore()
		})
		
		this.stats.end()
	},

	createCells(){
		// console.log('createCells', this.cellsX, this.cellsY, (this.cellsX + 2) * (this.cellsY + 2))
		// track path coords and current offset
		var cellsX = parseInt(this.cellsX)
		var cellsY = parseInt(this.cellsY)
		this.cells = _.range((cellsX + 2) * (cellsY + 2)).map(i => {
			
			var x = (i % (cellsX + 2)),
				y = Math.floor(i / (cellsX + 2)),
				cellWidth = 1 / cellsX,
				cellHeight = 1 / cellsY,
				posX = cellWidth * x,
				posY = cellHeight * y,
				centerCellX = cellsX / 2,
				centerCellY = cellsY / 2,
				maxOffsetX = -(centerCellX - x) / cellsX * this.offset,
				maxOffsetY = -(centerCellY - y) / cellsY * this.offset

				// console.log(x, y, i)

			// console.log(maxOffsetX, maxOffsetY)
			var halfCellWidth = cellWidth / 2
			var halfCellHeight = cellHeight / 2
			var xOffset = y % 2 - 1
			var yOffset = -1
			posX += xOffset * halfCellWidth
			posY += yOffset * halfCellHeight

			var cell = {
				path: [
					// diamond path
					new Vector2(posX, posY + halfCellHeight), // left
					new Vector2(posX + halfCellWidth, posY - halfCellHeight), // top
					new Vector2(posX + cellWidth, posY + halfCellHeight), // right
					new Vector2(posX + halfCellWidth, posY + cellHeight + halfCellHeight), // bottom
					// box path
					// new Vector2(posX, posY), 
					// new Vector2(posX + cellWidth, posY), 
					// new Vector2(posX + cellWidth, posY + cellHeight), 
					// new Vector2(posX, posY + cellHeight)
				],
				offset: new Vector2(0, 0),
				maxOffset: new Vector2(maxOffsetX, maxOffsetY)
			}
			return cell
		})
	},
	
	// show (){ return new Promise(resolve => {

	// 	this.cells.forEach(cell => {
	// 		var max = cell.maxOffset.clone()
	// 		TweenMax.fromTo(cell.offset, this.duration, {
	// 			x: max.x, y: max.y,
	// 		}, {
	// 			x: 0, y: 0,
	// 			ease: Power3.easeInOut
	// 		})	
	// 	})

	// 	TweenMax.to(this, this.duration, {opacity: 1})
	// 	this.hidden	= false
		
	// 	setTimeout(() => {
	// 		resolve()
	// 	}, this.duration * 1000)
	// })},
	
	// hide (){ return new Promise(resolve => {

	// 	this.cells.forEach((cell, i) => {
	// 		var max = cell.maxOffset.clone()
	// 		TweenMax.to(cell.offset, this.duration, {
	// 			x: max.x, y: max.y,
	// 			ease: Power3.easeOut
	// 		})	
	// 	})
		
	// 	TweenMax.to(this, this.duration, {opacity: 0})

	// 	setTimeout(() => {
	// 		this.hidden	= true
	// 		resolve()
	// 	}, this.duration * 1000)

	// })},

	invalidateSize(){

		var size = sizer.contain(this.xtag.data.img.width, this.xtag.data.img.height, this.offsetWidth, this.offsetHeight)
		this.canvas.width = size.width
		this.canvas.height = size.height

	},

	render (){
		this.innerHTML = ''
		this.appendChild(this.stats.dom)

		var $canvas = $('<canvas/>').appendTo(this)
		$canvas.css({
			display: 'inline-block',
			position: 'absolute',
			top: '50%', left: '50%',
			transform: 'translate(-50%, -50%)'
		})
		this.canvas = $canvas[0]
		this.ctx = this.canvas.getContext('2d')

	},

	reset (){

		this.cells.forEach((cell, i) => {
			cell.offset.x = 0
			cell.offset.y = 0
		})
	}
}

class Cell {
	constructor(){
		this.offset = new Vector2()
	}
}

class Vector2 {
	constructor(x = 0, y = 0){
		this.x = x
		this.y = y
	}
	toString(){
		return this.x + ',' + this.y
	}
	clone(){
		return new Vector2(this.x, this.y)
	}
}
const prototype = {
	Vector2,
	Cell,
	cellGeneratorPresets
}

// var getDistance = function(x1, x2, y1, y2){
// 	return Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) )
// }

module.exports = xtag.register(componentName, {
	prototype, lifecycle, accessors, methods
})


},{"./sizer":2}],2:[function(require,module,exports){

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

window.sizer = sizer
module.exports = sizer

},{}]},{},[1]);
