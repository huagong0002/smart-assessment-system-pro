import { useEffect, useState } from 'react';
import { examApi } from '../../api-client/client';
import {
  Search, Eye, FileText, BarChart3, Users, TrendingUp, Award,
  Calendar, Clock, Filter, RotateCcw, X, ChevronLeft, Download
} from 'lucide-react';
import ReportDetail from '../../components/ReportDetail';
import { formatDate } from '../../utils/dateFormat';

const courseTypeLabels: Record<string, { text: string; color: string }> = {
  aigc: { text: 'AIGC', color: 'bg-purple-100 text-purple-600' },
  scratch: { text: 'Scratch', color: 'bg-amber-100 text-amber-600' },
  python: { text: 'Python', color: 'bg-blue-100 text-blue-600' },
  cpp: { text: 'C++', color: 'bg-emerald-100 text-emerald-600' },
  math: { text: '数理', color: 'bg-rose-100 text-rose-600' },
};

const levelColors: Record<string, string> = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#f59e0b',
  D: '#ef4444',
};

export default function AdminExamRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [detailRecord, setDetailRecord] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    excellentRate: 0,
    passRate: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await examApi.adminList('');
      const allRecords: any[] = [];
      for (const exam of (data || [])) {
        try {
          const examRecords = await examApi.records(exam.id);
          allRecords.push(...examRecords.map((r: any) => ({
            ...r,
            exam_name: exam.name,
            course_type: exam.course_type,
            grade: exam.grade,
            time_limit: exam.time_limit,
            question_count: exam.question_count,
          })));
        } catch (e) {}
      }
      setRecords(allRecords);

      if (allRecords.length > 0) {
        const scores = allRecords.map(r => (r.score / r.total_score) * 100);
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const excellent = scores.filter(s => s >= 80).length;
        const passed = scores.filter(s => s >= 60).length;
        setStats({
          total: allRecords.length,
          avgScore,
          excellentRate: Math.round((excellent / scores.length) * 100),
          passRate: Math.round((passed / scores.length) * 100),
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (record: any) => {
    setDetailLoading(true);
    try {
      const detail = await examApi.recordDetail(record.id);
      setDetailRecord({ ...detail, exam_name: record.exam_name, course_type: record.course_type });
    } catch (error) {
      console.error(error);
    } finally {
      setDetailLoading(false);
    }
  };

  const regenerateReport = async (recordId: number) => {
    try {
      await examApi.regenerateReport?.(recordId);
      alert('报告重新生成成功');
      viewDetail(records.find(r => r.id === recordId));
    } catch (error) {
      console.error(error);
      alert('报告重新生成失败');
    }
  };

  const filteredRecords = records.filter(record => {
    const matchSearch = !searchQuery ||
      record.exam_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.student_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCourse = !filterCourse || record.course_type === filterCourse;
    const matchLevel = !filterLevel || record.level === filterLevel;
    return matchSearch && matchCourse && matchLevel;
  });

  const getScorePercent = (score: number, total: number) => {
    return total > 0 ? Math.round((score / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (detailRecord) {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDetailRecord(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft size={20} />
            返回列表
          </button>
        </div>
        <ReportDetail record={detailRecord} />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-slate-800">测评答卷</h1>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={14} />
          刷新数据
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-3xl p-6 text-center">
          <FileText className="mx-auto text-blue-500 mb-2" size={28} />
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">答卷总数</p>
        </div>
        <div className="glass-card rounded-3xl p-6 text-center">
          <TrendingUp className="mx-auto text-emerald-500 mb-2" size={28} />
          <p className="text-3xl font-bold text-slate-800">{stats.avgScore}%</p>
          <p className="text-xs text-slate-500 mt-1">平均正确�?/p>
        </div>
        <div className="glass-card rounded-3xl p-6 text-center">
          <Award className="mx-auto text-amber-500 mb-2" size={28} />
          <p className="text-3xl font-bold text-slate-800">{stats.excellentRate}%</p>
          <p className="text-xs text-slate-500 mt-1">优良�?�?0%)</p>
        </div>
        <div className="glass-card rounded-3xl p-6 text-center">
          <BarChart3 className="mx-auto text-purple-500 mb-2" size={28} />
          <p className="text-3xl font-bold text-slate-800">{stats.passRate}%</p>
          <p className="text-xs text-slate-500 mt-1">合格�?�?0%)</p>
        </div>
      </div>

      {/* 筛�?*/}
      <div className="glass-card rounded-3xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11 w-full"
              placeholder="搜索试卷名称或学生姓�?.."
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="input-field"
            >
              <option value="">全部课程</option>
              {Object.entries(courseTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label.text}</option>
              ))}
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="input-field"
            >
              <option value="">全部等级</option>
              <option value="A">A�?/option>
              <option value="B">B�?/option>
              <option value="C">C�?/option>
              <option value="D">D�?/option>
            </select>
          </div>
        </div>
      </div>

      {/* 答卷列表 */}
      <div className="glass-card rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">学生</th>
                <th className="pb-3 font-medium">测评试卷</th>
                <th className="pb-3 font-medium">课程</th>
                <th className="pb-3 font-medium">得分</th>
                <th className="pb-3 font-medium">等级</th>
                <th className="pb-3 font-medium">用时</th>
                <th className="pb-3 font-medium">完成时间</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="mx-auto mb-2" size={32} />
                    <p>暂无答卷数据</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const scorePercent = getScorePercent(record.score, record.total_score);
                  const courseLabel = courseTypeLabels[record.course_type] || { text: record.course_type, color: 'bg-slate-100 text-slate-600' };
                  return (
                    <tr key={record.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-3 text-sm text-slate-600 font-mono">{record.id}</td>
                      <td className="py-3 text-sm text-slate-800 font-medium">{record.student_name || '-'}</td>
                      <td className="py-3 text-sm text-slate-700 max-w-[200px] truncate" title={record.exam_name}>
                        {record.exam_name}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${courseLabel.color}`}>
                          {courseLabel.text}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{record.score}/{record.total_score}</span>
                          <span className="text-xs text-slate-500">({scorePercent}%)</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                          style={{
                            backgroundColor: `${levelColors[record.level] || '#94a3b8'}20`,
                            color: levelColors[record.level] || '#94a3b8',
                          }}
                        >
                          {record.level}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {Math.floor(record.duration / 60)}分{record.duration % 60}�?                        </span>
                      </td>
                      <td className="py-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(record.created_at)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewDetail(record)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <Eye size={14} />
                            查看
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
