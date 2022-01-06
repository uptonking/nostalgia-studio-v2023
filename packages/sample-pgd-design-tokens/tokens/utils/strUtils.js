/**
 * 计算b字符串比a字符串多的部分字符串
 */
function getDifference(a, b) {
  var i = 0;
  var j = 0;
  var result = '';

  while (j < b.length) {
    if (a[i] !== b[j] || i === a.length) result += b[j];
    else i++;
    j++;
  }
  return result;
}

function replaceRefWithCssVars(str, newStr) {
  const regexp = /{.+}/g;
  const matched = str.match(regexp);
  let replacedRet;
  if (matched) {
    // replacedRet = str.replace(regexp, `${newStr}${matched[0]}`);
    replacedRet = str.replace(regexp, newStr);
    // console.log('==searchRet, ', JSON.stringify(replacedRet));
  }
  return matched && replacedRet ? replacedRet : str;
}

const strUtils = { replaceRefWithCssVars, getDifference };

module.exports = strUtils;
