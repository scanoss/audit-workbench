import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { workspace } from './workspace/Workspace';
import { Response } from './Response';
import { INewProject, IProject, License } from '../api/types';
import { ProjectFilterPath } from './workspace/filters/ProjectFilterPath';
import { Project } from './workspace/Project';
import { log } from 'electron-log';
import { fileURLToPath } from 'url';

const AdmZip = require('adm-zip');

ipcMain.handle(IpcEvents.WORKSPACE_PROJECT_LIST, async (event) => {
  try {
    const projects = await workspace.getProjectsDtos();
    return Response.ok({
      message: 'Projects list retrieved succesfully',
      data: projects,
    });
  } catch (error: any) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.WORKSPACE_DELETE_PROJECT, async (event, projectPath: string) => {
  try {
    await workspace.removeProjectFilter(new ProjectFilterPath(projectPath));
    return Response.ok();
  } catch (error: any) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

// This service creates a new project and launch automatically the scanner.
// In future versions, the scanner will be launched by the user.
ipcMain.handle(IpcEvents.WORKSPACE_CREATE_PROJECT, async (event, project: INewProject) => {
  try {
    const p = await workspace.createProject(project);
    p.setMailbox(event.sender);
    p.startScanner();
    return Response.ok();
  } catch (error: any) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.UTILS_GET_PROJECT_DTO, async (event) => {
  try {
    const path: IProject = workspace.getOpenedProjects()[0].getDto();
    return Response.ok({ message: 'Project path succesfully retrieved', data: path });
  } catch (e: any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.GET_LICENSES, async (_event) => {
  try {
    const licenses: Array<License> = workspace.getLicenses();
    return Response.ok({ message: 'Project path succesfully retrieved', data: licenses });
  } catch (e: any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.WORKSPACE_IMPORT_PROJECT, async (_event, zippedProjectPath: string) => {
  try {
    const projectName = Project.isValidProjectZip(zippedProjectPath);
    if (workspace.existProject(projectName)) throw new Error('Project already exists');
    await Project.unzipProject(zippedProjectPath, `${workspace.getMyPath()}`);
    const p = await Project.readFromPath(`${workspace.getMyPath()}/${projectName}`); // file node library bar
    workspace.addNewProject(p);
    const iProject = p.getDto();
    return Response.ok({ message: 'Project imported succesfully', data: iProject });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.WORKSPACE_EXPORT_PROJECT, async (event, pathToSave: string, projectPath: string) => {
  try {
    const p = workspace.getProject(new ProjectFilterPath(projectPath));
    p.export(pathToSave);

    return Response.ok({ message: 'Project path succesfully retrieved', data: licenses });
  } catch (e: any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});
