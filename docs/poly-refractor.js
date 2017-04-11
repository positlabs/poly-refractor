(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

const componentName = 'poly-refractor'
const sizer = require('./sizer')

const lifecycle = {
	created(){},
	inserted(){
		this.render()
		this.draw()
	},
	removed(){
		this._paused = true
	}
}

const cellGeneratorPresets = {
	rect: (cellsX, cellsY, offsetFactor) => {
		// console.log('cellGeneratorPresets.rect', cellsX, cellsY, offsetFactor)
		
		var center = new Vector2(.5, .5)
		var size = new Vector2(1 / cellsX, 1 / cellsY)

		var cells = Array(cellsX * cellsY).fill(0).map((zero, i) => {
			
			var coordinates = 	new Vector2(i % cellsX, Math.floor(i / cellsX))
			var position = 		new Vector2(size.x * coordinates.x, size.y * coordinates.y)
			var maxOffset = 	new Vector2(
									 -(center.x - position.x) * offsetFactor, 
									 -(center.y - position.y) * offsetFactor
								)

			return new Cell(
				[
					new Vector2(position.x, position.y), 
					new Vector2(position.x + size.x, position.y), 
					new Vector2(position.x + size.x, position.y + size.y), 
					new Vector2(position.x, position.y + size.y)
				],
				maxOffset
			)
		})
		return cells
	},

	diamond: (cellsX, cellsY, offsetFactor) => {

		var center = new Vector2(.5, .5)
		var size = new Vector2(1 / cellsX, 1 / cellsY)
		var halfSize = new Vector2(size.x / 2, size.y / 2)

		var cells = Array((cellsX + 2) * (cellsY + 2)).fill(0).map((zero, i) => {

			var coordinates = 	new Vector2(i % (cellsX+2), Math.floor(i / (cellsX+2)))
			var position = 		new Vector2(size.x * coordinates.x, size.y * coordinates.y)
			var maxOffset = 	new Vector2(
									 -(center.x - position.x) * offsetFactor, 
									 -(center.y - position.y) * offsetFactor
								)

			var xOffset = coordinates.y % 2 - 1
			var yOffset = -1
			position.x += xOffset * halfSize.x
			position.y += yOffset * halfSize.y

			return new Cell (
				[
					new Vector2(position.x, position.y + halfSize.y), // left
					new Vector2(position.x + halfSize.x, position.y - halfSize.y), // top
					new Vector2(position.x + size.x, position.y + halfSize.y), // right
					new Vector2(position.x + halfSize.x, position.y + size.y + halfSize.y), // bottom
				],
				maxOffset
			)
		})
		return cells
	}
}

const accessors = {

	/*
		media to be used
		accepts paths (.png, .jpg, etc...) 
		or references to drawable html elements (img, canvas, video)
	*/
	src: {
		attribute: {},
		get(){return this.xtag.src},
		set(val){
			if(val === undefined) return
			this.xtag.src = val
			
			//TODO: handle video urls
			//TODO: handle drawable html elements

			var img = document.createElement('img')
			img.onload = () => { this.invalidateSize() }
			img.src = this.src
			this.xtag.img = img
		}
	},

	/*
		method to use for creating cells
		use one of the preset strings (diamond, rect)
		or assign a custom function to handle cell generation
		function(cellsX, cellsY, offsetFactor){
			...
			return cellsArray
		}
	*/ 
	cellGenerator: {
		attribute: {
			def: 'diamond'
			// def: 'rect'
		},
		get(){
			return this.xtag.cellGenerator
		},
		set(val){
			this.xtag.cellGenerator = val
			this.createCells()
		},
	},

	/*
		number of horizontal cells
	*/
	cellsX: {
		attribute: {
			def: 9
		},
		get(){return this.xtag.cellsX},
		set(val){
			this.xtag.cellsX = parseInt(val)
			this.createCells()
		}
	},

	/*
		number of vertical cells
	*/
	cellsY: {
		attribute: {
			def: 9
		},
		get(){return this.xtag.cellsY},
		set(val){
			this.xtag.cellsY = parseInt(val)
			this.createCells()
		}
	},

	/*
		controls the strength of the offset effect
	*/
	offsetFactor: {
		attribute: {
			def: 300
		},
		get(){return this.xtag.offsetFactor},
		set(val){
			this.xtag.offsetFactor = parseInt(val)
			this.createCells()
		}
	},

	/*
		var cell = new Cell(cellPath, maxOffset)

		cellPath: Array of Vector2. This is the shape that is drawn as a mask
		maxOffset: Vector2 that will be multiplied by the offsetFactor. Changes where pixels are sourced from
	*/
	Cell: {
		get(){ return Cell }
	},

	/*
		new Vector2(x, y)
	*/
	Vector2: {
		get(){ return Vector2 }
	}
}

const methods = {

	draw(){
		if(this._paused) return
		requestAnimationFrame(this.draw.bind(this))
		if(!this.src) return // nothing to draw
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
			ctx.drawImage(this.xtag.img, cell.offset.x, cell.offset.y, this.canvas.width, this.canvas.height)
			ctx.restore()
		})
	},

	createCells(){
		if(this.cellsX === undefined || this.cellsY === undefined || !this.offsetFactor) return
		console.log('createCells', this.cellsX, this.cellsY, this.offsetFactor)

		if(typeof this.cellGenerator === 'function'){
			return this.cells = this.cellGenerator(this.cellsX, this.cellsY, this.offsetFactor)
		}else if(typeof this.cellGenerator === 'string'){
			return this.cells = cellGeneratorPresets[this.cellGenerator](this.cellsX, this.cellsY, this.offsetFactor)
		}
	},

	invalidateSize(){

		var size = sizer.contain(this.xtag.img.width, this.xtag.img.height, this.offsetWidth, this.offsetHeight)
		this.canvas.width = size.width
		this.canvas.height = size.height

	},

	render (){
		this.innerHTML = ''

		var canvas = document.createElement('canvas')
		this.appendChild(canvas)
		this.canvas = canvas

		canvas.style.display = 'inline-block'
		canvas.style.position = 'absolute'
		canvas.style.top = '50%' 
		canvas.style.left = '50%'
		canvas.style.transform = 'translate(-50%, -50%)'

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
	constructor(path, maxOffset){
		this.path = path
		this.maxOffset = maxOffset
		this.offset = maxOffset.clone()
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


var component = xtag.register(componentName, {
	lifecycle, accessors, methods
})

module.exports = component











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

module.exports = sizer

},{}]},{},[1]);
