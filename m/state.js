let textures_init = new Float32Array([
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
let positions_init = new Float32Array([
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

export default {
  image: null,
  dom: {},
  positions: positions_init,
  textures: textures_init,
  handles: null,
  zoom: 1,
  cache: {
    mode: null,
    touch_mode: false,
    pointer: null,
  },
}
