import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Award, BarChart3 } from 'lucide-react';
import { formatDateShort } from '../utils/dateFormat';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GrowthChartProps {
  records: any[];
}

export default function GrowthChart({ records }: GrowthChartProps) {
  if (!records || records.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6 text-center">
        <BarChart3 className="mx-auto text-slate-300 mb-3" size={40} />
        <h3 className="text-lg font-bold text-slate-700">暂无测评记录</h3>
        <p className="text-sm text-slate-500 mt-1">完成测评后将在此展示成长趋势</p>
      </div>
    );
  }

  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const recentRecords = sortedRecords.slice(-10);

  const labels = recentRecords.map((r) =>
    formatDateShort(r.created_at)
  );

  const scores = recentRecords.map((r) => r.score);

  const data = {
    labels,
    datasets: [
      {
        label: '测评分数',
        data: scores,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13 },
        bodyFont: { size: 14, weight: 'bold' as const },
        callbacks: {
          label: (context: any) => `分数: ${context.parsed.y}分`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
          color: '#94a3b8',
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          font: { size: 11 },
          color: '#94a3b8',
          stepSize: 20,
        },
      },
    },
  };

  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);
  const bestLevel = recentRecords.find((r) => r.score === bestScore)?.level || '-';

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <TrendingUp className="text-blue-600" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">成长记录</h2>
          <p className="text-sm text-slate-500">近{recentRecords.length}次测评趋�?/p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-2xl">
          <p className="text-xl font-bold text-blue-600">{records.length}</p>
          <p className="text-xs text-slate-500 mt-1">总测评次�?/p>
        </div>
        <div className="text-center p-3 bg-emerald-50 rounded-2xl">
          <p className="text-xl font-bold text-emerald-600">{avgScore}</p>
          <p className="text-xs text-slate-500 mt-1">平均�?/p>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-2xl">
          <div className="flex items-center justify-center gap-1">
            <Award size={16} className="text-amber-600" />
            <p className="text-xl font-bold text-amber-600">{bestLevel}</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">最高等�?/p>
        </div>
      </div>

      <div className="h-48">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
