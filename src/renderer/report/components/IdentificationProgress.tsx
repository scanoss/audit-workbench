import React, { useEffect } from 'react';
import { Chart } from 'chart.js';

const LicensesChart = ({ data }) => {
  const chartRef = React.createRef<any>();
console.log(data)
  useEffect(() => {
    const percentage = Math.floor((data?.identifiedFiles + data?.ignoredFiles)*100 / data.detectedFiles) ;
    const pending = 100 - percentage;
    console.log (percentage);

    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: [`${percentage}%`],
        datasets: [
          {
            label: '',
            data: [percentage],
            borderWidth: 0,
            backgroundColor: ['#22C55E'],
            barThickness: 50,
          },
          {
            label: 'Identified',
            data: [pending],
            borderWidth: 0,
            backgroundColor: ['#F97316'],
            barThickness: 50,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: '#22C55E',
              padding: 12,
              font: {
                size: 64,
                weight: 'bold',
                family: 'Inter',
              },
            },
          },
          x: {
            stacked: true,
            beginAtZero: true,
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              display: false,
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label() {
                return (``);
              },
              title() {
                return (`Pending files\n${data?.pendingFiles}`);
              }
            },
            displayColors: false,
          },
          legend: {
            display: false,
            labels: {
              boxWidth: 0,
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

  return (
    <div className="IdentificationProgress">
      <div className="report-titles-container">
        <span className="report-titles">Identification Progress</span>
      </div>
      <div className="identification-canvas-container">
        <canvas ref={chartRef} />
      </div>
      <div className="total-files-container">
        <span className="total-files-label">Total Files: {data.totalFiles}</span>
      </div>
    </div>
  );
};

export default LicensesChart;
