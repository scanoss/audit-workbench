export function generateFileTree(scan: Record<string, unknown>): Promise<any> {
  return new Promise((resolve) => {
    const obj = {};
    Object.keys(scan).forEach((p) =>
      p.split('/').reduce((o, name) => (o[name] = o[name] || {}), obj)
    );

    if ('' in obj) {
      delete Object.assign(obj, { '/': obj[''] })[''];
    }

    const convert = (o, parent) =>
      Object.keys(o).map((key) => {
        const p = parent
          ? parent === '/'
            ? `${parent}${key}`
            : `${parent}/${key}`
          : key;

        return Object.keys(o[key]).length
          ? {
              label: getLabelMatchesCount(key, parent, 'folder'),
              children: convert(o[key], p),
              type: 'folder',
              value: p,
              showCheckbox: false,
            }
          : {
              label: key,
              type: 'file',
              value: p,
              showCheckbox: false,
              className: getStatus(scan, p),
            };
      });

    const result = convert(obj, null);
    // return !result[0].value && result[0].children;
    resolve(result);
  });
}

export function getComponents(scan: any[]) {
  return [];
}

function getLabelMatchesCount(label, value, type) {
  // TODO: ver matches

  /* const matches = codetree.filter(
    (f) => f.path.includes(value) && f.results > 0
  );
  if (matches.length > 0) {
    return `${label}(${matches.length})`;
  } */

  return label;
}

function getStatus(scan, key) {
  return scan[key][0]?.id !== 'none' ? 'match' : '';
}

export default {
  generateFileTree,
};
