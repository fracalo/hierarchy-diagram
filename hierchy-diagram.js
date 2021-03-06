
const hierarchyDiag = (parsedJson, padLen = 2) => {
  if (typeof parsedJson !== 'object')
    throw new Error('hierchyDiag first parameter must be an object');
  if (isNaN(padLen))
    throw new Error('hierchyDiag second parameter seems not to be a number');
  padLen = Math.abs(Math.floor(padLen / 2) * 2);

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

  const getLongestName = (aa) => aa.reduce((a, b) => {
    if (Array.isArray(a))
      return getLongestName(a);
    if (Array.isArray(b))
      return getLongestName(b);
    return (a.length >= b.length) ? a : b;
  });

  const levNames = levelsNames(parsedJson, [], 0);
  const longestName = getLongestName(levNames);
  const boxSize = longestName.length + 4 + (padLen || 1) * 2; // -|-abc-|-

  const genBranchSize = (b) => (
    (b.children && b.children.length) ?
     b.children.reduce((ac, x) => (ac += genBranchSize(x)), 0) : 1
   );
  const branchSize = (b) => {
    if (!branchSize.map)
      branchSize.map = new Map();
    if (!branchSize.map.get(b))
      branchSize.map.set(b, genBranchSize(b));
    return branchSize.map.get(b);
  };
  const paddedLine = (n, c) => {
    c = c || ' ';
    return c.repeat(n);
  };

  const processStage = [
    {
      name: 'interlevel',
      ent: '_'
    }, {
      name: 'upCon',
      int: ' ',
      border: ' ',
      ent: '|'
    }, {
      name: 'upper',
      int: '-',
      border: '-',
      ent: '-'
    }, {
      name: 'central',
      int: ' ',
      border: '|'
    }, {
      name: 'lower',
      int: '-',
      border: '-',
      ent: '-'
    }, {
      name: ';lowCon',
      int: ' ',
      border: ' ',
      ent: '|'
    }
  ];

  const branch = (o, variant, pad, opt) => {
    if (typeof o === 'number')
      return paddedLine(o);

    const pre = (opt && !(opt.only || opt.first)) ? '_' : ' ';
    const post = (opt && !(opt.only || opt.last)) ? '_' : ' ';
    const lSpace = branchSize(o) - 1;
    const firstChunk = Math.floor(lSpace / 2);
    const secChunk = lSpace - firstChunk;
    let line = '';

    line += pre.repeat(firstChunk * boxSize);
    line += boxedEntity(o.name, boxSize, pad, variant, opt);
    line += post.repeat(secChunk * boxSize);
    return line;
  };


  const boxedEntity = (str, n, pad, v, opt) => {
    n -= 4; // minimal padding
    str = v.ent || str;

    const outLeft = (opt && !opt.first && !opt.only) ? '_' : ' ';
    const outRight = (opt && !opt.last && !opt.only) ? '_' : ' ';
    const bLeft = (opt && !opt.first && !opt.only) ? '_' : (opt) ? ' ' : v.border;
    const bRight = (opt && !opt.last && !opt.only) ? '_' : (opt) ? ' ' : v.border;
    const inLeft = (opt && !opt.first && !opt.only) ? '_' : (opt) ? ' ' : v.int;
    const inRight = (opt && !opt.last && !opt.only) ? '_' : (opt) ? ' ' : v.int;
    const leftPad = Math.floor((n - str.length) / 2);
    const rightPad = n - str.length - leftPad;

    return (
      outLeft.repeat(pad / 2) +
      bLeft +
      inLeft.repeat(leftPad) +
      str +
      inRight.repeat(rightPad) +
      bRight +
      outRight.repeat(pad / 2)
    );
  };

  const createLines = (o, stage, pad, lev = 0, res = [], opt) => {
    if (lev === 0 && stage.name === 'interlevel')
      opt = { only: true };

    res[lev] = res[lev] || '';

    const branchLine = branch(o, stage, pad, opt);
    res[lev] += branchLine;

    lev += 1;
    if (o.children && o.children.length) {
      o.children.forEach((x, i, arr) => {
        const option =
        (stage.name !== 'interlevel') ? undefined :
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

  /** reorganize functions for perfect look */
  const mergeLines = (aStr, bStr, searchA, repB) => {
    const a = aStr.split('');
    const b = bStr.split('');
    let len = a.length;
    while (len--) {
      if (a[len] === searchA)
        b[len] = repB;
    }
    return b.join('');
  };
  const mergeArrayAndConnectors = (aa) => {
    let i = 0;
    const res = [];
    while (i < aa.length) {
      const outer = aa[i];
      for (let j = 0, len = outer.length; j < len; j++) {
        const inner = outer[j];
        if (j === 0 && res.length) {
          res[res.length - 1] = mergeLines(res[res.length - 1], inner, '|', '|');
          continue;
        }
        res.push(inner);
      }
      i++;
    }
    return res;
  };
  const trimTrailingLeading = (a) => {
    // remove trainling '|'
    let res = a.map(x => x.split(''));
    res = transpose(res);
    res = res.map(x => {
      let i = x.length;
      while (--i) {
        if (x[i] === '|')
          x[i] = ' ';
        else if (x[i] !== ' ')
          break;
      }
      return x;
    });
    res = transpose(res).map(x => x.join(''));
    // remove leading 2 lines
    return res.slice(2);
  };

  const psd = processStage.map(x => createLines(parsedJson, x, padLen));
  const transpose = (a) => a[0].map((_, i) => a.map(x => x[i]));
  const trans = transpose(psd);

  const merged = mergeArrayAndConnectors(trans);
  const trimmed = trimTrailingLeading(merged);
  return trimmed;
};
