import state from '/m/state.js'
import { renderUI, renderGL } from '/m/render.js'
import { ui_padding, quad_map } from '/m/config.js'

export function loadImage(src) {
  let { $ui, $gl } = state.dom

  let img = document.createElement('img')
  img.onload = function() {
    state.img = img
    state.zoom = 1
    setZoom()

    $ui.width = img.width + ui_padding * 2
    $ui.height = img.height + ui_padding * 2
    let cx = $ui.getContext('2d')
    cx.translate(ui_padding, ui_padding)
    cx.drawImage(img, 0, 0, img.width, img.height)

    $gl.width = img.width
    $gl.height = img.height
    setUpProgram(img)

    // reset runs render for UI and GL
    reset()
  }
  img.src = src
}

export function domLoadImage() {
  let input = document.querySelector('#file_input')
  function handleChange(e) {
    let images = []
    for (let item of this.files) {
      if (item.type.indexOf('image') < 0) {
        continue
      }
      let src = URL.createObjectURL(item)
      loadImage(src)
      this.removeEventListener('change', handleChange)
    }
  }
  input.addEventListener('change', handleChange)

  input.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  )
}

export function modifyTexture(x, y) {
  let pointer = state.cache.pointer
  let type = 'positions'
  if (pointer > 3) {
    type = 'textures'
    pointer = pointer - 4
  }
  let { img } = state
  let coords = quad_map[pointer]
  for (let coord of coords) {
    state[type][coord[0]] = Math.min(
      1,
      Math.max(0, x / (img.width * state.zoom))
    )
    state[type][coord[1]] = Math.min(
      1,
      Math.max(0, y / (img.height * state.zoom))
    )
  }
  renderUI()
  renderGL()
}

function setUpProgram(img) {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  let { $gl } = state.dom
  $gl.width = img.width
  $gl.height = img.height
  let gl = $gl.getContext('webgl')
  if (!gl) {
    return
  }

  // setup GLSL program
  let program = webglUtils.createProgramFromScripts(gl, [
    'vertex-shader-2d',
    'fragment-shader-2d',
  ])

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  // Create a texture.
  let texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)

  state.gl = gl
  state.program = program
}

function clear() {
  let gl = state.gl
  // Clear the canvas
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
}

export function drawImage(image, x, y, w, h) {
  let { gl, program } = state
  clear()

  // look up where the vertex data needs to go.
  let positionLocation = gl.getAttribLocation(program, 'a_position')

  // Create a buffer to put three 2d clip space points in
  let positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, state.positions, gl.STATIC_DRAW)

  gl.enableVertexAttribArray(positionLocation)

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  let texcoordLocation = gl.getAttribLocation(program, 'a_texCoord')

  // provide texture coordinates for the rectangle.
  var texcoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, state.textures, gl.STATIC_DRAW)

  // Turn on the texcoord attribute
  gl.enableVertexAttribArray(texcoordLocation)

  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0)

  // Draw the rectangle.
  var primitiveType = gl.TRIANGLES
  var offset = 0
  var count = 6
  gl.drawArrays(primitiveType, offset, count)
}

export function modifyGL() {
  // TODO figure out what you need to update
}

export function reset() {
  state.textures = new Float32Array([
    0.0, // [ x 0
    0.0, //   y 1 ]
    1.0, // [ x 2
    0.0, //   y 3 ]
    0.0, // [ x 4
    1.0, //   y 5 ]
    0.0, // [ x 6
    1.0, //   y 7 ]
    1.0, // [ x 8
    0.0, //   y 9 ]
    1.0, // [ x 10
    1.0, //   y 11 ]
  ])
  state.positions = new Float32Array([
    0.0, // [ x 0
    0.0, //   y 1 ]
    1.0, // [ x 2
    0.0, //   y 3 ]
    0.0, // [ x 4
    1.0, //   y 5 ]
    0.0, // [ x 6
    1.0, //   y 7 ]
    1.0, // [ x 8
    0.0, //   y 9 ]
    1.0, // [ x 10
    1.0, //   y 11 ]
  ])
  renderUI()
  renderGL()
}

export function zoomIn() {
  state.zoom = Math.min(4, state.zoom * 2)
  resizeCanvas()
  setZoom()
}

export function zoomOut() {
  state.zoom = Math.max(0.25, state.zoom / 2)
  resizeCanvas()
  setZoom()
}

export function setZoom() {
  state.dom.$zoom_read.innerHTML = Math.round(state.zoom * 100) + '%'
}

function resizeCanvas() {
  let { img, gl } = state
  let $ui = state.dom.$ui
  let $gl = state.dom.$gl

  $ui.width = img.width * state.zoom + ui_padding * 2
  $ui.height = img.height * state.zoom + ui_padding * 2
  let cx = $ui.getContext('2d')
  cx.translate(ui_padding, ui_padding)
  renderUI()

  $gl.width = img.width * state.zoom
  $gl.height = img.height * state.zoom
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  renderGL()
}

export function saveImage() {
  let { gl } = state
  let link = document.createElement('a')
  renderGL()
  gl.canvas.toBlob(function(blob) {
    link.setAttribute(
      'download',
      'tri-' + Math.round(new Date().getTime() / 1000) + '.png'
    )

    link.setAttribute('href', URL.createObjectURL(blob))
    link.dispatchEvent(
      new MouseEvent(`click`, {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    )
  })
}

export function closeInfo() {
  let { $info_box, $info_opener } = state.dom
  $info_box.style.display = 'none'
  $info_opener.style.display = 'block'
}

export function openInfo() {
  let { $info_box, $info_opener } = state.dom
  $info_opener.style.display = 'none'
  $info_box.style.display = 'block'
}

export function onDrop(e) {
  e.preventDefault()
  e.stopPropagation()
  let file = e.dataTransfer.files[0]
  let filename = file.path ? file.path : file.name ? file.name : ''
  let src = URL.createObjectURL(file)
  loadImage(src)
}

export function onDrag(e) {
  e.stopPropagation()
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
}

export function onPaste(e) {
  e.preventDefault()
  e.stopPropagation()
  for (const item of e.clipboardData.items) {
    if (item.type.indexOf('image') < 0) {
      continue
    }
    let file = item.getAsFile()
    let src = URL.createObjectURL(file)
    loadImage(src)
  }
}
