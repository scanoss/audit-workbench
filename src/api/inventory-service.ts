import { IpcEvents } from '../ipc-events';
import { Inventory } from './types';

const { ipcRenderer } = require('electron');

class InventoryService {
  public async getAll(args: Partial<Inventory>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_GET_ALL, args);
    return response;
  }

  public async get(args: Partial<Inventory>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_GET, args);
    return response;
  }

  public async create(inventory: Inventory): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_CREATE, inventory);
    return response;
  }

  public async attach(inventory: Partial<Inventory>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_ATTACH_FILE, inventory);
    return response;
  }

  public async detach(inventory: Partial<Inventory>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_DETACH_FILE, inventory);
    return response;
  }

  public async delete(inventory: Partial<Inventory>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_DELETE, inventory);
    return response;
  }

  public async getFromComponent(inventory: Partial<Inventory>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents. INVENTORY_FROM_COMPONENT, inventory);
    return response;
  }

 
}

export const inventoryService = new InventoryService();
