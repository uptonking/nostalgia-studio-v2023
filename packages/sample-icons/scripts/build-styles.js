var sass = require('sass');
var fs = require('fs');

const srcPathBase = 'src/';
const srcPathArr = [srcPathBase + 'icono.scss'];

const outDir = 'dist/';
fs.existsSync(outDir) || fs.mkdirSync(outDir, { recursive: true });

function generateOutputNameFromSrcPath(path) {
  const nameArr = path.split('/');
  return nameArr[nameArr.length - 1].split('.')[0];
  // return nameArr.pop();
  // return nameArr.split(' ').slice(-1)[0];
}

function startBuildStyles() {
  srcPathArr.forEach((path) => {
    // made up of 2 words, e.g. bootstrap-light
    const outputName = generateOutputNameFromSrcPath(path);
    const outputFileName = outDir + outputName + '.css';
    console.log('==current output: ', outputFileName);

    sass.render(
      {
        file: path,
        outFile: outputFileName,
        sourceMap: true,
        importer: function (url, prev, done) {
          // ...
        },
      },
      function (err, result) {
        fs.writeFile(outputFileName, result.css, function (err) {
          if (err) return console.error(err);
          console.log(outputFileName + ' has been saved!');
        });
        fs.writeFile(outputFileName + '.map', result.map, function (err) {
          if (err) return console.error(err);
          console.log(outputFileName + '.map has been saved!');
        });
      },
    );
  });
}

startBuildStyles();

// for quick test，要手动确认fs.writeFile路径对应的目录存在
// sass.render(
//   {
//     file: 'src/primitive/primitive-light.scss',
//     outFile: 'dist/output.css',
//     sourceMap: true,
//   },
//   function (error, result) {
//     if (!error) {
//       fs.writeFile('dist/output.css', result.css, function (err) {
//         if (err) return console.error(err)
//         console.log('output style file has been saved!');
//       });
//     }
//   },
// );
