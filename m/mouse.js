import state from '/m/state.js'
import { ui_padding } from '/m/config.js'
import { modifyTexture } from '/m/actions.js'
import { onDrag, onDrop, onPaste } from '/m/actions.js'

function getClientDimensions($el) {
  return [$el.offsetLeft, $el.offsetTop, $el.clientWidth, $el.clientHeight]
}

function rectContains(rect, x, y) {
  return (
    x >= rect[0] &&
    y >= rect[1] &&
    x <= rect[0] + rect[2] &&
    y <= rect[1] + rect[3]
  )
}

export function initMouse() {
  // feed in x or y independent of input mode

  function selectAnchor(client_x, client_y) {
    let { $ui } = state.dom
    let rect = $ui.getBoundingClientRect()
    let ui_x = client_x - rect.left - ui_padding
    let ui_y = client_y - rect.top - ui_padding
    for (let i = 0; i < state.handles.length; i++) {
      let reverse = state.handles.length - 1 - i
      let handle = state.handles[reverse]
      let rad = 24
      if (
        rectContains(
          [handle[0] - rad, handle[1] - rad, rad * 2, rad * 2],
          ui_x,
          ui_y
        )
      ) {
        state.cache.mode = 'handle_clicked'
        state.cache.pointer = reverse
        modifyTexture(ui_x, ui_y)
        break
      }
    }
  }
  function moveAnchor(client_x, client_y) {
    let { $tile0, $tile1, $ui } = state.dom
    if (state.cache.mode === 'handle_clicked') {
      let rect = $ui.getBoundingClientRect()
      let ui_x = client_x - rect.left - ui_padding
      let ui_y = client_y - rect.top - ui_padding
      modifyTexture(ui_x, ui_y)
    }
  }

  window.addEventListener('touchstart', e => {
    state.cache.touch_mode = true
    let client_x = e.changedTouches[0].clientX
    let client_y = e.changedTouches[0].clientY
    selectAnchor(client_x, client_y)
  })
  window.addEventListener('mousedown', e => {
    if (!state.cache.touch_mode) {
      selectAnchor(e.clientX, e.clientY)
    }
  })

  window.addEventListener(
    'touchmove',
    e => {
      if (state.cache.touch_mode && state.cache.mode !== null) {
        moveAnchor(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
        e.preventDefault()
      }
    },
    { passive: false }
  )
  window.addEventListener('mousemove', e => {
    moveAnchor(e.clientX, e.clientY)
  })

  window.addEventListener('touchend', e => {
    state.cache.touch_mode = false
    if (state.cache.mode !== null) {
      state.cache.mode = null
      state.cache.pointer = null
    }
  })
  window.addEventListener('mouseup', e => {
    if (state.cache.mode !== null) {
      state.cache.mode = null
      state.cache.pointer = null
    }
  })

  window.addEventListener('paste', onPaste)
  window.addEventListener('dragover', onDrag)
  window.addEventListener('drop', onDrop)
}
