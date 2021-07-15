/* eslint-disable no-restricted-syntax */
import { Inventory } from '../api/types';

export function mapFiles(files: any[]): any[] {
  const getStatus = (file) =>
    file.ignored === 1
      ? 'ignored'
      : file.identified === 1 ? 'identified' : 'pending';

  return files
    .map((file) => ({
      ...file,
      status: getStatus(file),
    }))
}

export function generateFileTree(scan: Record<string, unknown>): Promise<any> {
  return new Promise((resolve) => {
    const obj = {};
    Object.keys(scan).forEach((p) => p.split('/').reduce((o, name) => (o[name] = o[name] || {}), obj));

    if ('' in obj) {
      delete Object.assign(obj, { '/': obj[''] })[''];
    }

    const convert = (o, parent) =>
      Object.keys(o).map((key) => {
        const p = parent ? (parent === '/' ? `${parent}${key}` : `${parent}/${key}`) : key;

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

export function getComponents(scan: Record<string, any> | null = null): any[] {
  const obj = {};
  for (const [key, value] of Object.entries(scan)) {
    for (const result of value) {
      if (result.id === 'none') continue;

      const name = result.component;
      if (!obj[name]) {
        obj[name] = {
          name,
          purl: result.purl || [],
          licenses: result.licenses,
          vendor: result.vendor,
          version: result.version,
          url: result.url,
          files: [key],
          inventories: [],
          count: {
            all: 0,
            pending: 0,
            ignored: 0,
            identified: 0,
          },
        };
      } else {
        obj[name].files.push(key);
      }

      const status = result.status || 'pending';
      obj[name].count.all += 1;
      obj[name].count[status] += 1;
    }
  }

  return Object.keys(obj).map((key) => obj[key]);
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
  return scan[key] && scan[key][0]?.id !== 'none' ? 'match' : '';
}

export function updateTree(scan, inventory: Inventory) {
  const tree = inventory.files?.reduce((acc, file) => {
    scan[file][0].status = 'identified';
    return { ...acc, [file]: scan[file] };
  }, {});

  return tree;
}

export default {
  generateFileTree,
  updateTree,
  mapFiles,
};
