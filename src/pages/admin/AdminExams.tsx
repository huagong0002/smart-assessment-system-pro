import { useEffect, useState } from 'react';
import { examApi, configApi } from '../../api-client/client';
import {
  Search, Eye, X, ClipboardList, FileText, Star, Settings, Save, Check,
  SlidersHorizontal, BarChart3, Sparkles, Users, Plus, Edit3, Trash2
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormat';

const courseTypeLabels: Record<string, { text: string; color: string }> = {
  aigc: { text: 'AIGC', color: 'bg-purple-100 text-purple-600' },
  scratch: { text: 'Scratch', color: 'bg-amber-100 text-amber-600' },
  python: { text: 'Python', color: 'bg-blue-100 text-blue-600' },
  cpp: { text: 'C++', color: 'bg-emerald-100 text-emerald-600' },
  math: { text: '数理', color: 'bg-rose-100 text-rose-600' },
};

const levelColors: Record<string, string> = {
  A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#ef4444',
};

interface ExamConfig {
  level_a_min: string; level_b_min: string; level_c_min: string; level_d_max: string;
  default_question_count: string; default_time_limit: string;
  dimension_cognitive_weight: string; dimension_skill_weight: string;
  dimension_quality_weight: string; dimension_innovation_weight: string;
  dimension_collaboration_weight: string; dimension_ethics_weight: string;
  report_template: string; report_include_radar: string;
  report_include_growth: string; report_include_suggestions: string;
  ai_auto_generate: string; ai_review_enabled: string;
}

const defaultConfig: ExamConfig = {
  level_a_min: '90', level_b_min: '80', level_c_min: '70', level_d_max: '69',
  default_question_count: '15', default_time_limit: '60',
  dimension_cognitive_weight: '20', dimension_skill_weight: '20',
  dimension_quality_weight: '15', dimension_innovation_weight: '15',
  dimension_collaboration_weight: '15', dimension_ethics_weight: '15',
  report_template: 'default', report_include_radar: 'true',
  report_include_growth: 'true', report_include_suggestions: 'true',
  ai_auto_generate: 'false', ai_review_enabled: 'true',
};

const reportTemplates = [
  { value: 'default', label: '默认模板' },
  { value: 'detailed', label: '详细分析报告' },
  { value: 'simple', label: '简洁报�? },
  { value: 'parent', label: '家长版报�? },
];

const dimensionLabels: Record<string, string> = {
  dimension_cognitive_weight: '认知能力',
  dimension_skill_weight: '技能水�?,
  dimension_quality_weight: '素质素养',
  dimension_innovation_weight: '创新能力',
  dimension_collaboration_weight: '协作能力',
  dimension_ethics_weight: '道德品质',
};

export default function AdminExams() {
  const [activeTab, setActiveTab] = useState<'exams' | 'config'>('exams');

  // Exams tab state
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ course_type: '', grade: '', keyword: '' });
  const [previewExam, setPreviewExam] = useState<any>(null);
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [previewRecords, setPreviewRecords] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState<'questions' | 'records'>('questions');

  // Config tab state
  const [config, setConfig] = useState<ExamConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [configTab, setConfigTab] = useState<'levels' | 'default' | 'dimensions' | 'report' | 'ai'>('levels');

  useEffect(() => {
    loadExams();
  }, [filter]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter.course_type) params.course_type = filter.course_type;
      if (filter.grade) params.grade = filter.grade;
      if (filter.keyword) params.keyword = filter.keyword;

      const query = Object.keys(params).length > 0 ? '?' + new URLSearchParams(params).toString() : '';
      const data = await examApi.adminList(query);
      setExams(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const data = await configApi.get();
      setConfig({ ...defaultConfig, ...data });
    } catch (error) {
      console.error(error);
    } finally {
      setConfigLoading(false);
    }
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    course_type: 'math' as const,
    grade: 3,
    question_count: 15,
    time_limit: 60,
  });
  const [creating, setCreating] = useState(false);

  const handleCreateExam = async () => {
    if (!createForm.name.trim()) {
      alert('请输入试卷名�?);
      return;
    }
    
    setCreating(true);
    try {
      await examApi.create(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: '', course_type: 'math', grade: 3, question_count: 15, time_limit: 60 });
      loadExams();
      alert('试卷创建成功');
    } catch (error) {
      alert('创建失败: ' + (error as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editing, setEditing] = useState(false);

  const handleEdit = (exam: any) => {
    setEditingExam({ ...exam });
    setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这份试卷吗�?)) return;
    try {
      await examApi.delete(id);
      loadExams();
      alert('删除成功');
    } catch (error) {
      alert('删除失败: ' + (error as Error).message);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? exams.map(e => e.id) : []);
  };

  const handleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = async () => {
    if (!confirm(`确定要删除选中�?${selectedIds.length} 份试卷吗？`)) return;
    try {
      for (const id of selectedIds) {
        await examApi.delete(id);
      }
      setSelectedIds([]);
      loadExams();
      alert('批量删除成功');
    } catch (error) {
      alert('批量删除失败: ' + (error as Error).message);
    }
  };

  const handleUpdateExam = async () => {
    if (!editingExam || !editingExam.name.trim()) {
      alert('请输入试卷名�?);
      return;
    }
    
    setEditing(true);
    try {
      await examApi.update(editingExam.id, {
        name: editingExam.name,
        course_type: editingExam.course_type,
        grade: editingExam.grade,
        time_limit: editingExam.time_limit,
      });
      setShowEditModal(false);
      setEditingExam(null);
      loadExams();
      alert('更新成功');
    } catch (error) {
      alert('更新失败: ' + (error as Error).message);
    } finally {
      setEditing(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await configApi.update(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof ExamConfig, value: string) => {
    setConfig({ ...config, [key]: value });
  };

  const getTotalWeight = () => {
    const weightKeys = [
      'dimension_cognitive_weight', 'dimension_skill_weight', 'dimension_quality_weight',
      'dimension_innovation_weight', 'dimension_collaboration_weight', 'dimension_ethics_weight',
    ];
    return weightKeys.reduce((sum, key) => sum + parseInt(config[key as keyof ExamConfig] || '0', 10), 0);
  };

  const openPreview = async (exam: any) => {
    setPreviewExam(exam);
    setPreviewLoading(true);
    setPreviewTab('questions');
    try {
      const detail = await examApi.getWithRecords(exam.id);
      setPreviewQuestions(detail.questions || []);
      setPreviewRecords(detail.records || []);
    } catch (error) {
      console.error(error);
      alert('获取试卷详情失败');
    } finally {
      setPreviewLoading(false);
    }
  };

  const renderDifficultyStars = (difficulty: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={12} className={i < (difficulty || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
        ))}
      </div>
    );
  };

  const formatStudentNames = (names: string | null, count: number) => {
    if (!names) return '-';
    const nameList = names.split(',').filter(Boolean);
    if (nameList.length === 0) return '-';
    if (nameList.length <= 2) return nameList.join('�?);
    return `${nameList.slice(0, 2).join('�?)} �?{count}人`;
  };

  const formatScoreRange = (min: number | null, max: number | null, count: number) => {
    if (count === 0) return '-';
    if (min === max) return `${max}分`;
    return `${min || 0}~${max || 0}分`;
  };

  const tabs = [
    { key: 'exams' as const, label: '测评试卷', icon: <ClipboardList size={16} /> },
    { key: 'config' as const, label: '测评配置', icon: <Settings size={16} /> },
  ];

  const configTabs = [
    { key: 'levels' as const, label: '等级分数�?, icon: <BarChart3 size={16} /> },
    { key: 'default' as const, label: '默认配置', icon: <SlidersHorizontal size={16} /> },
    { key: 'dimensions' as const, label: '维度权重', icon: <Settings size={16} /> },
    { key: 'report' as const, label: '报告配置', icon: <FileText size={16} /> },
    { key: 'ai' as const, label: 'AI配置', icon: <Sparkles size={16} /> },
  ];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-slate-800">测评管理</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          新建试卷
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="glass-card rounded-3xl p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={filter.keyword}
                  onChange={(e) => setFilter(prev => ({ ...prev, keyword: e.target.value }))}
                  className="input-field pl-10 text-sm"
                  placeholder="搜索试卷名称"
                />
              </div>
              <select
                value={filter.course_type}
                onChange={(e) => setFilter(prev => ({ ...prev, course_type: e.target.value }))}
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
                value={filter.grade}
                onChange={(e) => setFilter(prev => ({ ...prev, grade: e.target.value }))}
                className="input-field w-auto text-sm"
              >
                <option value="">全部年级</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                  <option key={g} value={g}>{g}年级</option>
                ))}
              </select>
            </div>
          </div>

          {/* Exams Table */}
          <div className="glass-card rounded-3xl p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* 批量操作�?*/}
                {selectedIds.length > 0 && (
                  <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-blue-700">已选择 <strong>{selectedIds.length}</strong> 份试�?/span>
                      <button
                        onClick={() => setSelectedIds([])}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        取消选择
                      </button>
                    </div>
                    <button
                      onClick={handleBatchDelete}
                      className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      <Trash2 size={14} />
                      批量删除
                    </button>
                  </div>
                )}
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                      <th className="pb-3 font-medium w-12">
                        <input
                          type="checkbox"
                          checked={exams.length > 0 && selectedIds.length === exams.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                      </th>
                      <th className="pb-3 font-medium">试卷ID</th>
                      <th className="pb-3 font-medium">测评试卷</th>
                      <th className="pb-3 font-medium">课程类型</th>
                      <th className="pb-3 font-medium">年级</th>
                      <th className="pb-3 font-medium">题目�?/th>
                      <th className="pb-3 font-medium">测评�?/th>
                      <th className="pb-3 font-medium">测评结果</th>
                      <th className="pb-3 font-medium">创建时间</th>
                      <th className="pb-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400">
                          <ClipboardList className="mx-auto mb-2" size={32} />
                          <p>暂无试卷数据</p>
                        </td>
                      </tr>
                    ) : (
                      exams.map((exam) => (
                        <tr key={exam.id} className="border-b border-slate-50 last:border-0">
                          <td className="py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(exam.id)}
                              onChange={() => handleSelect(exam.id)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-3 text-sm text-slate-600 font-mono">{exam.id}</td>
                          <td className="py-3 text-sm text-slate-800 max-w-xs truncate" title={exam.name}>
                            {exam.name}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${courseTypeLabels[exam.course_type]?.color || 'bg-slate-100 text-slate-600'}`}>
                              {courseTypeLabels[exam.course_type]?.text || exam.course_type}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-slate-600">{exam.grade}年级</td>
                          <td className="py-3 text-sm text-slate-600">{exam.question_count}�?/td>
                          <td className="py-3 text-sm text-slate-600 max-w-[120px] truncate" title={exam.student_names || ''}>
                            {formatStudentNames(exam.student_names, exam.record_count)}
                          </td>
                          <td className="py-3 text-sm text-slate-600">
                            {formatScoreRange(exam.min_score, exam.max_score, exam.record_count)}
                          </td>
                          <td className="py-3 text-sm text-slate-500">
                            {formatDate(exam.created_at)}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openPreview(exam)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                <Eye size={14} />
                                预览
                              </button>
                              <button
                                onClick={() => handleEdit(exam)}
                                className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-medium"
                              >
                                <Edit3 size={14} />
                                编辑
                              </button>
                              <button
                                onClick={() => handleDelete(exam.id)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                <Trash2 size={14} />
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Config Tab */}
      {activeTab === 'config' && (
        <div className="max-w-4xl mx-auto fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Settings className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">测评配置</h2>
                <p className="text-sm text-slate-500">配置测评系统的各项参�?/p>
              </div>
            </div>
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="btn-primary py-2 px-4 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? '保存�?..' : '保存配置'}
            </button>
          </div>

          {saved && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-600 mb-4">
              <Check size={16} />
              配置保存成功
            </div>
          )}

          {/* Config Sub-tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {configTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setConfigTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  configTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="glass-card rounded-3xl p-6 lg:p-8">
            {/* 等级分数�?*/}
            {configTab === 'levels' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">能力等级分数�?/h2>
                    <p className="text-sm text-slate-500">设置测评结果的能力等级划分标�?/p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 px-2 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-lg text-center">A�?/div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">最低分�?/label>
                      <input type="number" value={config.level_a_min} onChange={(e) => updateConfig('level_a_min', e.target.value)} className="input-field" min={0} max={100} />
                    </div>
                    <span className="text-sm text-slate-500">{config.level_a_min}-100�?/span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-lg text-center">B�?/div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">最低分�?/label>
                      <input type="number" value={config.level_b_min} onChange={(e) => updateConfig('level_b_min', e.target.value)} className="input-field" min={0} max={100} />
                    </div>
                    <span className="text-sm text-slate-500">{config.level_b_min}-{parseInt(config.level_a_min) - 1}�?/span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 px-2 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-lg text-center">C�?/div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">最低分�?/label>
                      <input type="number" value={config.level_c_min} onChange={(e) => updateConfig('level_c_min', e.target.value)} className="input-field" min={0} max={100} />
                    </div>
                    <span className="text-sm text-slate-500">{config.level_c_min}-{parseInt(config.level_b_min) - 1}�?/span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg text-center">D�?/div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">最高分�?/label>
                      <input type="number" value={config.level_d_max} onChange={(e) => updateConfig('level_d_max', e.target.value)} className="input-field" min={0} max={100} />
                    </div>
                    <span className="text-sm text-slate-500">0-{config.level_d_max}�?/span>
                  </div>
                </div>
              </div>
            )}

            {/* 默认配置 */}
            {configTab === 'default' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <SlidersHorizontal className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">试卷默认配置</h2>
                    <p className="text-sm text-slate-500">设置新建测评时的默认参数</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">题目数量</label>
                    <input type="number" value={config.default_question_count} onChange={(e) => updateConfig('default_question_count', e.target.value)} className="input-field" min={5} max={50} />
                    <p className="text-xs text-slate-400 mt-1">每份试卷的题目数量，范围 5-50</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">时间限制（分钟）</label>
                    <input type="number" value={config.default_time_limit} onChange={(e) => updateConfig('default_time_limit', e.target.value)} className="input-field" min={10} max={180} />
                    <p className="text-xs text-slate-400 mt-1">测评时间限制，范�?10-180 分钟</p>
                  </div>
                </div>
              </div>
            )}

            {/* 维度权重 */}
            {configTab === 'dimensions' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Settings className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">能力维度权重</h2>
                    <p className="text-sm text-slate-500">配置六大能力维度在测评中的权重占�?/p>
                  </div>
                </div>

                <div className={`p-3 rounded-xl text-sm font-medium mb-4 ${
                  getTotalWeight() === 100
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  当前总权�? {getTotalWeight()}% {getTotalWeight() === 100 ? '�? : '(应为100%)'}
                </div>

                <div className="space-y-4">
                  {Object.entries(dimensionLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium text-slate-700">{label}</div>
                      <div className="flex-1">
                        <input
                          type="range"
                          value={config[key as keyof ExamConfig]}
                          onChange={(e) => updateConfig(key as keyof ExamConfig, e.target.value)}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          min={0} max={100}
                        />
                      </div>
                      <div className="w-16">
                        <input
                          type="number"
                          value={config[key as keyof ExamConfig]}
                          onChange={(e) => updateConfig(key as keyof ExamConfig, e.target.value)}
                          className="input-field py-1 text-center"
                          min={0} max={100}
                        />
                      </div>
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 报告配置 */}
            {configTab === 'report' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FileText className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">报告配置</h2>
                    <p className="text-sm text-slate-500">配置测评报告的内容和样式</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">报告模板</label>
                    <select value={config.report_template} onChange={(e) => updateConfig('report_template', e.target.value)} className="input-field">
                      {reportTemplates.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <input type="checkbox" checked={config.report_include_radar === 'true'} onChange={(e) => updateConfig('report_include_radar', String(e.target.checked))} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                      <div>
                        <div className="text-sm font-medium text-slate-700">包含雷达�?/div>
                        <div className="text-xs text-slate-500">在报告中展示能力维度雷达�?/div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <input type="checkbox" checked={config.report_include_growth === 'true'} onChange={(e) => updateConfig('report_include_growth', String(e.target.checked))} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                      <div>
                        <div className="text-sm font-medium text-slate-700">包含成长趋势</div>
                        <div className="text-xs text-slate-500">展示历次测评的成长变化曲�?/div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <input type="checkbox" checked={config.report_include_suggestions === 'true'} onChange={(e) => updateConfig('report_include_suggestions', String(e.target.checked))} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                      <div>
                        <div className="text-sm font-medium text-slate-700">包含学习建议</div>
                        <div className="text-xs text-slate-500">AI生成的个性化学习建议</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* AI配置 */}
            {configTab === 'ai' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="text-violet-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">AI配置</h2>
                    <p className="text-sm text-slate-500">配置AI辅助功能开�?/p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={config.ai_auto_generate === 'true'} onChange={(e) => updateConfig('ai_auto_generate', String(e.target.checked))} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                    <div>
                      <div className="text-sm font-medium text-slate-700">自动出题</div>
                      <div className="text-xs text-slate-500">创建测评时自动使用AI生成题目</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={config.ai_review_enabled === 'true'} onChange={(e) => updateConfig('ai_review_enabled', String(e.target.checked))} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                    <div>
                      <div className="text-sm font-medium text-slate-700">AI题目审核</div>
                      <div className="text-xs text-slate-500">使用AI审核题目质量和准确�?/div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewExam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{previewExam.name}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  试卷ID: {previewExam.id} | {courseTypeLabels[previewExam.course_type]?.text || previewExam.course_type} | {previewExam.grade}年级 | {previewExam.question_count}�?| 总分{previewExam.total_score}�?| 限时{previewExam.time_limit}分钟 | 已测{previewRecords.length}�?                </p>
              </div>
              <button
                onClick={() => { setPreviewExam(null); setPreviewQuestions([]); setPreviewRecords([]); }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview Tabs */}
            <div className="flex gap-2 px-6 pt-4 pb-2 border-b border-slate-100">
              <button
                onClick={() => setPreviewTab('questions')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  previewTab === 'questions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                试卷内容
              </button>
              <button
                onClick={() => setPreviewTab('records')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  previewTab === 'records'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                学生答题 ({previewRecords.length})
              </button>
            </div>

            <div className="p-6">
              {previewLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : previewTab === 'questions' ? (
                previewQuestions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="mx-auto mb-2" size={32} />
                    <p>该试卷暂无题�?/p>
                  </div>
                ) : (
                  <div className="space-y-6">
                  {previewQuestions.map((q, idx) => (
                    <div key={q.id} className="border border-slate-100 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
                            {q.sequence}
                          </span>
                          <span className="text-sm font-medium text-slate-700">{q.content}</span>
                        </div>
                        <span className="shrink-0 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium">
                          {q.exam_score}�?                        </span>
                      </div>

                      <div className="space-y-2 ml-9">
                        {JSON.parse(q.options || '[]').map((opt: string, optIdx: number) => {
                          const optLetter = String.fromCharCode(65 + optIdx);
                          const isCorrect = optLetter === q.answer;
                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-3 p-2.5 rounded-xl ${
                                isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-100'
                              }`}
                            >
                              <span className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                                isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {optLetter}
                              </span>
                              <span className={`text-sm ${isCorrect ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                                {opt}
                              </span>
                              {isCorrect && (
                                <span className="ml-auto text-xs font-bold text-emerald-600">正确答案</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 ml-9 text-xs text-slate-500">
                        <span className="px-2 py-1 bg-slate-100 rounded-md">{q.knowledge_point || '未分�?}</span>
                        <span className="flex items-center gap-1">难度: {renderDifficultyStars(q.difficulty)}</span>
                        <span>题目ID: {q.id}</span>
                      </div>

                      {q.explanation && (
                        <div className="mt-3 ml-9 p-3 bg-blue-50 rounded-xl">
                          <p className="text-xs font-bold text-blue-700 mb-1">解析</p>
                          <p className="text-xs text-blue-800">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {(() => {
                    const idSet = new Set();
                    const duplicates: number[] = [];
                    for (const q of previewQuestions) {
                      if (idSet.has(q.id)) duplicates.push(q.id);
                      idSet.add(q.id);
                    }
                    if (duplicates.length > 0) {
                      return (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                          <p className="text-sm font-bold text-red-700">检测到重复题目！重复ID: {duplicates.join(', ')}</p>
                        </div>
                      );
                    }
                    return (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                        <p className="text-sm font-bold text-emerald-700">题目去重检查通过：共{previewQuestions.length}道题，无重复题目</p>
                      </div>
                    );
                  })()}
                </div>
              )) : (
                previewRecords.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Users className="mx-auto mb-2" size={32} />
                    <p>暂无学生答题记录</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previewRecords.map((record: any) => (
                      <div key={record.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                        {/* Student Header */}
                        <div className="bg-slate-50 px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Users size={16} className="text-blue-600" />
                            </div>
                            <div>
                              <span className="font-medium text-slate-800">{record.student_name || '未知学生'}</span>
                              <span className="text-xs text-slate-500 ml-2">ID: {record.student_id}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-600">得分: <span className="text-blue-600 font-bold">{record.score}�?/span></span>
                            <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium">{record.level || '-'}</span>
                            <span className="text-xs text-slate-400">用时: {Math.floor((record.duration || 0) / 60)}分{(record.duration || 0) % 60}�?/span>
                          </div>
                        </div>

                        {/* Answers Detail */}
                        <div className="p-5">
                          <div className="space-y-3">
                            {record.answers && record.answers.map((ans: any) => {
                              const question = previewQuestions.find((q: any) => q.sequence === ans.sequence);
                              const options = question ? JSON.parse(question.options || '[]') : [];
                              return (
                                <div key={ans.sequence} className={`p-3 rounded-xl ${ans.isCorrect ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                                  <div className="flex items-start gap-3">
                                    <span className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                                      ans.isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                      {ans.sequence}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-slate-700 font-medium">{question ? question.content : `题目${ans.sequence}`}</p>
                                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs">
                                        <span className={ans.isCorrect ? 'text-emerald-600' : 'text-red-600'}>
                                          学生答案: <strong>{ans.studentAnswer || '未作�?}</strong>
                                        </span>
                                        <span className="text-slate-500">
                                          正确答案: <strong className="text-emerald-600">{ans.correctAnswer}</strong>
                                        </span>
                                        <span className="text-slate-500">
                                          得分: <strong>{ans.score}�?/strong>
                                        </span>
                                      </div>
                                      {/* Show option text if available */}
                                      {options.length > 0 && (
                                        <div className="mt-2 grid grid-cols-2 gap-1">
                                          {options.map((opt: string, optIdx: number) => {
                                            const optLetter = String.fromCharCode(65 + optIdx);
                                            const isStudentChoice = ans.studentAnswer === optLetter;
                                            const isCorrectChoice = ans.correctAnswer === optLetter;
                                            return (
                                              <span key={optIdx} className={`text-xs px-2 py-1 rounded ${
                                                isCorrectChoice
                                                  ? 'bg-emerald-100 text-emerald-700 font-medium'
                                                  : isStudentChoice
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'text-slate-400'
                                              }`}>
                                                {optLetter}. {opt}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">新建测评试卷</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateExam(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">试卷名称</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="请输入试卷名�?
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">课程类型</label>
                <select
                  value={createForm.course_type}
                  onChange={(e) => setCreateForm({ ...createForm, course_type: e.target.value as typeof createForm.course_type })}
                  className="input-field"
                >
                  <option value="math">数理逻辑</option>
                  <option value="aigc">AIGC素养</option>
                  <option value="scratch">Scratch</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">年级</label>
                  <select
                    value={createForm.grade}
                    onChange={(e) => setCreateForm({ ...createForm, grade: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                      <option key={g} value={g}>{g}年级</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">题目数量</label>
                  <input
                    type="number"
                    value={createForm.question_count}
                    onChange={(e) => setCreateForm({ ...createForm, question_count: parseInt(e.target.value) })}
                    className="input-field"
                    min={5}
                    max={50}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">时间限制（分钟）</label>
                <input
                  type="number"
                  value={createForm.time_limit}
                  onChange={(e) => setCreateForm({ ...createForm, time_limit: parseInt(e.target.value) })}
                  className="input-field"
                  min={10}
                  max={180}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">取消</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? '创建�?..' : '创建试卷'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {showEditModal && editingExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">编辑测评试卷</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateExam(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">试卷名称</label>
                <input
                  type="text"
                  value={editingExam.name}
                  onChange={(e) => setEditingExam({ ...editingExam, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="请输入试卷名�?
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">课程类型</label>
                <select
                  value={editingExam.course_type}
                  onChange={(e) => setEditingExam({ ...editingExam, course_type: e.target.value })}
                  className="input-field"
                >
                  <option value="math">数理逻辑</option>
                  <option value="aigc">AIGC素养</option>
                  <option value="scratch">Scratch</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">年级</label>
                  <select
                    value={editingExam.grade}
                    onChange={(e) => setEditingExam({ ...editingExam, grade: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                      <option key={g} value={g}>{g}年级</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">时间限制（分钟）</label>
                  <input
                    type="number"
                    value={editingExam.time_limit}
                    onChange={(e) => setEditingExam({ ...editingExam, time_limit: parseInt(e.target.value) })}
                    className="input-field"
                    min={10}
                    max={180}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">取消</button>
                <button type="submit" className="btn-primary" disabled={editing}>
                  {editing ? '更新�?..' : '保存修改'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
