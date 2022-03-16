import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';
import { logicDependencyService } from './services/LogicDependencyService';

ipcMain.handle(IpcEvents.DEPENDENCY_GET_ALL, async (event, params: any) => {
  try {
    const dependencies = await logicDependencyService.getAll(params);
    return Response.ok({ message: 'Component created successfully', data: dependencies });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.DEPENDENCY_ACCEPT, async (event, params: any) => {
  try {
    const dependency = await logicDependencyService.accept(params);
    return Response.ok({ message: 'Component created successfully', data: dependency });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});


ipcMain.handle(IpcEvents.DEPENDENCY_REJECT, async (event, dependencyId: number) => {
  try {
    const dependency = await logicDependencyService.reject(dependencyId);
    return Response.ok({ message: 'Component created successfully', data: dependency });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});