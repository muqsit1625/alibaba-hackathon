import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import React from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ data }: { data: any }) => {
  return (
    <div style={{ width: '270px', height: '270px' }}>
      <Doughnut data={data} />
    </div>
  );
};

export default DoughnutChart;
