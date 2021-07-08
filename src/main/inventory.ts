import { ipcMain } from 'electron';
import { Inventory } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultWorkspace } from './workspace/workspace';

ipcMain.handle(IpcEvents.INVENTORY_GET, async (event, invget: Inventory) => {
  let inv: any;
  try {
    inv = await defaultWorkspace.scans_db.inventories.get(invget);
    console.log(inv.id);
    return { status: 'ok', message: inv };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'false' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_CREATE, async (event, arg: Inventory) => {
  let created: any;
  try {
    console.log(defaultWorkspace);
    created = await defaultWorkspace.scans_db.inventories.create(arg);
    arg.id = created;
    // defaultWorkspace.attachInventory(arg);
    return { status: 'ok', message: created };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'false' };
  }
});

/**
 * INVENTORY_CREATE = 'INVENTORY_CREATE',
  INVENTORY_GET = 'INVENTORY_GET',
  INVENTORY_DELETE = 'INVENTORY_DELETE',
  INVENTORY_UPDATE = 'INVENTORY_UPDATE',
  INVENTORY_ATTACH_FILE = 'INVENTORY_ATTACH_FILE',
  INVENTORY_DETACH_FILE = 'INVENTORY_DETACH_FILE',
 */
