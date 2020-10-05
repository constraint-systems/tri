import state from '/m/state.js'
import { ui_padding, quad_map } from '/m/config.js'
import { drawImage } from '/m/actions.js'

let hand_rad = 5

export function renderUI() {
  let { img, textures, positions } = state
  let { $ui } = state.dom
  let cx = $ui.getContext('2d')

  cx.clearRect(-ui_padding, -ui_padding, cx.canvas.width, cx.canvas.height)

  cx.drawImage(img, 0, 0, img.width * state.zoom, img.height * state.zoom)

  let px_x = v => Math.round(v * img.width * state.zoom)
  let px_y = v => Math.round(v * img.height * state.zoom)

  function drawEdges(type) {
    cx.beginPath()
    let from = type === 'texture' ? textures : positions
    let tri_num = from.length / (3 * 2)
    for (let t = 0; t < tri_num; t++) {
      for (let i = 0; i < 6; i += 2) {
        let x = px_x(from[t * 6 + i])
        let y = px_y(from[t * 6 + i + 1])
        if (i === 0) {
          cx.moveTo(x, y)
        } else {
          cx.lineTo(x, y)
          if (i === 4) {
            cx.closePath()
            cx.stroke()
          }
        }
      }
    }
  }

  function drawHandle(type, backer = false) {
    let coords = type === 'texture' ? textures : positions
    let handles = []
    let lookup = quad_map.map(v => [coords[v[0][0]], coords[v[0][1]]])
    for (let i = 0; i < lookup.length; i++) {
      let rad = backer ? hand_rad + 1 : hand_rad
      let corner = lookup[i]
      let x = px_x(corner[0]) - rad
      let y = px_y(corner[1]) - rad
      cx.fillRect(x, y, rad * 2, rad * 2)
      handles.push([x + rad, y + rad])
    }
    if (!backer) state.handles.push(...handles)
  }

  state.handles = []

  cx.lineJoin = 'bevel'

  // positions edge back
  cx.lineWidth = 4
  cx.strokeStyle = '#eee'
  drawEdges('positions')

  // texture handle back
  cx.fillStyle = '#eee'
  drawHandle('positions', true)

  // positions edge front
  cx.lineWidth = 2
  cx.strokeStyle = 'limegreen'
  drawEdges('positions')

  // texture handle front
  cx.fillStyle = 'limegreen'
  drawHandle('positions')

  // texture edge back
  cx.lineWidth = 4
  cx.strokeStyle = '#eee'
  drawEdges('texture')

  // texture handle back
  cx.fillStyle = '#eee'
  drawHandle('texture', true)

  // texture edge front
  cx.lineWidth = 2
  cx.strokeStyle = 'magenta'
  drawEdges('texture')

  // texture handle front
  cx.fillStyle = 'magenta'
  drawHandle('texture')
}

export function renderGL() {
  let { img } = state
  drawImage(img, 0, 0, img.width, img.height)
}
