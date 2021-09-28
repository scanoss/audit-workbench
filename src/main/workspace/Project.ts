/* eslint-disable max-classes-per-file */
import { EventEmitter } from 'events';
import fs from 'fs';
import { Component, Inventory, ProjectState, ScanState } from '../../api/types';

import * as Filtering from './filtering';
import { ScanDb } from '../db/scan_db';
import { licenses } from '../db/licenses';
import { Scanner } from '../scannerLib/Scanner';
import { ScannerEvents } from '../scannerLib/ScannerEvents';
import { ScannerCfg } from '../scannerLib/ScannerCfg';
import { IpcEvents } from '../../ipc-events';
import { defaultBannedList } from './filtering/defaultFilter';
import { isBinaryFileSync } from 'isbinaryfile';
import { Metadata } from './Metadata';

const path = require('path');

export class Project extends EventEmitter {
  work_root: string;

  scan_root: string;

  project_name: string;

  banned_list: Filtering.BannedList;

  logical_tree: any;

  results: any;

  scans_db!: ScanDb;

  scanner!: Scanner;

  msgToUI!: Electron.WebContents;

  filesSummary: any;

  processedFiles = 0;

  filesIndexed = 0;

  filesToScan: {};

  metadata: Metadata;

  state: ProjectState;

  constructor(name: string) {
    super();
    this.metadata = new Metadata(name);
    this.state = ProjectState.CLOSED;
  }

  public static async readFromPath(pathToProject: string): Promise<Project> {
    const mt: Metadata = await Metadata.readFromPath(pathToProject);
    const p: Project = new Project(mt.getName());
    p.setState(ProjectState.CLOSED);
    p.setMetadata(mt);
    return p;
  }

  public async open(): Promise<boolean> {
    if (this.state === ProjectState.OPENED) return false;
    this.state = ProjectState.OPENED;
    const project = await fs.promises.readFile(`${this.metadata.getMyPath()}/tree.json`, 'utf8');
    const a = JSON.parse(project);
    this.logical_tree = a.logical_tree;
    this.results = a.results;
    this.filesToScan = a.filesToScan;
    this.processedFiles = a.processedFiles;
    this.filesSummary = a.filesSummary;
    this.scans_db = new ScanDb(this.metadata.getMyPath());
    await this.scans_db.init();
    return true;
  }

  public async close() {
    console.log( `[ PROJECT ]: Closing project ${this.metadata.getMyPath()}`);
    this.state = ProjectState.CLOSED;
    await this.scanner.stop();
    this.scanner.removeAllListeners();
    this.scanner = null;
    this.logical_tree = null;
    this.scans_db = null;
    this.filesToScan = null;
    this.results = null;
  }

  public save(): void {
    this.metadata.save();
    fs.writeFileSync(`${this.metadata.getMyPath()}/tree.json`, JSON.stringify(this).toString());
  }

  public async startScanner() {
    this.state = ProjectState.OPENED;
    const myPath = this.metadata.getMyPath();
    this.project_name = this.metadata.getName(); // To keep compatibility
    this.banned_list = new Filtering.BannedList('NoFilter');
    this.cleanProject();
    if (!fs.existsSync(`${myPath}/filter.json`))
      fs.writeFileSync(`${myPath}/filter.json`, JSON.stringify(defaultBannedList).toString());
    this.banned_list.load(`${myPath}/filter.json`);
    this.scans_db = new ScanDb(myPath);
    await this.scans_db.init();
    await this.scans_db.licenses.importFromJSON(licenses);
    this.build_tree();
    this.indexScan(this.metadata.getScanRoot(), this.logical_tree, this.banned_list);
    const summary = { total: 0, include: 0, filter: 0, files: {} };
    this.filesSummary = summarizeTree(this.metadata.getScanRoot(), this.logical_tree, summary);
    console.log(`[ FILTERS ]: Total: ${this.filesSummary.total} Filter:${this.filesSummary.filter} Include:${this.filesSummary.include}`);
    this.filesToScan = summary.files;
    this.metadata.setScannerState(ScanState.READY_TO_SCAN);
    this.metadata.setFileCounter(summary.include);
    this.metadata.save();
    this.initializeScanner();
    this.scanner.cleanWorkDirectory();
    this.startScan();
  }

