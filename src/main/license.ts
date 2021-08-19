import { ipcMain } from 'electron';
import { License } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { defaultProject } from './workspace/ProjectTree';


ipcMain.handle(IpcEvents.LICENSE_GET_ALL, async (event) => {
  let license: any;
  try {
    license = await defaultProject.scans_db.licenses.getAll();
    return { status: 'ok', message: 'Licenses successfully retrieved', data: license };
  } catch (e) {
    console.log('Catch an error: ', e);   
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.LICENSE_GET, async (_event, id: License) => {
  try {
    const license = await defaultProject.scans_db.licenses.get(id);
    return { status: 'ok', message: 'Licenses successfully retrieved', data: license };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
 
});

ipcMain.handle(IpcEvents.LICENSE_CREATE, async (_event, newLicense: License) => {
  let license: License;
  try {
    license = await defaultProject.scans_db.licenses.create(newLicense);
    return { status: 'ok', message: 'License successfully created', data: license };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});
