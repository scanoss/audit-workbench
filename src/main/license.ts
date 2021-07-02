import { ipcMain } from 'electron';
import { License } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultWorkspace } from './workspace/workspace';

ipcMain.handle(IpcEvents.LICENSE_GET, async (event, licToGet: License) => {
  let license: any;
  try {
    license = await defaultWorkspace.scans_db.getLicenses(licToGet);
  } catch (e) {
    console.log('Catch an error: ', e);
  }
  return { status: 'ok', message: license };
});

ipcMain.handle(IpcEvents.LICENSE_CREATE, async (event, arg: License) => {
  let created: any;
  try {
    created = await defaultWorkspace.scans_db.createInventory(arg);
    // defaultWorkspace.onAddInventory(newInventory);
  } catch (e) {
    console.log('Catch an error: ', e);
  }
  console.log('License was created info de inventario es ');
  console.log(arg);
  return { status: 'ok', message: created };
});
