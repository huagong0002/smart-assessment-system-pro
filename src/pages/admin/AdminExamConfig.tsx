import { useEffect, useState } from 'react';
import { configApi } from '../../api-client/client';
import { Settings, Save, Check, SlidersHorizontal, BarChart3, FileText, Sparkles } from 'lucide-react';

interface ExamConfig {
  // 等级分数�?  level_a_min: string;
  level_b_min: string;
  level_c_min: string;
  level_d_max: string;
  // 默认试卷配置
  default_question_count: string;
  default_time_limit: string;
  // 能力维度权重
  dimension_cognitive_weight: string;
  dimension_skill_weight: string;
  dimension_quality_weight: string;
  dimension_innovation_weight: string;
  dimension_collaboration_weight: string;
  dimension_ethics_weight: string;
  // 报告配置
  report_template: string;
  report_include_radar: string;
  report_include_growth: string;
  report_include_suggestions: string;
  // AI配置
  ai_auto_generate: string;
  ai_review_enabled: string;
}

const defaultConfig: ExamConfig = {
  level_a_min: '90',
  level_b_min: '80',
  level_c_min: '70',
  level_d_max: '69',
  default_question_count: '15',
  default_time_limit: '60',
  dimension_cognitive_weight: '20',
  dimension_skill_weight: '20',
  dimension_quality_weight: '15',
  dimension_innovation_weight: '15',
  dimension_collaboration_weight: '15',
  dimension_ethics_weight: '15',
  report_template: 'default',
  report_include_radar: 'true',
  report_include_growth: 'true',
  report_include_suggestions: 'true',
  ai_auto_generate: 'false',
  ai_review_enabled: 'true',
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

export default function AdminExamConfig() {
  const [config, setConfig] = useState<ExamConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'levels' | 'default' | 'dimensions' | 'report' | 'ai'>('levels');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await configApi.get();
      setConfig({ ...defaultConfig, ...data });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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
      'dimension_cognitive_weight',
      'dimension_skill_weight',
      'dimension_quality_weight',
      'dimension_innovation_weight',
      'dimension_collaboration_weight',
      'dimension_ethics_weight',
    ];
    return weightKeys.reduce((sum, key) => sum + parseInt(config[key as keyof ExamConfig] || '0', 10), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { key: 'levels' as const, label: '等级分数�?, icon: <BarChart3 size={16} /> },
    { key: 'default' as const, label: '默认配置', icon: <SlidersHorizontal size={16} /> },
    { key: 'dimensions' as const, label: '维度权重', icon: <Settings size={16} /> },
    { key: 'report' as const, label: '报告配置', icon: <FileText size={16} /> },
    { key: 'ai' as const, label: 'AI配置', icon: <Sparkles size={16} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">测评配置</h1>
        <button
          onClick={handleSave}
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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

      <div className="glass-card rounded-3xl p-6 lg:p-8">
        {/* 等级分数�?*/}
        {activeTab === 'levels' && (
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
                <div className="w-16 px-2 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-lg text-center">
                  A�?                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">最低分�?/label>
                  <input
                    type="number"
                    value={config.level_a_min}
                    onChange={(e) => updateConfig('level_a_min', e.target.value)}
                    className="input-field"
                    min={0}
                    max={100}
                  />
                </div>
                <span className="text-sm text-slate-500">{config.level_a_min}-100�?/span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-lg text-center">
                  B�?                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">最低分�?/label>
                  <input
                    type="number"
                    value={config.level_b_min}
                    onChange={(e) => updateConfig('level_b_min', e.target.value)}
                    className="input-field"
                    min={0}
                    max={100}
                  />
                </div>
                <span className="text-sm text-slate-500">{config.level_b_min}-{parseInt(config.level_a_min) - 1}�?/span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 px-2 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-lg text-center">
                  C�?                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">最低分�?/label>
                  <input
                    type="number"
                    value={config.level_c_min}
                    onChange={(e) => updateConfig('level_c_min', e.target.value)}
                    className="input-field"
                    min={0}
                    max={100}
                  />
                </div>
                <span className="text-sm text-slate-500">{config.level_c_min}-{parseInt(config.level_b_min) - 1}�?/span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg text-center">
                  D�?                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">最高分�?/label>
                  <input
                    type="number"
                    value={config.level_d_max}
                    onChange={(e) => updateConfig('level_d_max', e.target.value)}
                    className="input-field"
                    min={0}
                    max={100}
                  />
                </div>
                <span className="text-sm text-slate-500">0-{config.level_d_max}�?/span>
              </div>
            </div>
          </div>
        )}

        {/* 默认配置 */}
        {activeTab === 'default' && (
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
                <input
                  type="number"
                  value={config.default_question_count}
                  onChange={(e) => updateConfig('default_question_count', e.target.value)}
                  className="input-field"
                  min={5}
                  max={50}
                />
                <p className="text-xs text-slate-400 mt-1">每份试卷的题目数量，范围 5-50</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">时间限制（分钟）</label>
                <input
                  type="number"
                  value={config.default_time_limit}
                  onChange={(e) => updateConfig('default_time_limit', e.target.value)}
                  className="input-field"
                  min={10}
                  max={180}
                />
                <p className="text-xs text-slate-400 mt-1">测评时间限制，范�?10-180 分钟</p>
              </div>
            </div>
          </div>
        )}

        {/* 维度权重 */}
        {activeTab === 'dimensions' && (
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
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      value={config[key as keyof ExamConfig]}
                      onChange={(e) => updateConfig(key as keyof ExamConfig, e.target.value)}
                      className="input-field py-1 text-center"
                      min={0}
                      max={100}
                    />
                  </div>
                  <span className="text-sm text-slate-500">%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 报告配置 */}
        {activeTab === 'report' && (
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
                <select
                  value={config.report_template}
                  onChange={(e) => updateConfig('report_template', e.target.value)}
                  className="input-field"
                >
                  {reportTemplates.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.report_include_radar === 'true'}
                    onChange={(e) => updateConfig('report_include_radar', String(e.target.checked))}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-700">包含雷达�?/div>
                    <div className="text-xs text-slate-500">在报告中展示能力维度雷达�?/div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.report_include_growth === 'true'}
                    onChange={(e) => updateConfig('report_include_growth', String(e.target.checked))}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-700">包含成长趋势</div>
                    <div className="text-xs text-slate-500">展示历次测评的成长变化曲�?/div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.report_include_suggestions === 'true'}
                    onChange={(e) => updateConfig('report_include_suggestions', String(e.target.checked))}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
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
        {activeTab === 'ai' && (
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
                <input
                  type="checkbox"
                  checked={config.ai_auto_generate === 'true'}
                  onChange={(e) => updateConfig('ai_auto_generate', String(e.target.checked))}
                  className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-slate-700">自动出题</div>
                  <div className="text-xs text-slate-500">创建测评时自动使用AI生成题目</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={config.ai_review_enabled === 'true'}
                  onChange={(e) => updateConfig('ai_review_enabled', String(e.target.checked))}
                  className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
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
  );
}
