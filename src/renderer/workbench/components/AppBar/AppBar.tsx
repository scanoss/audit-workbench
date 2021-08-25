import {
  Toolbar,
  IconButton,
  Typography,
  Button,
  LinearProgress,
  Divider,
  Tooltip,
  Fade,
  Menu,
  MenuItem,
} from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import InsertChartOutlinedTwoToneIcon from '@material-ui/icons/InsertChartOutlinedTwoTone';
import GavelIcon from '@material-ui/icons/Gavel';
// eslint-disable-next-line import/no-named-default
import { default as MaterialAppBar } from '@material-ui/core/AppBar';
import { NavLink, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import GetAppIcon from '@material-ui/icons/GetApp';
import { reset } from '../../actions';
import { WorkbenchContext, IWorkbenchContext } from '../../store';
import { ExportFormat } from '../../../../api/export-service';
import { projectService } from '../../../../api/project-service';
import { dialogController } from '../../../dialog-controller';

const Navigation = () => {
  const history = useHistory();

  return (
    <section id="Navigation">
      <IconButton onClick={() => history.goBack()}>
        <ArrowBackIcon />
      </IconButton>
      <IconButton onClick={() => history.goForward()}>
        <ArrowForwardIcon />
      </IconButton>
    </section>
  );
};

const AppMenu = () => {
  const history = useHistory();

  return (
    <section id="AppMenu">
      <NavLink to="/workbench" exact activeClassName="active">
        <Tooltip title="Detected components">
          <Button color="inherit">
            <GavelIcon />
          </Button>
        </Tooltip>
      </NavLink>
      <NavLink to="/workbench/recognized" exact activeClassName="active">
        <Tooltip title="Identified components">
          <Button color="inherit">
            <CheckCircleOutlineOutlinedIcon />
          </Button>
        </Tooltip>
      </NavLink>
      <NavLink to="/report" activeClassName="active">
        <Tooltip title="Identified components">
          <Button color="inherit">
            <InsertChartOutlinedTwoToneIcon />
          </Button>
        </Tooltip>
      </NavLink>
    </section>
  );
};

const AppProgress = () => {
  return (
    <section id="AppProgress">
      <p>50%</p>
      <LinearProgress className="progress" variant="determinate" value={50} />
    </section>
  );
};

const AppTitle = ({ title }) => {
  const curLoc = useLocation();
  const [section, setSection] = useState('');

  const routes = [
    { path: '/workbench', title: 'Detected components' },
    { path: '/workbench/editor', title: 'Matches' },

    { path: '/report', title: 'Reports' },
    { path: '/workbench/recognized', title: 'Identified components' },
  ];

  useEffect(() => {
    const curTitle = routes.find((item) => item.path === curLoc.pathname);
    if (curTitle && curTitle.title) {
      setSection(curTitle.title);
    }
  }, [curLoc]);

  return (
    <section id="AppTitle">
      <span>{title}</span>
      <ChevronRightOutlinedIcon fontSize="small" />
      <Typography variant="h6" className="title-main">
        {section}
      </Typography>
    </section>
  );
};

const Export = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const SPDX = 'spdx';
  const CSV = 'csv';
  const RAW = 'json';
  const WFP = 'wfp';

  const onExportClicked = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onCsvClickedExport = async () => {
    await exportFile({ extension: CSV, export: CSV });
    handleClose();
  };

  const onSpdxClickedExport = async () => {
    await exportFile({ extension: SPDX, export: SPDX });
    handleClose();
  };

  const onWfpClickedExport = async () => {
    await exportFile({ extension: 'wfp', export: WFP });
    handleClose();
  };

  const onRawClickedExport = async () => {
    await exportFile({ extension: 'json', export: RAW });
    handleClose();
  };

  const exportFile = async (data) => {
    const defpath = await projectService.workspacePath();
    const projectName = await projectService.getProjectName();
    const path = dialogController.showSaveDialog({
      defaultPath: `${defpath.data}/${projectName.data}/${projectName.data}.${data.extension}`,
    });
    if (path && path !== undefined) {
      if (data.export === SPDX) await ExportFormat.spdx(path);
      else if (data.export === CSV) await ExportFormat.csv(path);
      else if (data.export === RAW) await ExportFormat.raw(path);
      else if (data.export === WFP) await ExportFormat.wfp(path);
    }
  };
  return (
    <div>
      <Button startIcon={<GetAppIcon />} variant="contained" color="primary" onClick={onExportClicked}>
        Export
      </Button>
      <Menu id="fade-menu" anchorEl={anchorEl} keepMounted open={open} onClose={handleClose} TransitionComponent={Fade}>
        <MenuItem onClick={onSpdxClickedExport}>SPDX</MenuItem>
        <MenuItem onClick={onCsvClickedExport}>CSV</MenuItem>
        <MenuItem onClick={onWfpClickedExport}>WFP</MenuItem>
        <MenuItem onClick={onRawClickedExport}>RAW</MenuItem>
      </Menu>
    </div>
  );
};

const AppBar = ({ exp }) => {
  const history = useHistory();
  const { state, dispatch, loadScan } = useContext(WorkbenchContext) as IWorkbenchContext;

  const onBackPressed = () => {
    dispatch(reset());
    history.push('/');
  };

  return (
    <>
      <MaterialAppBar id="AppBar" elevation={1}>
        <Toolbar>
          <div className="slot start">
            <IconButton onClick={onBackPressed} edge="start" color="inherit" aria-label="menu">
              <HomeOutlinedIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem />
            <Navigation />
            <Divider orientation="vertical" flexItem />
            <AppMenu />
          </div>

          <AppTitle title={state.name} />

          <div className="slot end">{!exp ? <AppProgress /> : <Export />}</div>
        </Toolbar>
      </MaterialAppBar>
    </>
  );
};

AppBar.defaultProps = { exp: false };

export default AppBar;
