import { IpcEvents } from '../ipc-events';
import { Component, License,ComponentGroup } from './types';

const { ipcRenderer } = require('electron');

class ComponentService {
  public async get(args: Partial<Component>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET, args);
    return response;
  }

  public async getAll(args: Partial<Component>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET_ALL, args);
    return response;
  }

  public async create(component: Component): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_CREATE, component);
    return response;
  }

  public async delete(component: Partial<Component>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_DELETE, component);
    return response;
  }

  public async attachLicense(component: Partial<Component>, license: Partial<License>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_ATTACH_LICENSE, component, license);
    return response;
  }

  public async detachLicense(component: Component, license: License): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_DETACH_LICENSE, component, license);
    return response;
  }

  public async getFiles(component: Partial<Component>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GET_FILES, component);
    return response;
  }

  public async getAllComponentGroup(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GROUP_GET_ALL);
    return response;
  }

  public async getComponentGroup(component: Partial<ComponentGroup>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.COMPONENT_GROUP_GET, component);
    return response;
  }
}

export const componentService = new ComponentService();
