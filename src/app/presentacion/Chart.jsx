// File: src/app/presentacion/Chart.jsx

'use client';

import React from 'react';
import {
  Chart as ChartJS,
  TimeScale,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';

// 1) Registrar componentes de Chart.js
ChartJS.register(
  TimeScale,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// 2) Configuración por defecto con leyenda visible
const defaultConfig = {
  type: 'line',
  data: {
    datasets: [
      {
        label: 'Valor',
        data: [
          { x: '2022-01-01', y: 100 },
          { x: '2022-02-01', y:  90 },
          { x: '2022-03-01', y:  80 },
          { x: '2022-04-01', y:  60 },
          { x: '2022-05-01', y:  40 },
          { x: '2022-06-01', y:  20 },
          { x: '2022-07-01', y:  -5 }
        ],
        borderColor: '#2e9c48',
        borderWidth: 6,
        pointRadius: 0,
        tension: 0
      },
      {
        label: 'Precio',
        data: [
          { x: '2022-01-01', y: 20 },
          { x: '2022-02-01', y: 20 },
          { x: '2022-03-01', y: 20 },
          { x: '2022-04-01', y: 20 },
          { x: '2022-05-01', y: 20 },
          { x: '2022-06-01', y: 20 },
          { x: '2022-07-01', y: 20 }
        ],
        borderColor: '#5833a0',
        borderWidth: 6,
        pointRadius: 0,
        tension: 0
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { size: 14 }
        }
      },
      title: {
        display: true,
        text: 'Comparación: Valor vs. Precio',
        font: { size: 18 }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'month' },
        grid: { display: false },
        ticks: { display: false }
      },
      y: {
        display: false
      }
    }
  }
};

// 3) Componente Chart
export default function Chart({ config }) {
  const finalConfig = config || defaultConfig;
  return <Line data={finalConfig.data} options={finalConfig.options} />;
}
