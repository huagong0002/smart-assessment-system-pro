import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api-client/client';
import { useTheme } from '../../components/ThemeProvider';
import PageHeader from '../../components/PageHeader';
import {
  User, Lock, Phone, Mail, Shield, Award, Edit3, Save, X, Check, Eye, EyeOff
} from 'lucide-react';

interface UserInfo {
  id: number;
  username: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

export default function StudentProfile() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isDark } = useTheme();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' });
  const [phoneForm, setPhoneForm] = useState({ phone: '', code: '' });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserInfo();
    loadBadges();
  }, []);

  const loadUserInfo = async () => {
    try {
      const data = await authApi.me();
      setUserInfo(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadBadges = async () => {
    // TODO: 从API获取徽章
    setBadges([
      { id: 1, name: '初出茅庐', description: '完成首次测评', icon: 'star', earned_at: '2024-01-15' },
      { id: 2, name: '学习达人', description: '连续完成5次测�?, icon: 'flame', earned_at: '2024-02-20' },
      { id: 3, name: '优秀学员', description: '测评总分达到90�?, icon: 'trophy', earned_at: '2024-03-10' },
    ]);
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert('两次输入的新密码不一�?);
      return;
    }
    if (passwordForm.new.length < 6) {
      alert('新密码长度至�?�?);
      return;
    }
    setSaving(true);
    try {
      // TODO: 调用修改密码API
      await new Promise(r => setTimeout(r, 500));
      alert('密码修改成功');
      setShowPasswordModal(false);
      setPasswordForm({ old: '', new: '', confirm: '' });
    } catch (error: any) {
      alert(error.message || '修改失败');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePhone = async () => {
    if (!phoneForm.phone || phoneForm.phone.length !== 11) {
      alert('请输入正确的手机�?);
      return;
    }
    setSaving(true);
    try {
      // TODO: 调用修改手机号API
      await new Promise(r => setTimeout(r, 500));
      alert('手机号修改成�?);
      setShowPhoneModal(false);
      setPhoneForm({ phone: '', code: '' });
      loadUserInfo();
    } catch (error: any) {
      alert(error.message || '修改失败');
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="用户信息" description="管理您的账户信息、密码和安全设置">
        <button
          onClick={() => navigate('/student/base-info')}
          className="btn-secondary flex items-center gap-2"
        >
          <Edit3 size={16} />
          编辑基础信息
        </button>
      </PageHeader>

      {/* 账户信息卡片 */}
      <div className={`rounded-2xl border p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <User className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>账户信息</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>查看和管理您的登录信�?/p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User size={16} className="text-slate-400" />
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>用户�?/p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{userInfo?.username || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-slate-400" />
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>角色</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {userInfo?.role === 'student' ? '学生' : userInfo?.role === 'teacher' ? '教师' : '管理�?}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-slate-400" />
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>手机�?/p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{userInfo?.phone || '未绑�?}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPhoneModal(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {userInfo?.phone ? '修改' : '绑定'}
              </button>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-400" />
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>邮箱</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{userInfo?.email || '未绑�?}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Lock size={16} />
            修改密码
          </button>
        </div>
      </div>

      {/* 成长徽章 */}
      <div className={`rounded-2xl border p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Award className="text-amber-600" size={20} />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>成长徽章</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>您在测评过程中获得的荣誉徽章</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border text-center transition-all hover:shadow-md ${
                isDark
                  ? 'bg-slate-700/50 border-slate-600 hover:border-amber-500/50'
                  : 'bg-amber-50/50 border-amber-100 hover:border-amber-300'
              }`}
            >
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award size={24} className="text-amber-600" />
              </div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{badge.name}</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{badge.description}</p>
              <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{badge.earned_at}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 修改密码弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 w-full max-w-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>修改密码</h2>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>当前密码</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={passwordForm.old}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old: e.target.value })}
                    className="input-field pr-10"
                    placeholder="请输入当前密�?
                  />
                  <button
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>新密�?/label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="input-field pr-10"
                    placeholder="至少6位字�?
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>确认新密�?/label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="input-field"
                  placeholder="再次输入新密�?
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPasswordModal(false)} className="flex-1 btn-secondary py-2.5">取消</button>
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="flex-1 btn-primary py-2.5 disabled:opacity-50"
                >
                  {saving ? '保存�?..' : '确认修改'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 修改手机号弹�?*/}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 w-full max-w-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {userInfo?.phone ? '修改手机�? : '绑定手机�?}
              </h2>
              <button onClick={() => setShowPhoneModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>手机�?/label>
                <input
                  type="tel"
                  value={phoneForm.phone}
                  onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                  className="input-field"
                  placeholder="请输�?1位手机号"
                  maxLength={11}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPhoneModal(false)} className="flex-1 btn-secondary py-2.5">取消</button>
                <button
                  onClick={handleChangePhone}
                  disabled={saving}
                  className="flex-1 btn-primary py-2.5 disabled:opacity-50"
                >
                  {saving ? '保存�?..' : '确认'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