  public async resumeScanner() {
    if (this.metadata.getState() !== ScanState.SCANNING) return false;
    await this.open();
    this.initializeScanner();
    console.log(`[ PROJECT ]: Removing temporary files from previous scan`);
    this.scanner.cleanTmpDirectory();
    console.log(`[ PROJECT ]: Resuming scanner, pending ${Object.keys(this.filesToScan).length} files`)
    this.msgToUI.send(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: 'scanning',
      processed: (100 * this.processedFiles) / this.filesSummary.include,
    });
    this.startScan();
  }

  cleanProject() {
    if (fs.existsSync(`${this.metadata.getMyPath()}/results.json`)) fs.unlinkSync(`${this.metadata.getMyPath()}/results.json`);
    if (fs.existsSync(`${this.metadata.getMyPath()}/scan_db`)) fs.unlinkSync(`${this.metadata.getMyPath()}/scan_db`);
    if (fs.existsSync(`${this.metadata.getMyPath()}/tree.json`)) fs.unlinkSync(`${this.metadata.getMyPath()}/tree.json`);
  }

  initializeScanner() {
    const projectCfg = JSON.parse(fs.readFileSync(`${this.metadata.getMyPath()}/projectCfg.json`,'utf8'));
    const scannerCfg: ScannerCfg = new ScannerCfg();
    scannerCfg.API_URL = projectCfg.DEFAULT_URL_API;
    this.scanner = new Scanner(scannerCfg);
    this.scanner.setWorkDirectory(this.metadata.getMyPath());
    this.setScannerListeners();
  }

  setScannerListeners() {
    this.scanner.on(ScannerEvents.WINNOWING_STARTING, () => console.log('[ SCANNER ]: Starting Winnowing...'));
    this.scanner.on(ScannerEvents.WINNOWING_NEW_WFP_FILE, (dir) => console.log(`[ SCANNER ]: New WFP File`));
    this.scanner.on(ScannerEvents.WINNOWING_FINISHED, () => console.log('[ SCANNER ]: Winnowing Finished...'));
    this.scanner.on(ScannerEvents.DISPATCHER_WFP_SENDED, (dir) => console.log(`[ SCANNER ]: Sending WFP file ${dir} to server`));
    this.scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, async (data, dispatcherResponse) => {
      const filesScanned: Array<any> = dispatcherResponse.getFilesScanned();
      this.processedFiles += filesScanned.length;
      console.log(`[ SCANNER ]: New ${filesScanned.length} files scanned`);
      // eslint-disable-next-line no-restricted-syntax
      for (const file of filesScanned) delete this.filesToScan[`${this.metadata.getScanRoot()}${file}`];
      this.attachComponent(data);
      this.save();
      this.msgToUI.send(IpcEvents.SCANNER_UPDATE_STATUS, {
        stage: 'scanning',
        processed: (100 * this.processedFiles) / this.filesSummary.include,
      });
    });

    this.scanner.on(ScannerEvents.SCAN_DONE, async (resPath) => {
      console.log(`[ SCANNER ]: Scan Finished... Results on: ${resPath}`);
      await this.scans_db.results.insertFromFile(resPath);
      await this.scans_db.components.importUniqueFromFile();
      this.results = JSON.parse(fs.readFileSync(`${resPath}`, 'utf8'));
      this.metadata.setScannerState(ScanState.SCANNED);
      this.save();
      await this.close();
      this.msgToUI.send(IpcEvents.SCANNER_FINISH_SCAN, {
        success: true,
        resultsPath: this.metadata.getMyPath(),
      });
    });

    this.scanner.on('error', (error) => {
      this.save();
      this.close();
      this.msgToUI.send(IpcEvents.SCANNER_ERROR_STATUS, error);
    });
  }

  startScan() {
    console.log(`[ SCANNER ]: Start scanning path = ${this.metadata.getScanRoot()}`);
    this.metadata.setScannerState(ScanState.SCANNING);
    this.save();
    // eslint-disable-next-line prettier/prettier
    this.scanner.scanList(this.filesToScan, this.metadata.getScanRoot());
  }

  setMailbox(mailbox: Electron.WebContents) {
    this.msgToUI = mailbox;
  }

  public setState(state: ProjectState) {
    this.state = state;
  }

  public getState() {
    return this.state;
  }

  public setMetadata(mt: Metadata) {
    this.metadata = mt;
  }

  public setScanPath(name: string) {
    this.metadata.setScanRoot(name);
    this.metadata.save();
  }

  public setMyPath(myPath: string) {
    this.metadata.setMyPath(myPath);
    this.metadata.save();
  }

  public getMyPath() {
    return this.metadata.getMyPath();
  }

  public getProjectName() {
    return this.metadata.getName();
  }

  public getUUID(): string {
    return this.metadata.getUUID();
  }

  public getDto() {
    return this.metadata.getDto();
  }

  getScanRoot(): string {
    return this.metadata.getScanRoot();
  }

  public getResults() {
    return this.results;
  }

  build_tree() {
    const scanPath = this.metadata.getScanRoot();
    this.logical_tree = dirTree(scanPath, scanPath);
    this.emit('treeBuilt', this.logical_tree);
  }

  getLogicalTree() {
    return this.logical_tree;
  }

  attachInventory(inv: Inventory) {
    let i: number;
    let files: string[];
    files = inv.files;
    for (i = 0; i < inv.files.length; i += 1) {
      insertInventory(this.logical_tree, files[i], inv);
    }
  }

  attachComponent(comp: any) {
    for (const [key, value] of Object.entries(comp)) {
      for (let i = 0; i < value.length; i += 1) {
        // console.log(key+''+value[i].purl);
        if (value[i].purl !== undefined) insertComponent(this.logical_tree, key, value[i]);
      }
    }
  }

  set_filter_file(pathToFilter: string): boolean {
    this.banned_list.load(pathToFilter);
    return true;
  }

  getNodeFromPath(mypath: string) {
    let res: string[];
    // eslint-disable-next-line prefer-const
    if (!mypath || !mypath.includes('/')) throw new Error(`Error on path: "${mypath}`);

    res = mypath.split('/');
    if (res[0] === '') res.shift();
    if (res[res.length - 1] === '') res.pop();
    let nodes = this.logical_tree.children;
    let nodeFound: any = {};
    for (let i = 0; i < res.length - 1; i += 1) {
      const path = res[i];
       nodeFound = nodes.find((node) => {
        return (node.type === 'folder' && node.label === path);
      });
      nodes = nodeFound.children;
    }
     nodeFound = nodes.find((node) => {
      return (node.type === 'file' && node.label === res[res.length - 1]);
    });
    if (nodeFound) return nodeFound;
    return {};
  }

  get_proxy_leaf(leaf: any): any {
    if (leaf.type === 'file') return leaf;

    let j = 0;
    const ret = {
      type: 'folder',
      label: leaf.label,
      inv_count: leaf.inv_count,
      include: leaf.include,
      children: [],
      action: leaf.action,
    };
    ret.children = [];
    const children = [];
    for (j = 0; leaf.children && j < leaf.children.length; j += 1) {
      if (leaf.children[j].type === 'folder') {
        const info = {
          type: 'folder',
          label: leaf.children[j].label,
          inv_count: leaf.children[j].inv_count,
          include: leaf.children[j].include,
          action: leaf.children[j].action,
        };
        children.push(info);
      } else if (leaf.children[j].type === 'file') {
        const info = {
          type: 'file',
          label: leaf.children[j].label,
          inventories: leaf.children[j].inventories,
          include: leaf.children[j].include,
          action: leaf.children[j].action,
        };
        children.push(info);
      }
    }
    Object.assign(ret.children, children);
    return ret;
  }

  exclude_file(pathToExclude: string, recursive: boolean) {
    const a = getLeaf(this.logical_tree, pathToExclude);
    setUseFile(a, false, recursive);
  }

  include_file(pathToInclude: string, recursive: boolean) {
    const a = getLeaf(this.logical_tree, pathToInclude);
    setUseFile(a, true, recursive);
  }

  scanMode(filePath: string) {
    // eslint-disable-next-line prettier/prettier
    const skipExtentions = new Set ([".exe", ".zip", ".tar", ".tgz", ".gz", ".rar", ".jar", ".war", ".ear", ".class", ".pyc", ".o", ".a", ".so", ".obj", ".dll", ".lib", ".out", ".app", ".doc", ".docx", ".xls", ".xlsx", ".ppt" ]);
    const skipStartWith = ["{","[","<?xml","<html","<ac3d","<!doc"];
    const MIN_FILE_SIZE = 256;

    // Filter by extension
    const ext = path.extname(filePath);
    if (skipExtentions.has(ext)) {
      return 'MD5_SCAN';
    }

    // Filter by min size
    const fileSize = fs.statSync(filePath).size;
    if (fileSize < MIN_FILE_SIZE) {
      return 'MD5_SCAN';
    }

    // if start with pattern
    const file = fs.readFileSync(filePath, 'utf8');
    for (const skip of skipStartWith) {
      if (file.startsWith(skip)) {
        return 'MD5_SCAN';
      }
    }

    // if binary
    if (isBinaryFileSync(filePath)) {
      return 'MD5_SCAN';
    }

    return 'FULL_SCAN';
  }

  indexScan(scanRoot: string, jsonScan: any, bannedList: Filtering.BannedList) {
    let i = 0;
    if (jsonScan.type === 'file') {
      this.filesIndexed += 1;
      if (this.filesIndexed % 100 === 0)
        this.msgToUI.send(IpcEvents.SCANNER_UPDATE_STATUS, {
          stage: `indexing`,
          processed: this.filesIndexed,
        });
      if (bannedList.evaluate(scanRoot + jsonScan.value)) {
        jsonScan.action = 'scan';
        jsonScan.scanMode = this.scanMode(scanRoot + jsonScan.value);
      } else {
        jsonScan.action = 'filter';
      }
    } else if (jsonScan.type === 'folder') {
      if (bannedList.evaluate(scanRoot + jsonScan.value)) {
        jsonScan.action = 'scan';
      } else {
        jsonScan.action = 'filter';
      }

      for (i = 0; i < jsonScan.children.length; i += 1) this.indexScan(scanRoot, jsonScan.children[i], bannedList);
    }
  }
}

