import { ipcRenderer } from 'electron';
import { IDependencyResponse } from 'scanoss';
import { projectService } from '../api/project-service';
import { componentService } from '../api/component-service';
import { ComponentGroup, IWorkbenchFilter, ComponentSource } from '../api/types';
import { sortComponents, transform } from '../utils/scan-util';
import { IpcEvents } from '../ipc-events';
import { API_URL } from '../Config';

const pathUtil = require('path');

export interface ScanResult {
  name: string;
  imported: boolean;
  scanRoot: string;
  fileTree: any;
  dependencies: IDependencyResponse;
}

class WorkbenchController {
  /**
   * Open scan file result
   *
   * @param {string} path
   * @returns {Promise<ScanResult>}
   * @memberof WorkbenchController
   */
  public async loadScan(path: string): Promise<ScanResult> {
    const { data } = await projectService.load(path);
    return this.generateScanResult(data);
  }

  /**
   * Get file content from a local file
   *
   * @param {string} path
   * @returns {string}
   * @memberof WorkbenchController
   */
  public async fetchLocalFile(path: string): Promise<string> {
    const { data } = await ipcRenderer.invoke(IpcEvents.FILE_GET_CONTENT, path);
    return data.content;
  }

  /**
   * Get file content from a remote file
   *
   * @param {string} hash
   * @returns {string}
   * @memberof WorkbenchController
   */
  public async fetchRemoteFile(hash: string): Promise<string> {
    // TODO: move api url to API Config
    const response = await fetch(`${API_URL}/file_contents/${hash}`);
    if (!response.ok) throw new Error('File not found');

    return response.text();
  }

  public async getComponents(params: IWorkbenchFilter = null): Promise<ComponentGroup[]> {
    const { data } = await componentService.getAllComponentGroup({ ...params, source: ComponentSource.ENGINE });
    sortComponents(data);
    return data;
  }

  public async getComponent(purl: string, params: IWorkbenchFilter = null): Promise<ComponentGroup> {
    const { data } = await componentService.getComponentGroup({ purl }, { ...params, source: ComponentSource.ENGINE });
    return data;
  }

  public async getFileTree() {
    const tree = await projectService.getTree();
    return tree;
  }

  private async generateScanResult(data): Promise<ScanResult> {
    const tree = data.logical_tree;
    const work = data.work_root;
    const { dependencies } = data;
    const imported = data.source === 'IMPORTED';

    // TODO: get from scan result
    const name = work.split(pathUtil.sep)[work.split(pathUtil.sep).length - 1];

    return {
      name,
      imported,
      scanRoot: data.scan_root,
      fileTree: tree,
      dependencies,
    };
  }
}

export const workbenchController = new WorkbenchController();
