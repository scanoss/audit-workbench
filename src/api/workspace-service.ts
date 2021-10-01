import { IpcEvents } from '../ipc-events';
import { Project } from '../main/workspace/Project';
import { BaseService } from './base-service';
import { IWorkspaceCfg } from './types';


const { ipcRenderer } = require('electron');

class WorkspaceService extends BaseService {
  public async getAllProjects(): Promise<Project[]> {
    const response = await ipcRenderer.invoke(IpcEvents.WORKSPACE_PROJECT_LIST);
    return this.response(response);
  }

  public async deleteProject(args): Promise<void> {
    const response = await ipcRenderer.invoke(IpcEvents.WORKSPACE_DELETE_PROJECT, args);
    return this.response(response);
  }


  public async getProjectDTO(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.UTILS_GET_PROJECT_DTO);
    return this.response(response);
  }

  public async setWSConfig(conf: IWorkspaceCfg): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.WORKSPACE_SET_WS_CONFIG, conf);
    return this.response(response);
  }

  public async getWSConfig(): Promise<IWorkspaceCfg> {
    const response = await ipcRenderer.invoke(IpcEvents.WORKSPACE_GET_WS_CONFIG);
    return this.response(response);
  }


}

export const workspaceService = new WorkspaceService();
