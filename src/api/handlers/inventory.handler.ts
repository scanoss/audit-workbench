import { ipcMain } from 'electron';
import log from 'electron-log';
import { IBatchInventory, Inventory } from '../types';
import { IpcChannels } from '../ipc-channels';
import { Batch } from '../../main/batch/Batch';
import { BatchFactory } from '../../main/batch/BatchFactory';
import { inventoryService } from '../../main/services/InventoryService';
import { treeService } from '../../main/services/TreeService';
import { NodeStatus } from '../../main/workspace/tree/Node';
import { workspace } from '../../main/workspace/Workspace';
import { modelProvider } from '../../main/services/ModelProvider';

ipcMain.handle(IpcChannels.INVENTORY_GET_ALL, async (_event, invget: Partial<Inventory>) => {
  let inv: any;
  try {
    inv = await inventoryService.getAll(invget);
    return { status: 'ok', message: inv, data: inv };
  } catch (e) {
    log.error('[INVENTORY GET ALL]: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcChannels.INVENTORY_GET, async (_event, inv: Partial<Inventory>) => {
  try {
    const inventory: Inventory = await inventoryService.get(inv);
    return { status: 'ok', message: 'Inventory retrieve successfully', data: inventory };
  } catch (e) {
    log.error('[INVENTORY GET]: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcChannels.INVENTORY_CREATE, async (event, arg: Inventory) => {
  try {
    const inv = await inventoryService.create(arg);
    treeService.updateTree(arg.files, NodeStatus.IDENTIFIED);
    return { status: 'ok', message: 'Inventory created', data: inv };
  } catch (e) {
    log.error('[INVENTORY CREATE]: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcChannels.INVENTORY_ATTACH_FILE, async (_event, arg: Partial<Inventory>) => {
  try {
    const success = await inventoryService.attach(arg);
    return { status: 'ok', message: 'File attached to inventory successfully', success };
  } catch (e) {
    log.error('[INVENTORY ATTACH FILE]: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcChannels.INVENTORY_DETACH_FILE, async (_event, inv: Partial<Inventory>) => {
  try {
    const success: boolean = await inventoryService.detach(inv);
    treeService.retoreStatus(inv.files);
    return { status: 'ok', message: 'File detached to inventory successfully', success };
  } catch (e) {
    log.error('[INVENTORY DETACH FILE]: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcChannels.INVENTORY_DELETE, async (_event, arg: Partial<Inventory>) => {
  try {
    const inventoryFiles= await inventoryService.get(arg);
    const files = inventoryFiles.files.reduce((acc, file) => {
      acc.push(file.id);
      return acc;
    }, []);
    treeService.updateTree(files, NodeStatus.PENDING);
    const success = await modelProvider.model.inventory.delete(arg);
    if (success) return { status: 'ok', message: 'Inventory deleted successfully', success };
    return { status: 'error', message: 'Inventory was not deleted successfully', success };
  } catch (e) {
    log.error('[INVENTORY DELETE]: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcChannels.INVENTORY_FROM_COMPONENT, async (_event) => {
  try {
    const data = await modelProvider.model.inventory.getFromComponent();
    if (data) return { status: 'ok', message: 'Inventories from component', data };
    return { status: 'error', message: 'Inventory from component was not successfully retrieve', data };
  } catch (e) {
    log.error('[INVENTORY FROM COMPONENT]: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcChannels.INVENTORY_BATCH, async (_event, params: IBatchInventory) => {
  try {
    const factory = new BatchFactory();
    const bachAction: Batch = factory.create(params);
    const success = await bachAction.execute();
    if (success) return { status: 'ok', message: 'Inventory batch successfully', success };
    return { status: 'fail', message: 'Inventory batch error' };
  } catch (e) {
    log.error('[INVENTORY BATCH]: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcChannels.INVENTORY_ACCEPT_PRE_LOAD, async (_event, data: Partial<IBatchInventory>) => {
  try {
    const filter = workspace.getOpenedProjects()[0].getGlobalFilter();
    const inventories: Array<Partial<Inventory>> = await inventoryService.preLoadInventoriesAcceptAll(data, filter);
    return { status: 'ok', message: 'Inventory folder successfully', data: inventories };
  } catch (e) {
    log.error('[INVENTORY ACCEPT PRELOAD]: ',e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcChannels.INVENTORY_UPDATE, async (_event, inventory: Inventory) => {
  try {
    const inv = await inventoryService.update(inventory);
    return { status: 'ok', message: 'Inventory succesfully updated', data: inv };
  } catch (e) {
    log.error('[INVENTORY UPDATE]: ', e);
    return { status: 'fail' };
  }
});
