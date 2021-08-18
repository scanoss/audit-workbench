import React, { useState, useEffect } from 'react';
import ClearIcon from '@material-ui/icons/Clear';
import { Button, Card, IconButton } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import MatchesChart from '../../../../report/components/MatchesChart';
import VulnerabilitiesCard from '../../../../report/components/VulnerabilitiesCard';
import LicensesChart from '../../../../report/components/LicensesChart';
import LicensesTable from '../../../../report/components/LicensesTable';
import { report } from '../../../../../api/report-service';

const ScanResults = ({ show }) => {
  const history = useHistory();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [vulnerabilites, setVulnerabilites] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);

  const init = async () => {
    const a = await report.getSummary();
    setProgress(a?.data?.summary);
    setLicenses(a?.data?.licenses);
    setVulnerabilites(a?.data?.vulnerabilities);
  };

  useEffect(init, []);
  return (
    <section className="scan-results-home">
      <header className="d-flex space-between align-center">
        <div className="div-scan-title">
          <h1 className="header-title">Scan Results</h1>
        </div>
        <Button variant="outlined" color="primary" onClick={() => history.push('/report')}>
          More details
        </Button>
      </header>
      <div className="div-charts-home">
        <Card id="licenses" className="report-item licenses">
          <div className="report-title-home">LICENSES</div>
          <div id="report-second">
            <LicensesChart data={licenses} />
            <LicensesTable
              matchedLicenseSelected={null}
              selectLicense={(license) => console.log(license)}
              data={licenses}
            />
          </div>
        </Card>
        <Card className="report-item matches">
          <div className="report-title-home">MATCHES</div>
          {progress && <MatchesChart data={progress} />}
        </Card>
        <Card className="report-item vulnerabilites">
          <div className="report-title-home">VULNERABILITIES</div>
          <VulnerabilitiesCard data={vulnerabilites} />
        </Card>
      </div>
      <div className="btn-close">
        <IconButton onClick={() => show()} component="span">
          <ClearIcon />
        </IconButton>
      </div>
    </section>
  );
};

export default ScanResults;
