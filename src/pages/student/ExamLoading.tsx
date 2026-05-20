import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Cpu, Database, FileCheck } from 'lucide-react';
import { examApi } from '../../api-client/client';

const statusMessages = [
  { icon: <Brain size={20} />, text: '分析学生信息...' },
  { icon: <Database size={20} />, text: '匹配知识�?..' },
  { icon: <Cpu size={20} />, text: '生成个性化试卷...' },
  { icon: <FileCheck size={20} />, text: '组卷完成�? },
];

export default function ExamLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState('');

  const examId = location.state?.examId;

  useEffect(() => {
    if (!examId) {
      navigate('/student/exam');
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev >= statusMessages.length - 1) {
          clearInterval(statusInterval);
          return statusMessages.length - 1;
        }
        return prev + 1;
      });
    }, 600);

    // 获取试卷详情后跳转到考试页面
    const loadExam = async () => {
      try {
        const examDetail = await examApi.get(examId);
        // 延迟一下让用户看到完成状�?        setTimeout(() => {
          navigate('/student/exam-taking', { state: { exam: examDetail } });
        }, 2800);
      } catch (err: any) {
        setError(err.message || '加载试卷失败');
      }
    };

    loadExam();

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, [navigate, examId]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center z-50">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCheck className="text-red-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">组卷失败</h2>
          <p className="text-red-300/70 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/student/exam')}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
          >
            返回重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center z-50">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center px-6">
        {/* Glowing ring */}
        <div className="relative mb-10">
          <div className="w-32 h-32 rounded-full border-4 border-blue-500/20" />
          <div className="absolute inset-0 w-32 h-32 rounded-full border-t-4 border-blue-400 animate-spin" style={{ animationDuration: '1s' }} />
          <div className="absolute inset-0 w-32 h-32 rounded-full border-r-4 border-cyan-400/50 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="absolute inset-4 w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Brain className="text-blue-300" size={40} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2 tracking-wide">智能组卷�?/h1>
        <p className="text-blue-300/70 text-sm mb-8">AI正在为您生成个性化测评试卷</p>

        {/* Progress bar */}
        <div className="w-72 h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Percentage */}
        <p className="text-3xl font-bold text-white mb-6">{progress}%</p>

        {/* Status message */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <span className="text-blue-400 animate-pulse">{statusMessages[statusIndex].icon}</span>
          <span className="text-white/90 text-sm font-medium">{statusMessages[statusIndex].text}</span>
        </div>
      </div>
    </div>
  );
}
