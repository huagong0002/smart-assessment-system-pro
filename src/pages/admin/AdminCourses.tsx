import { useEffect, useState } from 'react';
import { courseApi } from '../../api-client/client';
import {
  Plus, X, Save, Trash2, Search, Eye, Edit3, Calendar,
  MapPin, Users, Clock, ChevronDown, ChevronUp, GraduationCap,
  BookOpen, Tag, DollarSign, CheckCircle, AlertCircle, Monitor, Target, Trophy
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormat';

const courseTypeLabels: Record<string, { text: string; color: string; bg: string }> = {
  aigc: { text: 'AIGC素养', color: 'text-purple-600', bg: 'bg-purple-100' },
  scratch: { text: 'Scratch', color: 'text-amber-600', bg: 'bg-amber-100' },
  python: { text: 'Python', color: 'text-blue-600', bg: 'bg-blue-100' },
  cpp: { text: 'C++', color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

const statusLabels: Record<string, { text: string; color: string; bg: string }> = {
  active: { text: '启用', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  disabled: { text: '停用', color: 'text-slate-600', bg: 'bg-slate-100' },
};

const scheduleStatusLabels: Record<string, { text: string; color: string; bg: string }> = {
  upcoming: { text: '即将开�?, color: 'text-blue-600', bg: 'bg-blue-100' },
  ongoing: { text: '进行�?, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  completed: { text: '已结�?, color: 'text-slate-600', bg: 'bg-slate-100' },
  full: { text: '已满�?, color: 'text-amber-600', bg: 'bg-amber-100' },
};

const classModeLabels: Record<string, { text: string; icon: any }> = {
  online: { text: '线上�?, icon: Monitor },
  offline: { text: '线下�?, icon: MapPin },
};

interface Course {
  id: number;
  name: string;
  course_type: string;
  grade_range: string;
  description: string;
  syllabus: string;
  target_audience: string;
  total_hours: number;
  price: number;
  status: string;
  class_mode: string;
  location: string;
  course_objectives: string;
  matching_events: string;
  start_date: string;
  created_at: string;
  schedules?: Schedule[];
}

interface Schedule {
  id: number;
  course_id: number;
  name: string;
  teacher: string;
  start_date: string;
  end_date: string;
  schedule_time: string;
  location: string;
  capacity: number;
  enrolled: number;
  status: string;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ course_type: '', grade_range: '', status: '', keyword: '' });

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [scheduleCourseId, setScheduleCourseId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: '', course_type: 'aigc', grade_range: '1-3', description: '',
    syllabus: '', target_audience: '', total_hours: 45, price: 10800, status: 'active',
    class_mode: 'offline', location: '', course_objectives: '', matching_events: '', start_date: ''
  });
  const [scheduleForm, setScheduleForm] = useState({
    name: '', teacher: '', start_date: '', end_date: '',
    schedule_time: '', location: '', capacity: 20, enrolled: 0, status: 'upcoming'
  });

  useEffect(() => {
    loadCourses();
  }, [filter]);

  const loadCourses = async () => {
    try {
      const params: Record<string, string> = {};
      if (filter.course_type) params.course_type = filter.course_type;
      if (filter.grade_range) params.grade_range = filter.grade_range;
      if (filter.status) params.status = filter.status;
      if (filter.keyword) params.keyword = filter.keyword;

      const data = await courseApi.list(params);
      setCourses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async (courseId: number) => {
    try {
      const schedules = await courseApi.schedules(courseId);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, schedules } : c));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleExpand = (courseId: number) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      const course = courses.find(c => c.id === courseId);
      if (!course?.schedules) {
        loadSchedules(courseId);
      }
    }
  };

  const openCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        name: course.name,
        course_type: course.course_type,
        grade_range: course.grade_range,
        description: course.description || '',
        syllabus: course.syllabus || '',
        target_audience: course.target_audience || '',
        total_hours: course.total_hours || 45,
        price: course.price || 10800,
        status: course.status,
        class_mode: course.class_mode || 'offline',
        location: course.location || '',
        course_objectives: course.course_objectives || '',
        matching_events: course.matching_events || '',
        start_date: course.start_date || '',
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        name: '', course_type: 'aigc', grade_range: '1-3', description: '',
        syllabus: '', target_audience: '', total_hours: 45, price: 10800, status: 'active',
        class_mode: 'offline', location: '', course_objectives: '', matching_events: '', start_date: ''
      });
    }
    setShowCourseModal(true);
  };

  const openScheduleModal = (courseId: number, schedule?: Schedule) => {
    setScheduleCourseId(courseId);
    if (schedule) {
      setEditingSchedule(schedule);
      setScheduleForm({
        name: schedule.name,
        teacher: schedule.teacher || '',
        start_date: schedule.start_date || '',
        end_date: schedule.end_date || '',
        schedule_time: schedule.schedule_time || '',
        location: schedule.location || '',
        capacity: schedule.capacity || 20,
        enrolled: schedule.enrolled || 0,
        status: schedule.status,
      });
    } else {
      setEditingSchedule(null);
      setScheduleForm({
        name: '', teacher: '', start_date: '', end_date: '',
        schedule_time: '', location: '', capacity: 20, enrolled: 0, status: 'upcoming'
      });
    }
    setShowScheduleModal(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...courseForm, syllabus: courseForm.syllabus.split('\n').filter(s => s.trim()) };
      if (editingCourse) {
        await courseApi.update(editingCourse.id, data);
      } else {
        await courseApi.create(data);
      }
      setShowCourseModal(false);
      loadCourses();
    } catch (error) {
      console.error(error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleCourseId) return;
    setSaving(true);
    try {
      if (editingSchedule) {
        await courseApi.updateSchedule(editingSchedule.id, scheduleForm);
      } else {
        await courseApi.createSchedule(scheduleCourseId, scheduleForm);
      }
      setShowScheduleModal(false);
      loadSchedules(scheduleCourseId);
    } catch (error) {
      console.error(error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('确定要删除该课程吗？关联的开班计划也会被删除�?)) return;
    try {
      await courseApi.delete(id);
      loadCourses();
    } catch (error) {
      console.error(error);
      alert('删除失败');
    }
  };

  const handleDeleteSchedule = async (scheduleId: number, courseId: number) => {
    if (!confirm('确定要删除该开班计划吗�?)) return;
    try {
      await courseApi.deleteSchedule(scheduleId);
      loadSchedules(courseId);
    } catch (error) {
      console.error(error);
      alert('删除失败');
    }
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
        <h1 className="text-2xl font-bold text-slate-800">课程开班管�?/h1>
        <button onClick={() => openCourseModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          添加课程
        </button>
      </div>

      <div className="glass-card rounded-3xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={filter.keyword}
              onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
              className="input-field pl-10 text-sm"
              placeholder="搜索课程名称"
            />
          </div>
          <select
            value={filter.course_type}
            onChange={(e) => setFilter({ ...filter, course_type: e.target.value })}
            className="input-field w-auto text-sm"
          >
            <option value="">全部课程</option>
            <option value="aigc">AIGC素养</option>
            <option value="scratch">Scratch</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
          <select
            value={filter.grade_range}
            onChange={(e) => setFilter({ ...filter, grade_range: e.target.value })}
            className="input-field w-auto text-sm"
          >
            <option value="">全部年级</option>
            <option value="1-3">1-3年级</option>
            <option value="4-6">4-6年级</option>
            <option value="7-9">7-9年级</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="input-field w-auto text-sm"
          >
            <option value="">全部状�?/option>
            <option value="active">启用</option>
            <option value="disabled">停用</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="glass-card rounded-3xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{course.name}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${courseTypeLabels[course.course_type]?.bg} ${courseTypeLabels[course.course_type]?.color}`}>
                      {courseTypeLabels[course.course_type]?.text}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusLabels[course.status]?.bg} ${statusLabels[course.status]?.color}`}>
                      {statusLabels[course.status]?.text}
                    </span>
                    {course.class_mode && (
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 flex items-center gap-1">
                        {course.class_mode === 'online' ? <Monitor size={10} /> : <MapPin size={10} />}
                        {classModeLabels[course.class_mode]?.text || course.class_mode}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{course.description || '暂无描述'}</p>
                  <div className="flex items-center gap-4 flex-wrap text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <GraduationCap size={14} className="text-slate-400" />
                      {course.grade_range}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-400" />
                      {course.total_hours}课时
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} className="text-slate-400" />
                      ¥{course.price}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} className="text-slate-400" />
                      {course.schedules?.length || 0}个开班计�?                    </span>
                    {course.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-slate-400" />
                        开课：{course.start_date}
                      </span>
                    )}
                    {course.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-slate-400" />
                        {course.location}
                      </span>
                    )}
                  </div>
                  {course.course_objectives && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                      <Target size={14} className="text-slate-400" />
                      课程目标：{course.course_objectives}
                    </div>
                  )}
                  {course.matching_events && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                      <Trophy size={14} className="text-slate-400" />
                      匹配赛事：{course.matching_events}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleExpand(course.id)}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="查看开班计�?
                  >
                    {expandedCourse === course.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <button
                    onClick={() => openCourseModal(course)}
                    className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {expandedCourse === course.id && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-700">开班计�?/h4>
                  <button
                    onClick={() => openScheduleModal(course.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Plus size={14} />
                    添加开班计�?                  </button>
                </div>
                {course.schedules && course.schedules.length > 0 ? (
                  <div className="space-y-3">
                    {course.schedules.map((schedule) => (
                      <div key={schedule.id} className="bg-white rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-slate-800">{schedule.name}</span>
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${scheduleStatusLabels[schedule.status]?.bg} ${scheduleStatusLabels[schedule.status]?.color}`}>
                                {scheduleStatusLabels[schedule.status]?.text}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <Users size={12} className="text-slate-400" />
                                {schedule.teacher || '待定'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={12} className="text-slate-400" />
                                {schedule.start_date ? formatDate(schedule.start_date) : '待定'}
                              {schedule.end_date ? ` ~ ${formatDate(schedule.end_date)}` : ''}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} className="text-slate-400" />
                                {schedule.schedule_time || '待定'}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={12} className="text-slate-400" />
                                {schedule.location || '待定'} · {schedule.enrolled || 0}/{schedule.capacity || 20}�?                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openScheduleModal(course.id, schedule)}
                              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(schedule.id, course.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                    暂无开班计划，点击上方按钮添加
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {courses.length === 0 && (
          <div className="glass-card rounded-3xl p-12 text-center">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-2">暂无课程</p>
            <p className="text-sm text-slate-400">点击右上角添加课程按钮创建第一个课�?/p>
          </div>
        )}
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingCourse ? '编辑课程' : '添加课程'}</h2>
              <button onClick={() => setShowCourseModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">课程名称</label>
                <input
                  type="text"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="如：Python编程入门�?
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">课程类型</label>
                  <select
                    value={courseForm.course_type}
                    onChange={(e) => setCourseForm({ ...courseForm, course_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="aigc">AIGC素养</option>
                    <option value="scratch">Scratch</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">年级范围</label>
                  <select
                    value={courseForm.grade_range}
                    onChange={(e) => setCourseForm({ ...courseForm, grade_range: e.target.value })}
                    className="input-field"
                  >
                    <option value="1-3">1-3年级</option>
                    <option value="4-6">4-6年级</option>
                    <option value="7-9">7-9年级</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">上课模式</label>
                  <select
                    value={courseForm.class_mode}
                    onChange={(e) => setCourseForm({ ...courseForm, class_mode: e.target.value })}
                    className="input-field"
                  >
                    <option value="offline">线下�?/option>
                    <option value="online">线上�?/option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">开课日�?/label>
                  <input
                    type="date"
                    value={courseForm.start_date}
                    onChange={(e) => setCourseForm({ ...courseForm, start_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">上课地点</label>
                <input
                  type="text"
                  value={courseForm.location}
                  onChange={(e) => setCourseForm({ ...courseForm, location: e.target.value })}
                  className="input-field"
                  placeholder="如：教室A301"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">课程描述</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="课程的简要介�?
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">课程大纲</label>
                <textarea
                  value={courseForm.syllabus}
                  onChange={(e) => setCourseForm({ ...courseForm, syllabus: e.target.value })}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="每行一个章节，如：&#10;第一章：AI基础概念&#10;第二章：提示词工程入�?
                />
                <p className="text-xs text-slate-400 mt-1">每行一个章节，用于测评报告展示</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">适合人群</label>
                <input
                  type="text"
                  value={courseForm.target_audience}
                  onChange={(e) => setCourseForm({ ...courseForm, target_audience: e.target.value })}
                  className="input-field"
                  placeholder="如：对AI感兴趣的3-6年级学生"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">课程目标</label>
                <input
                  type="text"
                  value={courseForm.course_objectives}
                  onChange={(e) => setCourseForm({ ...courseForm, course_objectives: e.target.value })}
                  className="input-field"
                  placeholder="如：GESP Python一级、白名单赛事"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">匹配赛事</label>
                <input
                  type="text"
                  value={courseForm.matching_events}
                  onChange={(e) => setCourseForm({ ...courseForm, matching_events: e.target.value })}
                  className="input-field"
                  placeholder="如：CCF GESP、全国青少年信息素养大赛"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">总课�?/label>
                  <input
                    type="number"
                    value={courseForm.total_hours}
                    onChange={(e) => setCourseForm({ ...courseForm, total_hours: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">价格(�?</label>
                  <input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">状�?/label>
                  <select
                    value={courseForm.status}
                    onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="active">启用</option>
                    <option value="disabled">停用</option>
                  </select>
                </div>
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

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingSchedule ? '编辑开班计�? : '添加开班计�?}</h2>
              <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">班级名称</label>
                <input
                  type="text"
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="如：2025春季AIGC入门�?
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">授课教师</label>
                <input
                  type="text"
                  value={scheduleForm.teacher}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, teacher: e.target.value })}
                  className="input-field"
                  placeholder="教师姓名"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">开始日�?/label>
                  <input
                    type="date"
                    value={scheduleForm.start_date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, start_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">结束日期</label>
                  <input
                    type="date"
                    value={scheduleForm.end_date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, end_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">上课时间</label>
                <input
                  type="text"
                  value={scheduleForm.schedule_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, schedule_time: e.target.value })}
                  className="input-field"
                  placeholder="如：每周�?14:00-16:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">上课地点</label>
                <input
                  type="text"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                  className="input-field"
                  placeholder="如：教室A301"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">容量</label>
                  <input
                    type="number"
                    value={scheduleForm.capacity}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, capacity: parseInt(e.target.value) || 20 })}
                    className="input-field"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">已报�?/label>
                  <input
                    type="number"
                    value={scheduleForm.enrolled}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, enrolled: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">状�?/label>
                  <select
                    value={scheduleForm.status}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="upcoming">即将开�?/option>
                    <option value="ongoing">进行�?/option>
                    <option value="completed">已结�?/option>
                    <option value="full">已满�?/option>
                  </select>
                </div>
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
    </div>
  );
}
