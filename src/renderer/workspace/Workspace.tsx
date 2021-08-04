import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Button, IconButton, InputBase, Link } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { makeStyles } from '@material-ui/core/styles';
import { AppContext } from '../context/AppProvider';
import { workspaceService } from '../../api/workspace-service';
import { dialogController } from '../dialog-controller';
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  head: {
    backgroundColor: '#F4F4F5',
    fontWeight: 600,
  },
  row: {
    cursor: 'pointer',
  },
  input: {
    width: 400
  }
}));

const filter = (items, query) => {
  if (!items) return null;

  const result = items.filter((item) => {
    const name = item.name.toLowerCase();
    return name.includes(query.toLowerCase());
  });

  return result;
};

const format = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const Workspace = () => {
  const history = useHistory();

  const { setScanPath } = useContext<any>(AppContext);

  const [projects, setProjects] = useState<any[] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const filterProjects = filter(projects, searchQuery);

  const init = async () => {
    const { data } = await workspaceService.getAllProjects();
    setProjects(data);
  };

  const cleanup = () => {};

  const onShowScan = (path) => {
    setScanPath(path);
    history.push('/workbench');
  };

  const onNewProject = () => {
    const projectPath = dialogController.showOpenDialog({
      properties: ['openDirectory'],
    });

    if(projectPath) {
      setScanPath(projectPath);
      history.push('/workspace/new');
    }
  };

  useEffect(() => {
    init();
    return cleanup;
  }, []);

  const classes = useStyles();

  return (
    <>
      <section id="Workspace" className="app-page">
        <header className="app-header">
          <h1 className="header-title">Projects</h1>
          <section className="subheader">
            <div>
              { projects?.length > 0 &&
                <Paper component="form">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                  <InputBase
                    className={classes.input}
                    onKeyUp={(e: any) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    inputProps={{ 'aria-label': 'search', maxLength: 20 }}
                  />
                </Paper>
              }
            </div>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={onNewProject}>
              New project
            </Button>
          </section>
        </header>
        <main className="app-content">
          {projects && projects.length > 0 ?
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="projects table">
                <TableHead className={classes.head}>
                  <TableRow>
                    <TableCell>NAME</TableCell>
                    <TableCell>DATE</TableCell>
                    <TableCell>TOTAL FILES</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filterProjects.length !== 0 ?
                    filterProjects.map((row) => (
                      <TableRow hover key={row.name} className={classes.row} onClick={() => onShowScan(row.work_root)}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell>{format(row.date)}</TableCell>
                        <TableCell>{row.files}</TableCell>
                      </TableRow>
                    )) :
                    <TableRow>
                      <TableCell colSpan={3}>
                        <p className="text-center">
                          Not projects found with <strong>{searchQuery}</strong>
                        </p>
                      </TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            </TableContainer> :
            !projects
              ? <p>Loading projects...</p>
              : <div className='empty-container'>
                  <div className='empty-list'>
                    <h3>Not projects yet</h3>
                    <p>You can start scanning by <Link href="#" onClick={onNewProject}>creating a new project</Link>.</p>
                  </div>
                </div>
          }
        </main>
      </section>
    </>
  );
};

export default Workspace;
