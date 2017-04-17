# poly-refractor

2D canvas "fly-eye" image filter. 

Built using [x-tag](x-tag.github.io), but can easily be ported to vanilla js or other web component frameworks.

[![npm version](https://badge.fury.io/js/poly-refractor.svg)](https://badge.fury.io/js/poly-refractor) 

`npm install --save poly-refractor`

![](https://media.giphy.com/media/l4FGBi9E8Gze0ns5i/giphy.gif)

[Basic demo](https://positlabs.github.io/poly-refractor/examples/): Use controls to see what it can do.

[Source types](https://positlabs.github.io/poly-refractor/examples/source-types.html): Accepts media urls (.mp4, .png, etc.) as well as references to drawable elements (img, video, canvas)

[Custom cells](https://positlabs.github.io/poly-refractor/examples/custom-cell.html): Want some crazy tesselation pattern? Go on and have it! 

[Animation](https://positlabs.github.io/poly-refractor/examples/animation.html): Animate the cell offsets to make some neat transitions.

## quickstart

```
<!-- load the stuff -->
<script src='https://cdnjs.cloudflare.com/ajax/libs/x-tag/1.5.11/x-tag-core.js'></script>
<script src='node_modules/poly-refractor/docs/poly-refractor.js'></script>

<!-- it's so easy -->
<poly-refractor src='image.jpg'></poly-refractor>
```

## docs

### attributes

All attributes can be assigned declaratively or imperatively. Attribute names are dashed (e.g. cell-generator), while property names are camel-cased (e.g. cellGenerator).

#### src

Specify the path to the media (e.g. src="image.png"). With js, you can set this value to reference any drawable `HTMLElement` (img, canvas, video). `refractor.src = document.querySelector('video')`. The latter approach is recommended since it gives you control over the video element. By default, a video element will be generated with attributes `autoplay` and `loop`.

#### cells-x, cells-y

Number of cells to create horizontally and vertically. Defaults to 9.

#### offset-factor

Strength of the offset effect. Defaults to 3.

#### cell-generator

Specify cell shape generator. Presets are `rect` and `diamond`. Defaults to `diamond`. Assign a custom handler to generate any polygonal shape. Custom handler will be passed arguments: cellsX, cellsY, offsetFactor. See [custom cells](https://positlabs.github.io/poly-refractor/examples/custom-cell.html) for more info.

### classes

Classes can be referenced on every `poly-refractor` instance. 

`var Vector2 = document.querySelector('poly-refractor').Vector2`

#### Vector2

General purpose Vector2 used for creating paths and other vector-y things. `new Vector2(x, y)`

#### Cell

Used for creating cells. `new Cell(shape, maxOffset)`. `shape` is a `Vector2` array that defines the path of the shape. `maxOffset` is a `Vector2` used in conjunction with `offsetFactor` 

