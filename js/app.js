'use strict';
const jj =
  { name: 'root',
    children: [
      { name: 'html',
        children: [
          { name: 'head',
            children: [
              { name: 'title' },
              { name: 'link' },
              { name: 'link' },
              { name: 'script' }
            ]
          },
          {
            name: 'body',
            children: [
              { name: 'h1' },
              { name: 'div',
                children: [
                  { name: 'p' },
                  { name: 'p' },
                  { name: 'p' },
                  { name: 'p' },
                  { name: 'p' }
                ]
              }
            ]
          }
        ]
      }
    ]
  };


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
  i = (i || 0);
  levels = levels || [];
  levels[i] = levels[i] || [];
  levels[i].push(o.name);
  i++;
  if (o.children && o.children.length)
    o.children.forEach(x => {
      levelsNames(x, levels, i);
    });
  return levels;
};

const levNames = levelsNames(jj, [], 0);

const getLongestName = (aa) => aa.reduce((a, b) => {
  if (Array.isArray(a))
    return getLongestName(a);
  return (a.length >= b.length) ? a : b;
});


const longestName = getLongestName(levNames);
let padding;

const boxSize = longestName.length + 4 + (padding || 1) * 2; // -|-abc-|-
// const halfBoxProx = Math.floor(boxSize / 2);
const branchSize = (b) => (
  (b.children && b.children.length) ?
   b.children.reduce((ac, x) => (ac += branchSize(x)), 0) : 1
 );
 /*
          --------
          | ciao |
          --------
    _________|____________  // this is it
    |                    |
--------              --------
| ciao |              | ciao |
--------              --------


  */

const processStage = [
  /* {
    name: 'upCon',
    int: ' ',
    border: ' ',
    ent: '|'
  }, {
    name: 'upper',
    int: '-',
    border: '-',
    ent: '-'
  }, */{
    name: 'central',
    int: ' ',
    border: '|'
  }, /* {
    name: 'lower',
    int: '-',
    border: '-',
    ent: '-'
  }, */
  {
    name: 'interlevel',
    int: '_',
    border: '_',
    ent: '.'
  }
];
const stageByName = processStage.reduce((ac, x) => {
  ac[x.name] = x;
  return ac;
}, {});

const createLines = (o, stage, pad = 1, lev = 0, res = [], opt = { only: true }) => {
  res[lev] = res[lev] || '';

  const branchLine = branch(o, stage, pad, opt);
  // opt = null; // reset starting opt
  res[lev] += branchLine;

  lev += 1;
  if (o.children && o.children.length) {
    o.children.forEach((x, i, arr) => {
      const option =
      (! stage.name === 'interlevel') ? undefined :
      (arr.length === 1) ? { only: true } :
      (i === 0) ? { first: true } :
      (i === arr.length - 1) ? { last: true } : true;

      createLines(x, stage, pad, lev, res, option);
    });
  }
  else if (lev < levNames.length) { // multiply padding times processStage.length
    createLines(branchLine.length, stage, pad, lev, res);
  }
  return res;
};

const branch = (o, variant, pad, opt) => {
  if (typeof o === 'number')
    return paddedLine(o);

  const pre =
  (opt && opt.first) ? ' ' :
  (opt) ? '_' : ' ';
  const post =
  (opt && opt.last) ? ' ' :
  (opt) ? '_' : ' ';

  const lSpace = branchSize(o) - 1;  // create space for insertion;;
  let line = '';
  const firstChunk = Math.floor(lSpace / 2);
  const secChunk = lSpace - firstChunk;
  line += pre.repeat(firstChunk * boxSize);
  line += boxedEntity(o.name, boxSize, pad, variant, opt);
  line += post.repeat(secChunk * boxSize);
  return line;
};


// const boxedEntity = (str, n, pad, v, opt) => {
//   n -= 4; // minimal padding
//   // const x = stageByName[v];
//   str =
//   // (opt && !opt.only) ? '.' :
//   (v.ent || str);
//
//   const outerLeft = ' ';
//   const outerRight = ' ';
//   const leftBord = ' ';
//   const rightBort = ' ';
//   const leftPad = v.border;
//   const rightPad = v.int;
//   const leftPadLen = Math.floor((n - str.length) / 2);
//   const rightPadLen = n - str.length - leftPad;
//   return (
//     outerLeft.repeat(pad) +
//     v.border +
//     (v.int).repeat(leftPadLen) +
//     str +
//     (v.int).repeat(rightPadLen) +
//     v.border + ' '.repeat(pad)
//   );
// };
const boxedEntity = (str, n, pad, v, opt) => {
  n -= 4; // minimal padding
  // const x = stageByName[v];
  str = v.ent || str;
  const leftPad = Math.floor((n - str.length) / 2);
  const rightPad = n - str.length - leftPad;
  return (
    ' '.repeat(pad) +
    v.border +
    (v.int).repeat(leftPad) +
    str +
    (v.int).repeat(rightPad) +
    v.border + ' '.repeat(pad)
  );
};

const paddedLine = (n, c) => {
  c = c || ' ';
  return c.repeat(n);
};

const psd = processStage.map(x => createLines(jj, x));
console.log('psd', psd);


const transpose = (a) => a[0].map((_, i) => a.map(x => x[i]));

// const r = transpose(psd);
//
// console.log('r', r);
// const interlevel = (o, pad, lev, res) => {
//   res[lev] = res[lev] || '';
//   let first,
//     last;
//
//   const interPar = {
//       name: 'interlevel',
//       int: '*',
//       border: '*',
//       ent: '^'
//     };
//
//   if (o.children && o.children.length ) {
//     for (let i = 0, len = o.children.length, child = o.children[i]; i < len; i++) {
//       const lSpace = (branchSize(child) - 1) ;
//       // const halfBoxProx = 0; // Math.floor(boxSize / 2 - 1);
//       // const otherHalf = boxSize - halfBoxProx;
//       let firstChunk = Math.floor(lSpace / 2); //
//       let secChunk = lSpace - firstChunk ;
//       if (i === 0) {
//         first = ' '; last = '_'; // firstChunk -= boxSize; secChunk = lSpace - firstChunk;
//       }
//       else if (i === len - 1) {
//         first = '_'; last = ' '; // firstChunk += boxSize; secChunk = lSpace - firstChunk;
//       }
//       else {
//         first = last = '_';
//       }
//       res[lev] += first.repeat(firstChunk * boxSize);
//       res[lev] += boxedEntity(null, boxSize, pad, interPar);
//       res[lev] += last.repeat(secChunk * boxSize);
//     }
//   }
//   else if (o.children && o.children.length === 1) {
//     const prevSize = branchSize(o) * boxSize - 1;
//     const firstChunk = Math.floor(prevSize / 2 - boxSize / 2);
//     const secChunk = prevSize - firstChunk;
//     first = last = '0';
//     res[lev] += first.repeat(firstChunk);
//     res[lev] += ' ';
//     res[lev] += last.repeat(secChunk);
//   }
//   else if (lev < levNames.length) { // multiply padding times
//     const prevSize = branchSize(o) * (boxSize + 1);
//     res[lev] += paddedLine(prevSize);
//   }
//
//   lev ++;
//   if (o.children && o.children.length)
//     o.children.forEach(c => interlevel(c, pad, lev, res));
//   return res;
// };