/* AUXILIARY FUNCTIONS */

function summarizeTree(root: any, tree: any, summary: any) {
  let j = 0;
  if (tree.type === 'file') {
    summary.total += 1;
    if (tree.action === 'filter') {
      summary.filter += 1;
      tree.className = 'filter-item';
    } else if (tree.include === true) {
      summary.include += 1;
      summary.files[`${root}${tree.value}`] = tree.scanMode;
    } else {
      tree.className = 'exclude-item';
    }

    return summary;
  }
  if (tree.type === 'folder') {
    if (tree.action === 'filter') {

      tree.className = 'filter-item';
    } else
    for (j = 0; j < tree.children.length; j += 1) {
      summary = summarizeTree(root, tree.children[j], summary);
    }
    return summary;
  }
}

function getLeaf(arbol: any, mypath: string): any {
  let res: string[];
  // eslint-disable-next-line prefer-const
  res = mypath.split('/');
  if (res[0] === '') res.shift();
  if (res[res.length - 1] === '') res.pop();

  if (arbol.label === res[0] && res.length === 1) {
    return arbol;
  }
  const i = 0;
  let j = 0;
  if (arbol.type === 'folder') {
    for (j = 0; j < arbol.children.length; j += 1) {
      if (arbol.children[j].type === 'folder' && arbol.children[j].label === res[1]) {
        const newpath = mypath.replace(`${res[0]}/`, '');
        return getLeaf(arbol.children[j], newpath);
      }
      if (arbol.children[j].type === 'file' && arbol.children[j].label === res[1]) {
        return arbol.children[j];
      }
    }
  }
}

