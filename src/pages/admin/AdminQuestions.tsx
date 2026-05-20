import { useEffect, useState } from 'react';
import { questionApi } from '../../api-client/client';
import { Plus, X, Save, Trash2, Sparkles, CheckCircle, Search, Eye, Star, Edit3, Database, RefreshCw, Play, Upload, FileText, Download, AlertCircle } from 'lucide-react';

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editRestricted, setEditRestricted] = useState(false);
  const [filter, setFilter] = useState({ course_type: '', grade_range: '', status: '', keyword: '' });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, total: 0 });
  const [formData, setFormData] = useState({
    course_type: 'math',
    grade_range: '1-3',
    question_type: 'single',
    content: '',
    options: ['', '', '', ''],
    answer: 'A',
    explanation: '',
    knowledge_point: '',
    score: 5,
    difficulty: 3,
  });
  const [aiParams, setAiParams] = useState({
    courseType: 'math',
    grade: 3,
    knowledgePoint: '',
    difficulty: 3,
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Batch Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      parseCsvFile(file);
    }
  };

  const parseCsvFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      let content = e.target?.result as string;
      
      // 处理UTF-8 BOM
      if (content.startsWith('\uFEFF')) {
        content = content.slice(1);
      }
      
      const lines = content.split('\n').filter(line => line.trim());
      const questions: any[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const parts = parseCsvLine(line);
        if (parts.length >= 8) {
          questions.push({
            course_type: parts[0] || 'math',
            grade_range: parts[1] || '1-3',
            content: parts[2] || '',
            option_a: parts[3] || '',
            option_b: parts[4] || '',
            option_c: parts[5] || '',
            option_d: parts[6] || '',
            answer: parts[7] || 'A',
            score: parseInt(parts[8]) || 5,
            difficulty: parseInt(parts[9]) || 3,
            explanation: parts[10] || '',
            knowledge_point: parts[11] || '',
            row: i + 1,
          });
        }
      }
      setImportPreview(questions);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleImport = async () => {
    if (importPreview.length === 0) return;
    
    setImporting(true);
    setImportResult(null);
    
    try {
      const validQuestions = importPreview.filter(q => q.content.trim());
      const result = await questionApi.bulkCreate(validQuestions);
      setImportResult({
        success: result.success || 0,
        failed: validQuestions.length - (result.success || 0),
        errors: result.errors || [],
      });
      loadQuestions();
      loadQuestionStats();
    } catch (error) {
      setImportResult({
        success: 0,
        failed: importPreview.length,
        errors: [(error as Error).message],
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `课程类型,年级范围,题目内容,选项A,选项B,选项C,选项D,正确答案,分�?难度,解析,知识�?math,1-3,1+2+3+4+...+100=?,2550,5050,3050,4050,B,5,3,等差数列求和公式�?首项+末项)×项数÷2=101×50=5050,等差数列
math,1-3,一个正方形的边长是4cm，面积是多少�?8cm²,16cm²,12cm²,20cm²,B,5,2,正方形面�?边长×边长=4×4=16cm²,正方形面积`;
    
    // 添加UTF-8 BOM以确保Excel正确识别中文编码
    const contentWithBom = '\uFEFF' + template;
    const blob = new Blob([contentWithBom], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '题库导入模板.csv';
    link.click();
  };

  // Question Stats State
  const [questionStats, setQuestionStats] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadQuestions();
    loadQuestionStats();
  }, [filter, pagination.page, pagination.pageSize]);

  const loadQuestions = async () => {
    try {
      const params: Record<string, string> = {
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
      };
      if (filter.course_type) params.course_type = filter.course_type;
      if (filter.grade_range) params.grade_range = filter.grade_range;
      if (filter.status) params.status = filter.status;
      if (filter.keyword) params.keyword = filter.keyword;

      const data = await questionApi.list(params);
      setQuestions(data.questions || []);
      setPagination(prev => ({ ...prev, total: data.total || 0 }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionStats = async () => {
    try {
      const statsData = await questionApi.statistics();
      if (statsData.success) {
        setQuestionStats({
          total: statsData.overview?.total_questions || 0,
          approved: statsData.overview?.approved_count || 0,
          pending: statsData.overview?.pending_count || 0,
          avgDifficulty: Math.round((statsData.overview?.avg_difficulty || 0) * 10) / 10,
          byCourse: (statsData.byCourse || []).reduce((acc: any, item: any) => {
            acc[item.course_type] = item.count;
            return acc;
          }, {}),
          byDimension: statsData.byDimension || [],
          mostUsed: statsData.mostUsed || [],
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshQuestionStats = async () => {
    await loadQuestionStats();
  };

  const clearAllQuestions = async () => {
    if (!confirm('确定要清空所有题目吗�?)) return;
    try {
      await fetch('/api/questions/all', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      alert('已清空所有题�?);
      refreshQuestionStats();
      loadQuestions();
    } catch (e) {
      console.error(e);
      alert('清空失败');
    }
  };

  const startFullRegenerate = async () => {
    if (!confirm('确定要重新生成所有题目吗？这将清空现有题目�?)) return;
    try {
      setGenerating(true);
      await fetch('/api/questions/full-regenerate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      alert('已开始后台生成，请稍后查看统�?);
    } catch (e) {
      console.error(e);
      alert('启动失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleFilterChange = (newFilter: Partial<typeof filter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const openEdit = async (q: any) => {
    try {
      const usage = await questionApi.usage(q.id);
      setEditRestricted(usage.used);
      setEditingQuestion(q);
      setFormData({
        course_type: q.course_type,
        grade_range: q.grade_range,
        question_type: q.question_type,
        content: q.content,
        options: JSON.parse(q.options || '[]'),
        answer: q.answer,
        explanation: q.explanation || '',
        knowledge_point: q.knowledge_point || '',
        score: q.score,
        difficulty: q.difficulty,
      });
      setShowEditModal(true);
    } catch (error) {
      console.error(error);
      alert('获取题目使用状态失�?);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    setSaving(true);
    try {
      await questionApi.update(editingQuestion.id, formData);
      setShowEditModal(false);
      setEditingQuestion(null);
      loadQuestions();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await questionApi.create(formData);
      setShowAddModal(false);
      setFormData({
        course_type: 'math',
        grade_range: '1-3',
        question_type: 'single',
        content: '',
        options: ['', '', '', ''],
        answer: 'A',
        explanation: '',
        knowledge_point: '',
        score: 5,
        difficulty: 3,
      });
      loadQuestions();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    setAiLoading(true);
    try {
      await questionApi.aiGenerate(aiParams);
      setShowAiModal(false);
      loadQuestions();
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该题目吗？')) return;
    try {
      await questionApi.delete(id);
      loadQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await questionApi.update(id, { status: 'approved' });
      loadQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  const openPreview = (q: any) => {
    setPreviewQuestion(q);
    setShowPreviewModal(true);
  };

  const renderDifficultyStars = (difficulty: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={14}
            className={i < (difficulty || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
          />
        ))}
      </div>
    );
  };

  const statusLabels: Record<string, { text: string; color: string }> = {
    pending: { text: '待审�?, color: 'bg-amber-100 text-amber-600' },
    approved: { text: '已通过', color: 'bg-emerald-100 text-emerald-600' },
    rejected: { text: '已拒�?, color: 'bg-red-100 text-red-600' },
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-slate-800">题库管理</h1>
        <div className="flex gap-3">
          <button
            onClick={refreshQuestionStats}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} />
            刷新统计
          </button>
          <button
            onClick={clearAllQuestions}
            className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Trash2 size={16} />
            清空题库
          </button>
          <button
            onClick={startFullRegenerate}
            disabled={generating}
            className="px-4 py-2 bg-emerald-500 text-white rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                生成�?..
              </>
            ) : (
              <>
                <Play size={16} />
                批量生成
              </>
            )}
          </button>
          <button onClick={() => setShowAiModal(true)} className="btn-secondary flex items-center gap-2">
            <Sparkles size={18} />
            AI出题
          </button>
          <button onClick={() => setShowImportModal(true)} className="btn-secondary flex items-center gap-2">
            <Upload size={18} />
            批量导入
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            添加题目
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {questionStats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 text-center">
              <Database size={24} className="mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-slate-800">{questionStats.total || 0}</p>
              <p className="text-xs text-slate-500">总题�?/p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <CheckCircle size={24} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-2xl font-bold text-slate-800">{questionStats.approved || 0}</p>
              <p className="text-xs text-slate-500">已审�?/p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <Star size={24} className="mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-slate-800">{questionStats.avgDifficulty || 0}</p>
              <p className="text-xs text-slate-500">平均难度</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <Sparkles size={24} className="mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-slate-800">{questionStats.byDimension?.length || 0}</p>
              <p className="text-xs text-slate-500">能力维度</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* By Course */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3">课程分布</h3>
              <div className="space-y-2">
                {Object.entries(questionStats.byCourse || {}).map(([course, count]: [string, any]) => (
                  <div key={course} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {course === 'math' ? '数理逻辑' : course === 'scratch' ? 'Scratch' : course === 'python' ? 'Python' : course === 'cpp' ? 'C++' : 'AIGC'}
                    </span>
                    <span className="font-bold text-slate-800">{count}</span>
                  </div>
                ))}
                {Object.keys(questionStats.byCourse || {}).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-2">暂无数据</p>
                )}
              </div>
            </div>

            {/* By Dimension */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3">维度分布</h3>
              <div className="space-y-2">
                {(questionStats.byDimension || []).map((item: any) => (
                  <div key={item.dimension_code} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{item.dimension_code}</span>
                    <span className="font-bold text-slate-800">{item.count}</span>
                  </div>
                ))}
                {(questionStats.byDimension || []).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-2">暂无数据</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-3xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={filter.keyword}
              onChange={(e) => handleFilterChange({ keyword: e.target.value })}
              className="input-field pl-10 text-sm"
              placeholder="搜索题目内容或知识点"
            />
          </div>
          <select
            value={filter.course_type}
            onChange={(e) => handleFilterChange({ course_type: e.target.value })}
            className="input-field w-auto text-sm"
          >
            <option value="">全部课程</option>
            <option value="math">数理逻辑</option>
            <option value="aigc">AIGC素养</option>
            <option value="scratch">Scratch</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
          <select
            value={filter.grade_range}
            onChange={(e) => handleFilterChange({ grade_range: e.target.value })}
            className="input-field w-auto text-sm"
          >
            <option value="">全部年级</option>
            <option value="1-3">1-3年级</option>
            <option value="4-6">4-6年级</option>
            <option value="7-9">7-9年级</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => handleFilterChange({ status: e.target.value })}
            className="input-field w-auto text-sm"
          >
            <option value="">全部状�?/option>
            <option value="pending">待审�?/option>
            <option value="approved">已通过</option>
          </select>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">题目内容</th>
                <th className="pb-3 font-medium">课程</th>
                <th className="pb-3 font-medium">年级</th>
                <th className="pb-3 font-medium">知识�?/th>
                <th className="pb-3 font-medium">分�?/th>
                <th className="pb-3 font-medium">难度</th>
                <th className="pb-3 font-medium">出现次数</th>
                <th className="pb-3 font-medium">正确�?/th>
                <th className="pb-3 font-medium">状�?/th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <p>暂无题目数据</p>
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 text-sm text-slate-600">{q.id}</td>
                    <td className="py-3 text-sm text-slate-800 max-w-xs truncate">{q.content}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        q.course_type === 'aigc' ? 'bg-purple-100 text-purple-600' : q.course_type === 'scratch' ? 'bg-amber-100 text-amber-600' : q.course_type === 'python' ? 'bg-blue-100 text-blue-600' : q.course_type === 'cpp' ? 'bg-emerald-100 text-emerald-600' : q.course_type === 'math' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {q.course_type === 'aigc' ? 'AIGC' : q.course_type === 'scratch' ? 'Scratch' : q.course_type === 'python' ? 'Python' : q.course_type === 'cpp' ? 'C++' : q.course_type === 'math' ? '数理' : q.course_type}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-600">{q.grade_range}</td>
                    <td className="py-3 text-sm text-slate-600">{q.knowledge_point || '-'}</td>
                    <td className="py-3 text-sm text-slate-600">{q.score}</td>
                    <td className="py-3">{renderDifficultyStars(q.difficulty)}</td>
                    <td className="py-3 text-sm text-slate-600">{q.usage_count || 0}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${q.correct_rate || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{q.correct_rate || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusLabels[q.status]?.color || 'bg-slate-100'}`}>
                        {statusLabels[q.status]?.text || q.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openPreview(q)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="预览"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEdit(q)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit3 size={16} />
                        </button>
                        {q.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(q.id)}
                            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="通过"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <span className="text-sm text-slate-500">
            �?{pagination.total} 条，�?{pagination.page} / {Math.ceil(pagination.total / pagination.pageSize) || 1} �?          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              上一�?            </button>
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              下一�?            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">题目预览</h2>
              <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  previewQuestion.course_type === 'aigc' ? 'bg-purple-100 text-purple-600' : previewQuestion.course_type === 'scratch' ? 'bg-amber-100 text-amber-600' : previewQuestion.course_type === 'python' ? 'bg-blue-100 text-blue-600' : previewQuestion.course_type === 'cpp' ? 'bg-emerald-100 text-emerald-600' : previewQuestion.course_type === 'math' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {previewQuestion.course_type === 'aigc' ? 'AIGC' : previewQuestion.course_type === 'scratch' ? 'Scratch' : previewQuestion.course_type === 'python' ? 'Python' : previewQuestion.course_type === 'cpp' ? 'C++' : previewQuestion.course_type === 'math' ? '数理' : previewQuestion.course_type}
                </span>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">{previewQuestion.grade_range}</span>
                <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-lg text-xs font-medium">{previewQuestion.score}�?/span>
                <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                  难度: {renderDifficultyStars(previewQuestion.difficulty)}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-sm font-bold text-slate-700 mb-1">题干</p>
                <p className="text-sm text-slate-800">{previewQuestion.content}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">选项</p>
                <div className="space-y-2">
                  {JSON.parse(previewQuestion.options || '[]').map((opt: string, idx: number) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl ${
                      String.fromCharCode(65 + idx) === previewQuestion.answer ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'
                    }`}>
                      <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                        String.fromCharCode(65 + idx) === previewQuestion.answer ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm text-slate-700">{opt}</span>
                      {String.fromCharCode(65 + idx) === previewQuestion.answer && (
                        <span className="ml-auto text-xs font-bold text-emerald-600">正确答案</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {previewQuestion.explanation && (
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <p className="text-sm font-bold text-blue-700 mb-1">解析</p>
                  <p className="text-sm text-blue-800">{previewQuestion.explanation}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500">知识�?/p>
                  <p className="text-sm font-medium text-slate-700">{previewQuestion.knowledge_point || '-'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500">状�?/p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusLabels[previewQuestion.status]?.color || 'bg-slate-100'}`}>
                    {statusLabels[previewQuestion.status]?.text || previewQuestion.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">添加题目</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">课程类型</label>
                  <select
                    value={formData.course_type}
                    onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="math">数理逻辑</option>
                    <option value="aigc">AIGC素养</option>
                    <option value="scratch">Scratch</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">年级范围</label>
                  <select
                    value={formData.grade_range}
                    onChange={(e) => setFormData({ ...formData, grade_range: e.target.value })}
                    className="input-field"
                  >
                    <option value="1-3">1-3年级</option>
                    <option value="4-6">4-6年级</option>
                    <option value="7-9">7-9年级</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">题目内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">选项</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-500 w-6">{String.fromCharCode(65 + idx)}</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[idx] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      className="input-field flex-1"
                      placeholder={`选项 ${String.fromCharCode(65 + idx)}`}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">正确答案</label>
                  <select
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    className="input-field"
                  >
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">分�?/label>
                  <select
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    <option value={5}>基础 5�?/option>
                    <option value={10}>进阶 10�?/option>
                    <option value={15}>挑战 15�?/option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">难度</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5].map((d) => (
                      <option key={d} value={d}>{d}�?/option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">解析</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">知识�?/label>
                <input
                  type="text"
                  value={formData.knowledge_point}
                  onChange={(e) => setFormData({ ...formData, knowledge_point: e.target.value })}
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? '保存�?..' : '保存'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">编辑题目</h2>
              <button onClick={() => { setShowEditModal(false); setEditingQuestion(null); }} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            {editRestricted && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700">
                  该题目已被使用，仅允许修改题干、解析、知识点、难度和状�?                </p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">课程类型</label>
                  <select
                    value={formData.course_type}
                    onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                    className="input-field disabled:bg-slate-50 disabled:text-slate-400"
                    disabled={editRestricted}
                  >
                    <option value="math">数理逻辑</option>
                    <option value="aigc">AIGC素养</option>
                    <option value="scratch">Scratch</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">年级范围</label>
                  <select
                    value={formData.grade_range}
                    onChange={(e) => setFormData({ ...formData, grade_range: e.target.value })}
                    className="input-field disabled:bg-slate-50 disabled:text-slate-400"
                    disabled={editRestricted}
                  >
                    <option value="1-3">1-3年级</option>
                    <option value="4-6">4-6年级</option>
                    <option value="7-9">7-9年级</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">题目内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">选项</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-500 w-6">{String.fromCharCode(65 + idx)}</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[idx] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      className="input-field flex-1 disabled:bg-slate-50 disabled:text-slate-400"
                      placeholder={`选项 ${String.fromCharCode(65 + idx)}`}
                      disabled={editRestricted}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">正确答案</label>
                  <select
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    className="input-field disabled:bg-slate-50 disabled:text-slate-400"
                    disabled={editRestricted}
                  >
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">分�?/label>
                  <select
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                    className="input-field disabled:bg-slate-50 disabled:text-slate-400"
                    disabled={editRestricted}
                  >
                    <option value={5}>基础 5�?/option>
                    <option value={10}>进阶 10�?/option>
                    <option value={15}>挑战 15�?/option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">难度</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5].map((d) => (
                      <option key={d} value={d}>{d}�?/option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">解析</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">知识�?/label>
                <input
                  type="text"
                  value={formData.knowledge_point}
                  onChange={(e) => setFormData({ ...formData, knowledge_point: e.target.value })}
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? '保存�?..' : '保存'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">AI出题</h2>
              <button onClick={() => setShowAiModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">课程类型</label>
                <select
                  value={aiParams.courseType}
                  onChange={(e) => setAiParams({ ...aiParams, courseType: e.target.value })}
                  className="input-field"
                >
                  <option value="math">数理逻辑</option>
                  <option value="aigc">AIGC素养</option>
                  <option value="scratch">Scratch</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">年级</label>
                <select
                  value={aiParams.grade}
                  onChange={(e) => setAiParams({ ...aiParams, grade: parseInt(e.target.value) })}
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                    <option key={g} value={g}>{g}年级</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">知识�?/label>
                <input
                  type="text"
                  value={aiParams.knowledgePoint}
                  onChange={(e) => setAiParams({ ...aiParams, knowledgePoint: e.target.value })}
                  className="input-field"
                  placeholder="如：AI绘画基础"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">难度 (1-5)</label>
                <input
                  type="range"
                  value={aiParams.difficulty}
                  onChange={(e) => setAiParams({ ...aiParams, difficulty: parseInt(e.target.value) })}
                  className="w-full"
                  min={1}
                  max={5}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>简�?/span>
                  <span>困难</span>
                </div>
              </div>

              <button
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={18} />
                {aiLoading ? '生成�?..' : 'AI生成题目'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">批量导入题目</h2>
                <p className="text-sm text-slate-500 mt-1">通过CSV文件批量导入题目</p>
              </div>
              <button
                onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreview([]); setImportResult(null); }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 bg-blue-50 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-blue-800">下载导入模板</h3>
                    <p className="text-sm text-blue-600 mt-1">点击下方按钮下载CSV模板，按照模板格式填写题目数�?/p>
                    <button
                      onClick={downloadTemplate}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Download size={16} />
                      下载模板
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">上传CSV文件</label>
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
                    importFile ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                  onClick={() => document.getElementById('import-file')?.click()}
                >
                  <input
                    id="import-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className={`mx-auto mb-3 ${importFile ? 'text-blue-500' : 'text-slate-400'}`} size={32} />
                  <p className={`text-sm font-medium ${importFile ? 'text-blue-700' : 'text-slate-600'}`}>
                    {importFile ? importFile.name : '点击或拖拽文件到此处上传'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">支持CSV格式文件</p>
                </div>
              </div>

              {importPreview.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">预览数据 ({importPreview.length} �?</h3>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 text-left text-xs text-slate-500">
                            <th className="px-4 py-3 font-medium">行号</th>
                            <th className="px-4 py-3 font-medium">题目内容</th>
                            <th className="px-4 py-3 font-medium">选项</th>
                            <th className="px-4 py-3 font-medium">答案</th>
                            <th className="px-4 py-3 font-medium">课程/年级</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.slice(0, 10).map((q, idx) => (
                            <tr key={idx} className="border-b border-slate-50 last:border-0">
                              <td className="px-4 py-3 text-sm text-slate-500">{q.row}</td>
                              <td className="px-4 py-3 text-sm text-slate-800 max-w-xs truncate">{q.content}</td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {q.option_a && `A. ${q.option_a.slice(0, 10)}...`}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-medium">
                                  {q.answer}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {q.course_type === 'math' ? '数理' : q.course_type} / {q.grade_range}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {importPreview.length > 10 && (
                      <div className="px-4 py-2 bg-slate-50 text-center text-xs text-slate-500">
                        仅显示前10条，�?{importPreview.length} 条数�?                      </div>
                    )}
                  </div>
                </div>
              )}

              {importResult && (
                <div className={`p-4 rounded-2xl ${
                  importResult.success > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {importResult.success > 0 ? (
                      <CheckCircle className="text-emerald-600" size={24} />
                    ) : (
                      <AlertCircle className="text-red-600" size={24} />
                    )}
                    <div>
                      <p className={`font-bold ${importResult.success > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {importResult.success > 0 ? '导入成功' : '导入失败'}
                      </p>
                      <p className={`text-sm ${importResult.success > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        成功导入 {importResult.success} 条，失败 {importResult.failed} �?                      </p>
                    </div>
                  </div>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium text-slate-600">错误信息:</p>
                      {importResult.errors.slice(0, 3).map((error, idx) => (
                        <p key={idx} className="text-xs text-slate-500">{error}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreview([]); setImportResult(null); }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || importPreview.length === 0}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      导入�?..
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      开始导�?                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
