import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { studentApi, examApi, noticeApi, dashboardApi } from '../../api-client/client';
import { ClipboardList, BarChart3, Bell, Sparkles, Clock, TrendingUp, Trophy, Target, Medal } from 'lucide-react';
import GrowthChart from '../../components/GrowthChart';
import MiniRadar from '../../components/MiniRadar';
import { formatDate } from '../../utils/dateFormat';

export default function StudentHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [student, setStudent] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentStudent = await studentApi.me();
      if (currentStudent) {
        setStudent(currentStudent);
        const [recordsData, noticesData, trendsData] = await Promise.all([
          studentApi.records(currentStudent.id),
          noticeApi.list({ student_id: currentStudent.id.toString() }),
          dashboardApi.trends().catch(() => null),
        ]);
        setRecords(recordsData);
        setNotices(noticesData);
        setLeaderboard(trendsData?.activeStudents || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const latestRecord = records[0];

  const menuItems = [
    {
      title: '在线测评',
      desc: '开始新的入学测�?,
      icon: <ClipboardList size={24} />,
      path: '/student/exam',
      color: 'bg-blue-500',
      requireInfo: true,
    },
    {
      title: '测评报告',
      desc: '查看历史测评结果',
      icon: <BarChart3 size={24} />,
      path: '/student/report',
      color: 'bg-amber-500',
      requireInfo: true,
    },
    {
      title: '成长档案',
      desc: '查看成长轨迹与徽�?,
      icon: <Trophy size={24} />,
      path: '/student/growth',
      color: 'bg-purple-500',
      requireInfo: true,
    },
    {
      title: '通知中心',
      desc: `您有 ${notices.length} 条通知`,
      icon: <Bell size={24} />,
      path: '/student/notices',
      color: 'bg-emerald-500',
      requireInfo: false,
    },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.requireInfo && !student?.grade) {
      navigate('/student/info');
      return;
    }
    navigate(item.path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Sparkles className="text-blue-600" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              欢迎回来，{student?.name || user?.name || '同学'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {student?.grade ? `${student.grade}年级` : ''} {student?.school || ''}
            </p>
          </div>
        </div>
      </div>

      {/* 功能卡片前置 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleMenuClick(item)}
            className="glass-card glass-card-hover rounded-3xl p-6 text-left"
          >
            <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-4`}>
              <span className="text-white">{item.icon}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
          </button>
        ))}
      </div>

      {latestRecord && (
        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">最新测�?/h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-2xl">
              <p className="text-2xl font-bold text-blue-600">{latestRecord.score}</p>
              <p className="text-xs text-slate-500 mt-1">得分</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-2xl">
              <p className="text-2xl font-bold text-amber-600">{latestRecord.level}</p>
              <p className="text-xs text-slate-500 mt-1">等级</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-2xl">
              <p className="text-2xl font-bold text-emerald-600">
                {Math.floor((latestRecord.duration || 0) / 60)}:{String((latestRecord.duration || 0) % 60).padStart(2, '0')}
              </p>
              <p className="text-xs text-slate-500 mt-1">用时</p>
            </div>
          </div>
        </div>
      )}

      {/* 能力雷达�?- 最新测�?*/}
      {latestRecord && (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">能力雷达�?/h2>
              <p className="text-sm text-slate-500">最新测评能力维度分�?/p>
            </div>
          </div>
          <MiniRadar record={latestRecord} />
        </div>
      )}

      <GrowthChart records={records} />

      {/* 活跃排行�?*/}
      {leaderboard.length > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Medal className="text-amber-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">活跃排行�?/h2>
              <p className="text-sm text-slate-500">测评次数最多的同学</p>
            </div>
          </div>
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((s: any, idx: number) => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  idx === 0 ? 'bg-amber-100 text-amber-600' :
                  idx === 1 ? 'bg-slate-200 text-slate-600' :
                  idx === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.exam_count}次测�?· 平均{s.avg_score ? Math.round(s.avg_score) : 0}%</p>
                </div>
                {idx < 3 && <Medal size={16} className={idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : 'text-orange-400'} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {!student?.grade && (
        <div className="glass-card rounded-3xl p-6 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-amber-600" size={24} />
            <div>
              <h3 className="font-bold text-amber-800">完善个人信息</h3>
              <p className="text-sm text-amber-700 mt-1">请先填写信息采集表，以便我们为您生成合适的测评试卷</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/student/info')}
            className="mt-4 btn-primary bg-amber-500 hover:bg-amber-600"
          >
            去填�?          </button>
        </div>
      )}
    </div>
  );
}
