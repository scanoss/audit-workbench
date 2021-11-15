import { ipcMain } from 'electron';
import { refresh } from 'electron-debug';
import { Inventory } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { logicInventoryService } from './services/LogicInventoryService';
import { logicResultService } from './services/LogicResultService';
import { workspace } from './workspace/Workspace';





ipcMain.handle(IpcEvents.INVENTORY_GET_ALL, async (event, invget: Partial<Inventory>) => {
  let inv: any;
  try {
    inv = await workspace.getOpenedProjects()[0].scans_db.inventories.getAll(invget);
    return { status: 'ok', message: inv, data: inv };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_GET, async (event, inv: Partial<Inventory>) => {
  try {
    const inventory: Inventory = await logicInventoryService.get(inv);
    return { status: 'ok', message: 'Inventory retrieve successfully', data: inventory };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_CREATE, async (event, arg: Inventory) => {
  let inv: any;
  try {
    const p = await workspace.getOpenedProjects()[0];
    inv = await p.scans_db.inventories.create(arg);
    arg.id = inv.id;

    const path = await p.scans_db.results.getSummaryByids(arg.files);    
   const node = p.getNode(path[0].path);
   console.log("NODE",node);

  
    logicResultService.getResultsByids(arg.files).then((data) => p.refreshTree(data));
    
    return { status: 'ok', message: 'Inventory created', data: inv };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_ATTACH_FILE, async (event, arg: Partial<Inventory>) => {
  try {
    const p = workspace.getOpenedProjects()[0]; 
    const success = await p.scans_db.inventories.attachFileInventory(arg);
    return { status: 'ok', message: 'File attached to inventory successfully', success };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_DETACH_FILE, async (event, inv: Partial<Inventory>) => {
  try {
    const project = workspace.getOpenedProjects()[0];
    const result = await project.scans_db.results.getNotOriginal(inv.files);
    if (result !== undefined) {
      const node = project.getNodeFromPath(result.file_path);
      if (result.source === 'filtered') {
        node.action = 'filter';
        node.className = 'filter-item';
      } else {
        node.action = 'scan';
        node.className = 'no-match';
      }
      project.save();
    }

    const success: boolean = await logicInventoryService.detach(inv);
    return { status: 'ok', message: 'File detached to inventory successfully', success };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_DELETE, async (event, arg: Partial<Inventory>) => {
  try {
    const success = await workspace.getOpenedProjects()[0].scans_db.inventories.delete(arg);
    if (success) return { status: 'ok', message: 'Inventory deleted successfully', success };
    return { status: 'error', message: 'Inventory was not deleted successfully', success };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_FROM_COMPONENT, async (event) => {
  try {
    const data = await workspace.getOpenedProjects()[0].scans_db.inventories.getFromComponent();
    if (data) return { status: 'ok', message: 'Inventories from component', data };
    return { status: 'error', message: 'Inventory from component was not successfully retrieve', data };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});