function setUseFile(tree: any, action: boolean, recursive: boolean) {
  if (tree.type === 'file') tree.include = action;
  else {
    let j = 0;
    tree.include = action;
    if (recursive)
      for (j = 0; j < tree.children.length; j += 1) {
        setUseFile(tree.children[j], action, recursive);
      }
  }
}

function insertInventory(root: string, tree: any, mypath: string, inv: Inventory): any {
  let myPathFolders: string[];
  // eslint-disable-next-line prefer-const
  let arbol = tree;
  mypath = mypath.replace('//', '/');
  mypath = mypath.replace(root, '');
  myPathFolders = mypath.split('/');
  if (myPathFolders[0] === '') myPathFolders.shift();
  let i: number;
  i = 0;
  let childCount = 0;
  while (i < myPathFolders.length) {
    let j: number;
    if (!arbol.inventories.includes(inv.id)) arbol.inventories.push(inv.id);
    childCount = arbol.children.length;
    for (j = 0; j < arbol.children.length; j += 1) {
      if (arbol.children[j].label === myPathFolders[i]) {
        arbol = arbol.children[j];
        i += 1;
        break;
      }
    }
    if (j >= childCount) {
      console.log(`Can not insert inventory on ${mypath}`);
      return;
    }
  }

  arbol.inventories.push(inv.id);
}
function insertComponent(tree: any, mypath: string, comp: Component): any {
  let myPathFolders: string[];
  // eslint-disable-next-line prefer-const
  let arbol = tree;
  myPathFolders = mypath.split('/');
  if (myPathFolders[0] === '') myPathFolders.shift();
  let i: number;
  i = 0;
  let childCount;
  const component = { purl: comp.purl, version: comp.version };

  while (i < myPathFolders.length) {
    let j: number;
    if (!arbol.components.some((e) => e.purl === component.purl && e.version === component.version)) {
      arbol.components.push(component);
      arbol.className = 'match-info-result';
    }
    childCount = arbol.children.length;
    for (j = 0; j < childCount; j += 1) {
      if (arbol.children[j].label === myPathFolders[i]) {
        arbol = arbol.children[j];
        i += 1;
        break;
      }
    }
    if (j >= childCount) {
      console.log(`Can not insert component ${component.purl} on ${mypath}`);
      return;
    }
  }

  arbol.components.push(component);
  arbol.className = 'match-info-result';
}

