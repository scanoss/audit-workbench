import React from 'react';
import { useHistory } from 'react-router-dom';
import logo from '../../../assets/logos/scanoss_white.png';
import { dialogController } from '../dialog-controller';

const Home = () => {
  const history = useHistory();

  const onOpenFolderPressed = () => {
    const dir = dialogController.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (dir) {
      history.push('/workbench');
    }
  };

  return (
    <main className="Home">
      <div className="Hello">
        <img width="300px" alt="icon" src={logo} />
      </div>
      <div className="Hello">
        <button
          className="bnt-primary"
          type="button"
          onClick={() => onOpenFolderPressed()}
        >
          OPEN PROJECT
        </button>
      </div>
    </main>
  );
};

export default Home;
