import React, { useContext, useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  IconButton,
  InputBase,
  makeStyles,
  Paper,
  Tooltip,
  Select,
  MenuItem,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SearchIcon from '@material-ui/icons/Search';
import { useHistory } from 'react-router-dom';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { appendFile } from 'original-fs';
import { AppContext, IAppContext } from '../../../../context/AppProvider';
import { DialogResponse, DIALOG_ACTIONS } from '../../../../context/types';
import { INewProject, IWorkspaceCfg } from '../../../../../api/types';
import { userSettingService } from '../../../../../api/userSetting-service';
import { licenseService } from '../../../../../api/license-service';
import { workspaceService } from '../../../../../api/workspace-service';

const pathUtil = require('path');

const filter = createFilterOptions();

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '600px',
    },
  },
  search: {
    padding: '8px 15px',
    outline: 'none',
  },
  new: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: theme.palette.primary.light,
  },
  option: {
    display: 'flex',
    flexDirection: 'column',
    '& span.middle': {
      fontSize: '0.8rem',
      color: '#6c6c6e',
    },
  },
}));

const ProjectSettings = () => {
  const classes = useStyles();
  const history = useHistory();

  const { scanPath, setScanPath, setSettingsNewProject } = useContext<IAppContext>(AppContext);
  const [licenses, setLicenses] = useState(null);
  const [apis, setApis] = useState([]);
  const [sbomLedgerToken, setSbomLedgerToken] = useState(null);

  const [apiSelected, setApiSelected] = useState({
    URL: null,
    API_KEY: null,
    DESCRIPTION: '',
  });

  const [projects, setProjects] = useState<any[] | null>([]);
  const [projectSettings, setProjectSettings] = useState<INewProject>({
    name: '',
    scan_root: '',
    default_license: '',
    api_key: null,
    api: null,
    token: null,
  });

  const [projectValidName, setprojectValidName] = useState(false);
  const [projectNameExists, setprojectNameExists] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const data = await workspaceService.getLicenses();
    setLicenses(data);

    const apiUrlKey = await userSettingService.get();
    setApis(apiUrlKey.APIS);

    const projects = await workspaceService.getAllProjects();
    setProjects(projects);

    const { path } = scanPath;

    const projectName = path.split(pathUtil.sep)[path.split(pathUtil.sep).length - 1];

    setProjectSettings({
      ...projectSettings,
      scan_root: path,
      name: projectName,
    });
  };

  useEffect(() => {
    const found = projects.find((project) => project.name.trim().toLowerCase() === projectSettings.name.trim().toLowerCase());

    // eslint-disable-next-line no-control-regex
    const re = /^[^\s^\x00-\x1f\\?*:"";<>|\/.][^\x00-\x1f\\?*:"";<>|\/]*[^\s^\x00-\x1f\\?*:"";<>|\/.]+$/;

    if (found) {
      setprojectNameExists(true);
    } else {
      setprojectNameExists(false);
    }

    if (projectSettings.name.trim() !== '' && re.test(projectSettings.name)) {
      setprojectValidName(true);
    } else {
      setprojectValidName(false);
    }
  }, [projectSettings.name, projects]);

  const submit = async () => {
    setScanPath({ ...scanPath, projectName: projectSettings.name });
    setSettingsNewProject(projectSettings);
    history.push('/workspace/new/scan');
  };

  const handleClose = (e) => {
    e.preventDefault();
    submit();
  };

  return (
    <>
      <section id="ProjectSettings" className="app-page">
        <header className="app-header">
          <div>
            <h4 className="header-subtitle back">
              <IconButton onClick={() => history.goBack()} component="span">
                <ArrowBackIcon />
              </IconButton>
              Project Settings
            </h4>
            <h1 className="mt-0 mb-0">{scanPath.path}</h1>
          </div>
        </header>
        <div className="app-content">
          <form onSubmit={(e) => handleClose(e)}>
            <div className="project-form-container mt-4">
              <div className="project-license-container">
                <div className="input-container">
                  <label className="input-label">Project Name</label>
                  <span className="error-message">
                    {projectNameExists || !projectValidName  ? 'The project name is invalid' : ''}
                  </span>
                  <Paper
                    className={`input-text-container project-name-container ${
                      projectNameExists || !projectValidName ? 'error' : ''
                    }`}
                  >
                    <InputBase
                      className="project-name-input"
                      name="aa"
                      fullWidth
                      value={projectSettings.name}
                      onChange={(e) =>
                        setProjectSettings({
                          ...projectSettings,
                          name: e.target.value,
                        })
                      }
                    />
                  </Paper>
                </div>
                <div className="input-container input-container-license ">
                  <div className="input-label-add-container">
                    <label className="input-label">
                      License <span className="optional">- Optional</span>
                    </label>
                  </div>
                  <Paper className="input-text-container license-input-container">
                    <SearchIcon className="icon" />
                    <Autocomplete
                      onChange={(e, value) =>
                        setProjectSettings({
                          ...projectSettings,
                          default_license: value?.spdxid,
                        })
                      }
                      fullWidth
                      className={classes.search}
                      placeholder="URL"
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                      options={licenses}
                      getOptionLabel={(option: any) => option.name || ''}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            disableUnderline: true,
                          }}
                        />
                      )}
                    />
                  </Paper>
                </div>
              </div>
              <div className="api-conections-container">
                <div className="api-subcontainer">
                  <div className="api-conections-label-container mb-3">
                    <label className="input-label">API Connections</label>
                  </div>
                  <div className="label-input-container">
                    <div className="label-icon">
                      <label className='input-label'>Knowledgebase API</label>
                    </div>
                    <Paper className="input-text-container">
                      <Select
                        onChange={(e: any) => {
                          setProjectSettings({
                            ...projectSettings,
                            api: e.target?.value.URL,
                            api_key: e.target?.value.API_KEY,
                          });
                        }}
                        defaultValue={0}
                        fullWidth
                        disableUnderline
                        className={classes.search}
                      >
                        <MenuItem value={0}>use default settings</MenuItem>;
                        {apis.map((api) => (
                          <MenuItem value={api} key={api.key}>
                            <span>API URL: {api.URL}</span>
                            {api.API_KEY && <span className="api_key"> - API KEY: {api.API_KEY}</span>}
                          </MenuItem>
                        ))}
                      </Select>
                    </Paper>
                  </div>
                  <div className="label-input-container mt-5">
                    <div className="label-icon">
                      <label className="input-label">
                        SBOM Ledger Token <span className="optional">- Optional</span>
                      </label>
                    </div>
                    <Paper className="input-text-container">
                      <InputBase
                        name="token"
                        style={{ padding: '8px' }}
                        value={sbomLedgerToken}
                        fullWidth
                        onChange={(e) =>
                          setProjectSettings({
                            ...projectSettings,
                            token: e.target.value.trim(),
                          })
                        }
                      />
                    </Paper>
                  </div>
                </div>
              </div>
            </div>
            <div className="button-container">
              <Button endIcon={<ArrowForwardIcon />} variant="contained" color="primary" type="submit" disabled={!projectValidName || projectNameExists}>
              Continue
            </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default ProjectSettings;
