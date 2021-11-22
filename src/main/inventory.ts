import { ipcMain } from 'electron';
import { refresh } from 'electron-debug';
import { Inventory } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { logicInventoryService } from './services/LogicInventoryService';
import { logicResultService } from './services/LogicResultService';
import { NodeStatus } from './workspace/Tree/Tree/Node';
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
    console.log(p.getTree().getNode('/Makefile'));
    inv = await p.scans_db.inventories.create(arg);
    arg.id = inv.id;

    logicResultService
      .getResultsByids(arg.files)
      .then((filesToUpdate) => {
        const paths = Object.keys(filesToUpdate);
        console.log('LLAMANDO DESDE EL INVENTORY SERVICES. PATH A ESCANEAR: ', paths);

        for (const filePath of paths) {
          p.getTree().getRootFolder().setStatus(filePath, NodeStatus.IDENTIFIED);
        }

        p.updateTree();
        console.log(p.getTree().getNode('/Makefile'));
        return true;
      })
      .catch((e) => {
        console.log(e);
        throw e;
      });

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
    //const result = await project.scans_db.results.getNotOriginal(inv.files);

    logicResultService
      .getResultsByids(inv.files)
      .then((filesToUpdate) => {
        const paths = Object.keys(filesToUpdate);
        project.getTree().restoreStatus(paths as Array<string>);
        project.updateTree();
        return true;
      })
      .catch((e) => {
        console.log(e);
        throw e;
      });

    const success: boolean = await logicInventoryService.detach(inv);

    return { status: 'ok', message: 'File detached to inventory successfully', success };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_DELETE, async (event, arg: Partial<Inventory>) => {
  try {
    const p = workspace.getOpenedProjects()[0];

    const files = p.scans_db.inventories.getInventoryFiles(arg).then((filesToUpdate) => {
      console.log(filesToUpdate);
      const paths = [];

        filesToUpdate.forEach((element) => {
        paths.push (element.path);
      });

      console.log(paths);

      p.getTree().restoreStatus(paths as Array<string>);
      p.updateTree();
      return paths;
      })
      .catch((e) => {
        throw e;
      });

    const success = await p.scans_db.inventories.delete(arg);

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
