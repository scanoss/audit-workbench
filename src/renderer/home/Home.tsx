import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { LinearProgress } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import logo from '../../../assets/logos/scanoss_white.png';
import * as controller from './HomeController';
import { dialogController } from '../dialog-controller';
import { AppContext } from '../context/AppProvider';
import { IpcEvents } from '../../ipc-events';


ipcRenderer.on(IpcEvents.SCANNER_UPDATE_STATUS, (event, args) => {
  console.log(`Incoming update: ${JSON.stringify(args)}`);
});

ipcRenderer.on(IpcEvents.SCANNER_ERROR_STATUS, (event, args) => {
  console.log(`Scanner error: ${args}`);
});

const Home = () => {
  const history = useHistory();

  const { scanPath, setScanPath } = useContext<any>(AppContext);

  const [progress, setProgress] = useState<number>(0);
  const [path, setPath] = useState<string | null>(null);

  const showScan = (resultPath) => {
    setScanPath(resultPath);
    setPath(null);
    history.push('/workbench');
  };

  const showError = () => {
    dialogController.showError('Error', 'Scanner failed');
  };

  const onOpenFolderPressed = () => {
    const projectPath = dialogController.showOpenDialog({
      properties: ['openDirectory'],
    });
    setPath(projectPath);
    controller.scan(projectPath);

    // listen finish scan
    ipcRenderer.on(IpcEvents.SCANNER_FINISH_SCAN, (event, args) => {
      if (args.success) {
        showScan(args.resultsPath);
      } else {
        showError();
      }
    });
  };

  const onOpenProjectPressed = async () => {
    const projectPath = dialogController.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (!projectPath) return;

    showScan(projectPath);
  };

  const onOpenFilePressed = () => {
    const projectPath = dialogController.showOpenDialog({
      properties: ['openFile'],
    });
    setPath(projectPath);
    showScan(projectPath);
  };

  return (
    <main className="Home">
      <div className="logo">
        <img width="300px" alt="icon" src={logo} />
      </div>
      <div>
        <button className="bnt-primary" type="button" onClick={() => onOpenFolderPressed()} disabled={!!path}>
          SCAN PROJECT
        </button>

        <button className="bnt-primary" type="button" onClick={() => onOpenProjectPressed()} disabled={!!path}>
          LOAD PROJECT
        </button>
      </div>
      <div className="progressbar">{path ? <LinearProgress /> : null}</div>
    </main>
  );
};

export default Home;
