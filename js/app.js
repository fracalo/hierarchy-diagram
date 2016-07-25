var jj =
  { name: 'root',
    children:[
      { name:'html',
        children:[
          { name:'head',
            children:[
              { name:'title' },
              { name:'link' },
              { name:'script' },
            ]
          },
          {
            name:'body',
            children:[
              { name:'h1'},
              { name:'div',
                children:[
                  {name:'p'},
                  {name:'p'},
                  {name:'p'},
                  {name:'p'},
                  {name:'p'},
                ]
              }
            ]
          },
        ]
      }
    ]
  };


//
// const levelsLength = (childArray,levels,i) => {
//   i = (i || 0);
//   levels = levels || [];
//   levels[i] = levels[i] || {};
//   levels[i].len = levels[i].len || 0;
//   levels[i].len += (childArray && childArray.length) ? childArray.length : 0;
//   i++;
//   childArray.forEach(x => {
//     if (x.children && x.children.length)
//       levelsLength(x.children,levels,i);
//   });
//   return levels;
// }
//
// const levelsLen = (o,levels,i) => {
//   i = (i || 0);
//   levels = levels || [];
//   levels[i] = levels[i] || {};
//   levels[i].len = levels[i].len || 0;
//   levels[i].len += (o.children && o.children.length) ? o.children.length : 0;
//   i++;
//   if (o.children && o.children.length)
//   o.children.forEach(x => {
//     levelsLen(x,levels,i);
//   });
//   return levels;
// }
// const levLen = levelsLen(jj);

const levelsNames = (o, levels, i) => {
  i = i || 0;
  levels = levels || [];
  levels[i] = levels[i] || [];
  levels[i].push(o.name);
  i++;
  if (o.children && o.children.length)
  o.children.forEach(x => {
    levelsNames(x,levels,i);
  });
  return levels;
}

const levNames = levelsNames( jj, [],  0);

const getLongestName = (aa) => {
  return aa.reduce((a,b) => {
    if (Array.isArray(a))
      return getLongestName(a);
    return (a.length >= b.length) ? a : b;
  })
}

const longestName = getLongestName(levNames)
const boxSize = longestName.length + 6; // -|-abc-|-

const branchSize = (b) => (b.children && b.children.length) ?
  b.children.reduce((ac,x) =>  ac += branchSize(x) , 0) : 1 ;

const createLines = (o,pad,lev,res) => {
  if (lev === undefined)
    lev = 0;
  res = res || [];
  res[lev] = res[lev] || '';
  const branchLine = branch(o);
  res[lev] += branchLine;
  lev += 1;
  if (o.children && o.children.length)
    o.children.forEach(x=> { createLines(x,pad,lev,res); });
  else if (lev < levNames.length)
    createLines(branchLine.length,pad,lev,res);;

  return res.join('\n');
}

const branch = (o,pad, variant) => {
  if (typeof o === 'number')
    return paddedLine(o);

  let lineSpace = branchSize(o) ;

  return branch.central(lineSpace,o.name,boxSize);
}
branch.upCon = (lineSpace) =>{}
branch.central = (lineSpace,name, boxSize) => {
  line = '';
  lineSpace -=  1; //create space for insertion;
  let firstChunk = Math.floor(lineSpace/2);
  let secChunk = lineSpace - firstChunk;
  line += '/'.repeat(firstChunk * boxSize);
  line += boxedName(name,boxSize);
  line += '\\'.repeat(secChunk * boxSize);
  return line;
}

const paddedLine = (n) => {
  let line = '';
  while(n--)
    line += ' ';
  return line;
}
const boxedName = (str,n) => {
  n -= 4;
  const leftPad = Math.floor((n - str.length) / 2);
  const rightPad = n - str.length - leftPad;
  return   ' |' + ' '.repeat(leftPad) + str + ' '.repeat(rightPad) +
  '| ';

}
// const body = jj.children[0].children[1]
// console.log('body', body);
// const div = body.children[0];
// console.log('div', div);

 console.log( createLines(jj));
