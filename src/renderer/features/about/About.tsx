import React from 'react';
import icon from '../../../../assets/icon.png';

const electron = window.require('electron');
const { app } = electron.remote;

const About = () => {
  return (
    <div
      style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <header
        style={{
          padding: '1rem 2rem 0',
        }}
      >
        <div className="d-flex align-center">
          <img src={icon} alt="logo" className="mr-10" />
          <p style={{ fontSize: '0.9rem' }}>
            SCANOSS Audit Workbench brings free of charge, secure and anonymous Open Source Auditing to your desktop.
          </p>
        </div>
      </header>

      <div
        style={{
          padding: '0 2rem',
          height: '100%',
          overflowY: 'scroll',
        }}
      >
        <p>
          This program is free software: you can redistribute it and/or modify it under the terms of the GNU General
          Public License as published by the Free Software Foundation, version 2.
        </p>
        <p>
          This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
          implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
          for more details.
        </p>
        <p>
          You should have received a copy of the GNU General Public License along with this program. If not, see{' '}
          <a href="https://www.gnu.org/licenses/" target="_blank" rel="noreferrer">
            https://www.gnu.org/licenses/
          </a>
          .
        </p>
        <p>
          By using this tool you accept that the results provided do not represent any kind of legal advise and are
          obtained against the data in the Scanoss Knowledgebase at the time of analysis.
        </p>
        <p>The source code is analyzed on the spot and is not transfered anywhere outside this computer.</p>
        <p>
          OSADL Attribution Notice:
          <br />
          The raw data of the OSADL Open Source License Checklists are licensed under the Creative Commons Attribution
          4.0 International license (CC-BY-4.0){' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
            https://creativecommons.org/licenses/by/4.0/
          </a>
        </p>
        <p>© 2017 - 2020 Open Source Automation Development Lab (OSADL) eG and contributors, info@osadl.org</p>
        <p>For further information about the project see the description at www.osadl.org/checklists</p>
        <p>VERSION: {app.getVersion()}</p>
        <p>Copyright &copy; {new Date().getFullYear()} Scan Open Source Solutions S.L.</p>
      </div>
    </div>
  );
};

export default About;
