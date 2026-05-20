import { useEffect, useState } from 'react';
import { dashboardApi, examApi } from '../../api-client/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Users, BookOpen, ClipboardList, Award, TrendingUp, Eye, Calendar } from 'lucide-react';
import ReportDetail from '../../components/ReportDetail';
import { formatDate } from '../../utils/dateFormat';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const levelColors: Record<string, string> = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#f59e0b',
  D: '#ef4444',
};

export default function AdminHome() {
  const [data, setData] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [detailRecord, setDetailRecord] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashboardData, trendsData] = await Promise.all([
        dashboardApi.get(),
        dashboardApi.trends(),
      ]);
      setData(dashboardData);
      setTrends(trendsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (record: any) => {
    setSelectedRecord(record);
    setDetailLoading(true);
    try {
      const detail = await examApi.recordDetail(record.id);
      setDetailRecord(detail);
    } catch (error) {
      console.error(error);
      alert('获取测评详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const levelDistribution = data?.levelDistribution || [];
  const doughnutData = {
    labels: levelDistribution.map((l: any) => `${l.level}级`),
    datasets: [
      {
        data: levelDistribution.map((l: any) => l.count),
        backgroundColor: levelDistribution.map((l: any) => levelColors[l.level] || '#94a3b8'),
        borderWidth: 0,
      },
    ],
  };

  const recentRecords = data?.recentRecords || [];
  const barData = {
    labels: recentRecords.slice(0, 10).map((r: any) => r.student_name?.slice(0, 4) || '未知'),
    datasets: [
      {
        label: '得分',
        data: recentRecords.slice(0, 10).map((r: any) => r.score),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      },
    ],
  };

  const stats = data?.stats || {};

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold text-slate-800">管理首页</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-3xl p-6 text-center">
          <Users className="mx-auto text-blue-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-800">{stats.totalStudents || 0}</p>
          <p className="text-xs text-slate-500 mt-1">学生�?/p>
        </div>
        <div className="glass-card rounded-3xl p-6 text-center">
          <Users className="mx-auto text-purple-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-800">{stats.totalTeachers || 0}</p>
          <p className="text-xs text-slate-500 mt-1">教师�?/p>
        </div>
        <div className="glass-card rounded-3xl p-6 text-center">
          <BookOpen className="mx-auto text-emerald-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-800">{stats.totalQuestions || 0}</p>
          <p className="text-xs text-slate-500 mt-1">题目�?/p>
        </div>
        <div className="glass-card rounded-3xl p-6 text-center">
          <ClipboardList className="mx-auto text-amber-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-800">{stats.totalExams || 0}</p>
          <p className="text-xs text-slate-500 mt-1">试卷�?/p>
        </div>
        <div className="glass-card rounded-3xl p-6 text-center">
          <Award className="mx-auto text-red-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-800">{stats.totalRecords || 0}</p>
          <p className="text-xs text-slate-500 mt-1">测评记录</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">等级分布</h3>
          <div className="max-w-xs mx-auto">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { position: 'bottom' },
                },
              }}
            />
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">最近测评成�?/h3>
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              scales: {
                y: { beginAtZero: true, max: 100 },
              },
            }}
          />
        </div>
      </div>

      {/* 趋势图表 */}
      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-blue-500" />
              <h3 className="text-lg font-bold text-slate-800">30天测评趋�?/h3>
            </div>
            <Line
              data={{
                labels: (trends.dailyRecords || []).map((r: any) => r.date?.slice(5) || ''),
                datasets: [
                  {
                    label: '测评次数',
                    data: (trends.dailyRecords || []).map((r: any) => r.count),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-800">课程类型分布</h3>
            </div>
            <Bar
              data={{
                labels: (trends.courseDistribution || []).map((r: any) =>
                  r.course_type === 'math' ? '数理逻辑' : r.course_type === 'scratch' ? 'Scratch' : r.course_type === 'python' ? 'Python' : r.course_type === 'cpp' ? 'C++' : 'AIGC'
                ),
                datasets: [
                  {
                    label: '测评次数',
                    data: (trends.courseDistribution || []).map((r: any) => r.record_count),
                    backgroundColor: ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#a855f7'],
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>
      )}

      <div className="glass-card rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">最近测评记�?/h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                <th className="pb-3 font-medium">学生</th>
                <th className="pb-3 font-medium">试卷</th>
                <th className="pb-3 font-medium">得分</th>
                <th className="pb-3 font-medium">等级</th>
                <th className="pb-3 font-medium">时间</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.slice(0, 10).map((record: any) => (
                <tr key={record.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 text-sm text-slate-800">{record.student_name}</td>
                  <td className="py-3 text-sm text-slate-600">{record.exam_name}</td>
                  <td className="py-3 text-sm font-medium text-slate-800">{record.score}</td>
                  <td className="py-3">
                    <span
                      className="px-2 py-1 rounded-lg text-xs font-medium"
                      style={{
                        backgroundColor: `${levelColors[record.level]}20`,
                        color: levelColors[record.level],
                      }}
                    >
                      {record.level}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-slate-500">
                    {formatDate(record.created_at)}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => viewDetail(record)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Eye size={14} />
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : detailRecord ? (
              <ReportDetail
                record={detailRecord}
                onClose={() => { setSelectedRecord(null); setDetailRecord(null); }}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
