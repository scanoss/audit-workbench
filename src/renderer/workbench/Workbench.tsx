import { CircularProgress } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { Link, Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import SplitPane from 'react-split-pane';

import { FileTree } from './components/FileTree/FileTree';
import { dialogController } from '../dialog-controller';

import { WorkbenchContext, IWorkbenchContext } from './store';
import { AppContext, IAppContext } from '../context/AppProvider';
import AppBar from './components/AppBar/AppBar';
import Detected from './detected/Detected';
import Identified from './identified/Identified';
import Report from '../report/Report';

const Workbench = () => {
  const history = useHistory();
  const { path, url } = useRouteMatch();

  const { state, dispatch, loadScan } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { scanPath } = useContext(AppContext) as IAppContext;

  const { loaded } = state;

  const onInit = async () => {
    const result = scanPath ? await loadScan(scanPath) : false;
    if (!result) {
      dialogController.showError('Error', 'Cannot read scan.');
    }
  };

  const onDestroy = () => {};

  useEffect(() => {
    onInit();
    return onDestroy;
  }, []);

  return (
    <div>
      <AppBar />
      <SplitPane split="vertical" minSize={300} defaultSize={300}>
        <aside className="panel explorer">
          {/* <Box boxShadow={1}>

          </Box> */}
          <div className="file-tree-container">
            <FileTree />
          </div>
        </aside>
        <main id="Workbench" className="match-info">
          {loaded ? (
            <Switch>
              <Route path={`${path}/identified`} component={Identified} />
              <Route path={`${path}/detected`} component={Detected} />
              <Route path={`${path}/report`} component={Report} />

              <Redirect from={path} to={`${path}/detected`} />
            </Switch>
          ) : (
            <div className="loader">
              <CircularProgress size={24} />
            </div>
          )}
        </main>
      </SplitPane>
    </div>
  );
};

export default Workbench;