function dirFirstFileAfter(a, b) {
  if (!a.isDirectory() && b.isDirectory()) return 1;
  if (a.isDirectory() && !b.isDirectory()) return -1;
  return 0;
}

function dirTree(root: string, filename: string) {
  // console.log(filename)
  const stats = fs.lstatSync(filename);
  let info;

  if (stats.isDirectory()) {
    info = {
      type: 'folder',
      className: 'no-match',
      value: filename.replace(root, ''),
      label: path.basename(filename),
      inventories: [],
      components: [],
      children: undefined,
      include: true,
      action: 'scan',
      showCheckbox: false,
    };

    info.children = fs
      .readdirSync(filename, { withFileTypes: true }) // Returns a list of files and folders
      .sort(dirFirstFileAfter)
      .filter((dirent) => !dirent.isSymbolicLink())
      .map((dirent) => dirent.name) // Converts Dirent objects to paths
      .map((child: string) => {
        // Apply the recursion function in the whole array
        return dirTree(root, `${filename}/${child}`);
      });
  } else {
    info = {
      type: 'file',
      className: 'no-match',
      inv_count: 0,
      value: filename.replace(root, ''),
      label: path.basename(filename),
      inventories: [],
      components: [],
      include: true,
      action: 'scan',
      showCheckbox: false,
    };
  }
  return info;
}