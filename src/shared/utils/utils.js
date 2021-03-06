function range(start, edge, step) {
  // If only 1 number passed make it the edge and 0 the start
  if (arguments.length === 1) {
    edge = start;
    start = 0;
  }

  // Validate edge/start
  edge = edge || 0;
  step = step || 1;

  // Create array of numbers, stopping before the edge
  const arr = [];
  for (arr; (edge - start) * step > 0; start += step) {
    arr.push(start);
  }
  return arr;
}

const colorsForLicense = [
  '#E8B34B',
  '#E22C2C',
  '#5754D0',
  '#9F69C0',
  '#FE7F10',
  '#E56399',
  '#E637BF',
  '#474647',
  '#153243',
  '#2DE1C2',
  '#F05365',
  '#A2D729',
  '#3C91E6',
  '#FA824C',
  '#C94277',
  '#E56B6F',
  '#F71735',
  '#011627',
  '#724E91',
  '#7D451B',
  '#9BE564',
];

const getColor = (index) => {
  if (index < colorsForLicense.length) {
    return colorsForLicense[index];
  }
  // repeat the array and return the same colors
  return getColor(index % colorsForLicense.length);
};

const languages = {
  sol: 'solidity',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  go: 'go',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  hpp: 'cpp',
  cs: 'csharp',
  css: 'css',
  html: 'htmlbars',
  xml: 'xml',
  json: 'json',
  md: 'markdown',
  yml: 'yaml',
  scss: 'scss',
  less: 'less',
  sass: 'sass',
  sql: 'sql',
  txt: 'text',
};

const getExtension = (file) => {
  const ext = file.split('.').pop();
  return languages[ext] || 'text';
};

export { range, getColor, colorsForLicense, getExtension, languages };
