const { globalPrefix: prefix4g } = require('../../utils/globalConfig');
module.exports = {
  //   white: {
  //     // value: `{${prefix4g}.color.white.hsl.value}`, // 若存在名为value的中间属性名，则同级和下级属性值都不会输出了
  //     hsl: { value: `hsl(0,0%,100%)` },
  //     val: { value: `{${prefix4g}.color.white.hsl.value}` },
  //     base: {
  //       hsl: { value: `{${prefix4g}.color.white.hsl.value}` },
  //       val: { value: `{${prefix4g}.color.white.base.hsl.value}` },
  //     },
  //   },
  //   black: {
  //     hsl: { value: `hsl(0,0%,0%)` },
  //     val: { value: `{${prefix4g}.color.black.hsl.value}` },
  //     base: {
  //       hsl: { value: `{${prefix4g}.color.black.hsl.value}` },
  //       val: { value: `{${prefix4g}.color.black.base.hsl.value}` },
  //     },
  //   },
  //   dark: {
  //     base: {
  //       hue: { value: 214.3, outputAsItIs: true },
  //       saturation: { value: `12.3%`, outputAsItIs: true },
  //     },
  //     val: { value: `{${prefix4g}.color.dark.hsl.value}` },
  //     hsl: {
  //       value: {
  //         h: `{${prefix4g}.color.dark.base.hue.value}`,
  //         s: `{${prefix4g}.color.dark.base.saturation.value}`,
  //         l: `11%`,
  //       },
  //     },
  //     light: {
  //       val: { value: `{${prefix4g}.color.dark.light.hsl.value}` },
  //       hsl: {
  //         value: {
  //           h: `{${prefix4g}.color.dark.base.hue.value}`,
  //           s: `10.4%`,
  //           l: `13%`,
  //         },
  //       },
  //     },
  //     lighter: {
  //       val: { value: `{${prefix4g}.color.dark.lighter.hsl.value}` },
  //       hsl: {
  //         value: {
  //           h: `{${prefix4g}.color.dark.base.hue.value}`,
  //           s: `9%`,
  //           l: `16%`,
  //         },
  //       },
  //     },
  //     dim: {
  //       val: { value: `{${prefix4g}.color.dark.dim.hsl.value}` },
  //       hsl: {
  //         value: {
  //           h: `{${prefix4g}.color.dark.base.hue.value}`,
  //           s: `{${prefix4g}.color.dark.base.saturation.value}`,
  //           l: `8%`,
  //         },
  //       },
  //     },
  //     dimmer: {
  //       val: { value: `{${prefix4g}.color.dark.dimmer.hsl.value}` },
  //       hsl: {
  //         value: {
  //           h: `{${prefix4g}.color.dark.base.hue.value}`,
  //           s: `{${prefix4g}.color.dark.base.saturation.value}`,
  //           l: `5%`,
  //         },
  //       },
  //     },
  //   },
  //   gray: {
  //     base: {
  //       hue: { value: 218, outputAsItIs: true },
  //       saturation: { value: `5%`, outputAsItIs: true },
  //     },
  //     val: { value: `{${prefix4g}.color.dark.hsl.value}` },
  //     hsl: {
  //       value: {
  //         h: `{${prefix4g}.color.gray.base.hue.value}`,
  //         s: `{${prefix4g}.color.gray.base.saturation.value}`,
  //         l: `87%`,
  //       },
  //     },
  //     light: {
  //       val: { value: `{${prefix4g}.color.gray.light.hsl.value}` },
  //       hsl: {
  //         value: {
  //           h: `{${prefix4g}.color.gray.base.hue.value}`,
  //           s: `15%`,
  //           l: `94%`,
  //         },
  //       },
  //     },
  //     lighter: {
  //       val: { value: `{${prefix4g}.color.gray.lighter.hsl.value}` },
  //       hsl: {
  //         value: {
  //           h: `{${prefix4g}.color.gray.base.hue.value}`,
  //           s: `{${prefix4g}.color.gray.base.saturation.value}`,
  //           l: `97%`,
  //         },
  //       },
  //     },
  //     dim: {
  //       val: { value: `{${prefix4g}.color.gray.dim.hsl.value}` },
  //       hsl: {
  //         value: {
  //           h: `{${prefix4g}.color.gray.base.hue.value}`,
  //           s: `{${prefix4g}.color.gray.base.saturation.value}`,
  //           l: `73%`,
  //         },
  //       },
  //     },
  //     dimmer: {
  //       val: { value: `{${prefix4g}.color.gray.dimmer.hsl.value}` },
  //       hsl: {
  //         value: {
  //           h: `{${prefix4g}.color.gray.base.hue.value}`,
  //           s: `{${prefix4g}.color.gray.base.saturation.value}`,
  //           l: `30%`,
  //         },
  //       },
  //     },
  //   },
  //   palette: {
  //     // 'gray-100': { value: `rgb(255, 255, 255)` },
  //     // 'gray-200': { value: `rgb(244, 244, 244)` },
  //     // 'gray-300': { value: `rgb(234, 234, 234)` },
  //     // 'gray-400': { value: `rgb(211, 211, 211)` },
  //     // 'gray-500': { value: `rgb(188, 188, 188)` },
  //     // 'gray-600': { value: `rgb(149, 149, 149)` },
  //     // 'gray-700': { value: `rgb(116, 116, 116)` },
  //     // 'gray-800': { value: `rgb(80, 80, 80)` },
  //     // 'gray-900': { value: `rgb(50, 50, 50)` },
  //     blue: {
  //       base: {
  //         hue: { value: 209, outputAsItIs: true },
  //         saturation: { value: `100%`, outputAsItIs: true },
  //       },
  //       val: { value: `{${prefix4g}.color.palette.blue.hsl.value}` },
  //       hsl: {
  //         value: {
  //           h: `{${prefix4g}.color.palette.blue.base.hue.value}`,
  //           s: `{${prefix4g}.color.palette.blue.base.saturation.value}`,
  //           l: `55%`,
  //         },
  //       },
  //       light: {
  //         val: { value: `{${prefix4g}.color.palette.blue.light.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.blue.base.hue.value}`,
  //             s: `{${prefix4g}.color.palette.blue.base.saturation.value}`,
  //             l: `65%`,
  //           },
  //         },
  //       },
  //       lighter: {
  //         val: { value: `{${prefix4g}.color.palette.blue.lighter.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.blue.base.hue.value}`,
  //             s: `{${prefix4g}.color.palette.blue.base.saturation.value}`,
  //             l: `92.5%`,
  //           },
  //         },
  //       },
  //       dim: {
  //         val: { value: `{${prefix4g}.color.palette.blue.dim.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.blue.base.hue.value}`,
  //             s: `{${prefix4g}.color.palette.blue.base.saturation.value}`,
  //             l: `45%`,
  //           },
  //         },
  //       },
  //       dimmer: {
  //         val: { value: `{${prefix4g}.color.palette.blue.dimmer.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.blue.base.hue.value}`,
  //             s: `25`,
  //             l: `15%`,
  //           },
  //         },
  //       },
  //     },
  //     green: {
  //       base: {
  //         hue: { value: 152, outputAsItIs: true },
  //         saturation: { value: `85%`, outputAsItIs: true },
  //       },
  //       val: { value: `{${prefix4g}.color.palette.green.hsl.value}` },
  //       hsl: {
  //         value: {
  //           h: `{${prefix4g}.color.palette.green.base.hue.value}`,
  //           s: `{${prefix4g}.color.palette.green.base.saturation.value}`,
  //           l: `50%`,
  //         },
  //       },
  //       light: {
  //         val: { value: `{${prefix4g}.color.palette.green.light.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.green.base.hue.value}`,
  //             s: `{${prefix4g}.color.palette.green.base.saturation.value}`,
  //             l: `70%`,
  //           },
  //         },
  //       },
  //       lighter: {
  //         val: { value: `{${prefix4g}.color.palette.green.lighter.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.green.base.hue.value}`,
  //             s: `{${prefix4g}.color.palette.green.base.saturation.value}`,
  //             l: `92.5%`,
  //           },
  //         },
  //       },
  //       dim: {
  //         val: { value: `{${prefix4g}.color.palette.green.dim.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.green.base.hue.value}`,
  //             s: `{${prefix4g}.color.palette.green.base.saturation.value}`,
  //             l: `40%`,
  //           },
  //         },
  //       },
  //       dimmer: {
  //         val: { value: `{${prefix4g}.color.palette.green.dimmer.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.green.base.hue.value}`,
  //             s: `25`,
  //             l: `15%`,
  //           },
  //         },
  //       },
  //     },
  //     yellow: {
  //       base: {
  //         hue: { value: 49, outputAsItIs: true },
  //         saturation: { value: `100%`, outputAsItIs: true },
  //       },
  //       val: { value: `{${prefix4g}.color.palette.yellow.hsl.value}` },
  //       hsl: {
  //         value: {
  //           h: `{${prefix4g}.color.palette.yellow.base.hue.value}`,
  //           s: `{${prefix4g}.color.palette.yellow.base.saturation.value}`,
  //           l: `50%`,
  //         },
  //       },
  //       light: {
  //         val: { value: `{${prefix4g}.color.palette.yellow.light.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.yellow.base.hue.value}`,
  //             s: `{${prefix4g}.color.palette.yellow.base.saturation.value}`,
  //             l: `70%`,
  //           },
  //         },
  //       },
  //       lighter: {
  //         val: { value: `{${prefix4g}.color.palette.yellow.lighter.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.yellow.base.hue.value}`,
  //             s: `{${prefix4g}.color.palette.yellow.base.saturation.value}`,
  //             l: `92.5%`,
  //           },
  //         },
  //       },
  //       dim: {
  //         val: { value: `{${prefix4g}.color.palette.yellow.dim.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.yellow.base.hue.value}`,
  //             s: `{${prefix4g}.color.palette.yellow.base.saturation.value}`,
  //             l: `40%`,
  //           },
  //         },
  //       },
  //       dimmer: {
  //         val: { value: `{${prefix4g}.color.palette.yellow.dimmer.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.yellow.base.hue.value}`,
  //             s: `25`,
  //             l: `15%`,
  //           },
  //         },
  //       },
  //     },
  //     red: {
  //       base: {
  //         hue: { value: 359, outputAsItIs: true },
  //         saturation: { value: `100%`, outputAsItIs: true },
  //       },
  //       val: { value: `{${prefix4g}.color.palette.red.hsl.value}` },
  //       hsl: {
  //         value: {
  //           h: `{${prefix4g}.color.palette.red.base.hue.value}`,
  //           s: `{${prefix4g}.color.palette.red.base.saturation.value}`,
  //           l: `65%`,
  //         },
  //       },
  //       light: {
  //         val: { value: `{${prefix4g}.color.palette.red.light.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.red.base.hue.value}`,
  //             s: `{${prefix4g}.color.palette.red.base.saturation.value}`,
  //             l: `70%`,
  //           },
  //         },
  //       },
  //       lighter: {
  //         val: { value: `{${prefix4g}.color.palette.red.lighter.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.red.base.hue.value}`,
  //             s: `{${prefix4g}.color.palette.red.base.saturation.value}`,
  //             l: `92.5%`,
  //           },
  //         },
  //       },
  //       dim: {
  //         val: { value: `{${prefix4g}.color.palette.red.dim.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.red.base.hue.value}`,
  //             s: `{${prefix4g}.color.palette.red.base.saturation.value}`,
  //             l: `35%`,
  //           },
  //         },
  //       },
  //       dimmer: {
  //         val: { value: `{${prefix4g}.color.palette.red.dimmer.hsl.value}` },
  //         hsl: {
  //           value: {
  //             h: `{${prefix4g}.color.palette.red.base.hue.value}`,
  //             s: `25`,
  //             l: `15%`,
  //           },
  //         },
  //       },
  //     },
  //   },
};
