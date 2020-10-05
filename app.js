import state from '/m/state.js'
import { initMouse } from '/m/mouse.js'
import {
  domLoadImage,
  loadImage,
  modifyTexture,
  reset,
  zoomIn,
  zoomOut,
  saveImage,
  closeInfo,
  openInfo,
} from '/m/actions.js'
import { ui_padding } from '/m/config.js'

function setAbsolute($el, x, y, w, h) {
  $el.style.position = 'absolute'
  $el.style.left = x + 'px'
  $el.style.top = y + 'px'
  $el.style.width = w + 'px'
  $el.style.height = h + 'px'
}

function addDomState($el, name) {
  state.dom[name] = $el
}

function layout(window) {
  let { $tile0, $tile1, $divider } = state.dom
  let w = window.innerWidth
  let h = window.innerHeight
  let aspect = w / h
  if (aspect > 1) {
    // side by side
    let half_w0 = Math.round(w / 2)
    let half_w1 = w - half_w0
    setAbsolute($tile0, 0, 0, half_w0, h)
    setAbsolute($tile1, half_w0, 0, half_w1, h)
    setAbsolute($divider, half_w0 - 1, 0, 1, h)
  } else {
    // stacked
    let half_h0 = Math.round(h / 2)
    let half_h1 = h - half_h0
    setAbsolute($tile0, 0, 0, w, half_h0)
    setAbsolute($tile1, 0, half_h0, w, half_h1)
    setAbsolute($divider, 0, half_h0 - 1, w, 1)
  }
}

function init() {
  let $tile0 = document.querySelector('#tile0')
  let $tile1 = document.querySelector('#tile1')
  let $divider = document.createElement('div')
  $divider.style.background = 'black'
  $divider.style.zIndex = 9
  document.body.appendChild($divider)
  let $ui = document.querySelector('#ui')
  let $gl = document.querySelector('#gl')
  let $zoom_read = document.querySelector('#zoom_read')
  let $info_box = document.querySelector('#info_box')
  let $info_opener = document.querySelector('#info_opener')
  addDomState($tile0, '$tile0')
  addDomState($tile1, '$tile1')
  addDomState($divider, '$divider')
  addDomState($ui, '$ui')
  addDomState($gl, '$gl')
  addDomState($zoom_read, '$zoom_read')
  addDomState($info_box, '$info_box')
  addDomState($info_opener, '$info_opener')
  layout(window)
  loadImage('/bowie-profile.jpg')

  // Event listeners
  window.addEventListener('resize', () => {
    layout(window)
  })
  initMouse()
  let $scrollers = document.querySelectorAll('.tile_scroller')
  let $scroll0 = $scrollers[0]
  let $scroll1 = $scrollers[1]
  let syncingFrom0 = false
  let syncingFrom1 = false
  $scroll0.addEventListener('scroll', e => {
    if (!syncingFrom1) {
      syncingFrom0 = true
      $scroll1.scrollTop = $scroll0.scrollTop
      $scroll1.scrollLeft = $scroll0.scrollLeft
    }
    syncingFrom1 = false
  })
  $scroll1.addEventListener('scroll', e => {
    if (!syncingFrom0) {
      syncingFrom1 = true
      $scroll0.scrollTop = $scroll1.scrollTop
      $scroll0.scrollLeft = $scroll1.scrollLeft
    }
    syncingFrom0 = false
  })
  window.loadImage = () => {
    domLoadImage()
  }
  window.saveImage = () => {
    saveImage()
  }
  window.reset = () => {
    reset()
  }
  window.zoomIn = () => {
    zoomIn()
  }
  window.zoomOut = () => {
    zoomOut()
  }
  window.closeInfo = () => {
    closeInfo()
  }
  window.openInfo = () => {
    openInfo()
  }
  window.addEventListener('keydown', e => {
    if (e.key === '+') {
      zoomIn()
    } else if (e.key === '-') {
      zoomOut()
    } else if (e.key === 'o') {
      domLoadImage()
    } else if (e.key === 'p') {
      saveImage()
    } else if (e.key === 'r') {
      reset()
    }
  })
}

window.addEventListener('load', () => {
  init()
})
