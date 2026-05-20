import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface MiniRadarProps {
  record: any;
}

export default function MiniRadar({ record }: MiniRadarProps) {
  // 从record解析维度分数
  const parseScores = (scores: any) => {
    if (typeof scores === 'object' && scores !== null) return scores;
    try { return JSON.parse(scores || '{}'); } catch { return {}; }
  };

  const scores = parseScores(record.scores);

  // 6大维�?  const dimensions = [
    { key: 'cognitive', label: '认知能力' },
    { key: 'skill', label: '技能能�? },
    { key: 'quality', label: '综合素养' },
    { key: 'innovation', label: '创新思维' },
    { key: 'collaboration', label: '协作沟�? },
    { key: 'ethics', label: 'AI伦理' },
  ];

  const data = {
    labels: dimensions.map((d) => d.label),
    datasets: [
      {
        label: '得分',
        data: dimensions.map((d) => scores[d.key] || record.score / 6),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 8,
        cornerRadius: 6,
        titleFont: { size: 12 },
        bodyFont: { size: 12, weight: 'bold' as const },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          font: { size: 10 },
          color: '#94a3b8',
        },
        pointLabels: {
          font: { size: 11, weight: 'bold' as const },
          color: '#64748b',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
    },
  };

  return (
    <div className="aspect-square max-w-xs mx-auto">
      <Radar data={data} options={options} />
    </div>
  );
}
