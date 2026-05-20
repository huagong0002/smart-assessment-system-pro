import { useEffect, useState } from 'react';
import { classApi, studentApi } from '../../api-client/client';
import { Users, Search, GraduationCap, CheckCircle, XCircle } from 'lucide-react';

export default function TeacherClass() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classesData, studentsData] = await Promise.all([
        classApi.list(),
        studentApi.list(),
      ]);
      setClasses(classesData);
      setAllStudents(studentsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassStudents = async (classId: number) => {
    try {
      const data = await classApi.students(classId);
      setStudents(data);
      setSelectedClass(classes.find((c) => c.id === classId));
    } catch (error) {
      console.error(error);
    }
  };

  const addStudentToClass = async (studentId: number) => {
    if (!selectedClass) return;
    try {
      await classApi.addStudent(selectedClass.id, studentId);
      loadClassStudents(selectedClass.id);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredStudents = allStudents.filter(
    (s) =>
      s.name?.includes(searchQuery) ||
      s.school?.includes(searchQuery) ||
      s.grade?.toString().includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold text-slate-800">班级管理</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">班级列表</h3>
            <div className="space-y-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => loadClassStudents(cls.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all ${
                    selectedClass?.id === cls.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{cls.name}</p>
                    <p className="text-xs text-slate-500">{cls.grade}年级</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedClass ? (
            <div className="space-y-6">
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{selectedClass.name}</h3>
                    <p className="text-sm text-slate-500">{students.length} 名学�?/p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                        <th className="pb-3 font-medium">姓名</th>
                        <th className="pb-3 font-medium">年级</th>
                        <th className="pb-3 font-medium">学校</th>
                        <th className="pb-3 font-medium">测评状�?/th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b border-slate-50 last:border-0">
                          <td className="py-3 text-sm text-slate-800">{student.name}</td>
                          <td className="py-3 text-sm text-slate-600">{student.grade}年级</td>
                          <td className="py-3 text-sm text-slate-600">{student.school || '-'}</td>
                          <td className="py-3">
                            <span className="flex items-center gap-1 text-xs">
                              <CheckCircle size={14} className="text-emerald-500" />
                              <span className="text-emerald-600">已完�?/span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">添加学生到班�?/h3>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-11"
                    placeholder="搜索学生姓名、学校或年级"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                  {filteredStudents
                    .filter((s) => !students.find((cs) => cs.id === s.id))
                    .map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">
                              {student.name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{student.name}</p>
                            <p className="text-xs text-slate-500">
                              {student.grade}年级 · {student.school || '未知学校'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => addStudentToClass(student.id)}
                          className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          添加
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-8 text-center">
              <Users className="mx-auto text-slate-300 mb-4" size={48} />
              <h2 className="text-xl font-bold text-slate-700">选择班级</h2>
              <p className="text-slate-500 mt-2">请从左侧选择一个班级查看详�?/p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
