import { IpcEvents } from '../ipc-events';
import {
  Component,
  ComponentGroup,
  NewComponentDTO,
  IWorkbenchFilter,
  IWorkbenchFilterParams,
} from '../types';
import { BaseService } from './base.service';
import { ISearchgRPCComponent } from '../../main/task/ComponentCatalog/IComponent/ISearchgRPCComponent';
import { IComponentResult } from '../../main/task/ComponentCatalog/IComponent/IComponentResult';

const { ipcRenderer } = require('electron');

class ComponentService extends BaseService {
  public async create(component: Partial<NewComponentDTO>): Promise<Component> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_CREATE, component);
    return this.response(response);
  }

  public async delete(component: Partial<Component>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_DELETE, component);
    return response;
  }


  public async getFiles(component: Partial<Component>, params: IWorkbenchFilter = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET_FILES, component, params);
    return this.response(response);
  }

  public async getAll(params?: IWorkbenchFilterParams): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET_ALL, params);
    return this.response(response);
  }

  public async get(component: Partial<ComponentGroup>, params?: IWorkbenchFilterParams): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET, component, params);
    return this.response(response);
  }

  public async getGlobalComponents(params: ISearchgRPCComponent): Promise<Array<IComponentResult>> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET_GLOBAL_COMPONENTS,params);
    return this.response(response);
  }


}

export const componentService = new ComponentService();
