import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import { Chart, registerables } from 'chart.js';
import { Button, Card } from '@material-ui/core';
import LicensesChart from '../components/LicensesChart';
import IdentificationProgress from '../components/IdentificationProgress';
import LicensesTable from '../components/LicensesTable';
import MatchesForLicense from '../components/MatchesForLicense';
import { setReport } from '../../../actions';
import { WorkbenchContext, IWorkbenchContext } from '../../../store';

Chart.register(...registerables);

const IdentifiedReport = ({ data }) => {
  const history = useHistory();
  const { dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<string>(null);

  const isEmpty = data.licenses.length === 0;

  const onLicenseSelected = (license: string) => {
    const matchedLicense = data.licenses.find((item) => item?.label === license);
    setMatchedLicenseSelected(matchedLicense);
  };

  useEffect(() => dispatch(setReport('identified')), []);

  return (
    <>
      {isEmpty ? (
        <>
          <div className="empty-container">
            <div className="report-message">
              <InsertDriveFileOutlinedIcon fontSize="inherit" color="primary" style={{ fontSize: '100px' }} />
              <h2>There is nothing here</h2>
              <Button variant="outlined" color="primary" onClick={() => history.push('/workbench/detected')}>
                Start identification
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <section className="report-layout identified">
            <Card className="report-item identification-progress">
              <div className="report-title">Identification Progress</div>
              <IdentificationProgress data={data.summary} />
            </Card>
            <Card className="report-item licenses">
              <div className="report-title">Licenses</div>
              <div id="report-second">
                <LicensesChart data={data.licenses} />
                <LicensesTable
                  matchedLicenseSelected={matchedLicenseSelected || data.licenses?.[0]}
                  selectLicense={(license) => onLicenseSelected(license)}
                  data={data.licenses}
                />
              </div>
            </Card>
            <Card className="report-item matches-for-license">
              <div className="report-title">Matches for license</div>
              <MatchesForLicense data={matchedLicenseSelected || data.licenses?.[0]} />
            </Card>
          </section>
        </>
      )}
    </>
  );
};

export default IdentifiedReport;