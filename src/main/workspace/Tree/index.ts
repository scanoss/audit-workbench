import Node from './Tree/Node';
import File from './Tree/File';
import Folder from './Tree/Folder';

const fs = require('fs');
const path = require('path');

function dirFirstFileAfter(a: any, b: any) {
  if (!a.isDirectory() && b.isDirectory()) return 1;
  if (a.isDirectory() && !b.isDirectory()) return -1;
  return 0;
}

export default function buildTree(dir: string, root: Folder): Node {

  const dirEntries = fs
    .readdirSync(dir, { withFileTypes: true }) // Returns a list of files and folders
    .sort(dirFirstFileAfter)
    .filter((dirent: any) => !dirent.isSymbolicLink());

  for (const dirEntry of dirEntries) {
    if (dirEntry.isDirectory()) {
      const f: Folder = new Folder(dirEntry.name);
      const subTree = buildTree(`${dir}/${dirEntry.name}`, f);
      root.addChild(subTree);
    } else root.addChild(new File(dirEntry.name));
  }
  return root;
}
