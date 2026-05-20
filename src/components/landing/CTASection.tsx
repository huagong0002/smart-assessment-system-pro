import { useNavigate } from 'react-router-dom';
import { useInView } from '../../hooks/useInView';
import { ArrowRight, Calendar } from 'lucide-react';

export default function CTASection() {
  const navigate = useNavigate();
  const [ref, isInView] = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      className="py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)',
      }}
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Gradient orbs */}
      <div
        className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 60%)',
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center relative z-10">
        <div className={`${isInView ? 'fade-in' : 'opacity-0'}`}>
          {/* Label */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-blue-400/50" />
            <span className="text-sm text-blue-400 font-medium tracking-wide">
              立即开�?            </span>
            <div className="w-8 h-[1px] bg-blue-400/50" />
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            开启智能测评新时代
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            立即注册，免费体验完整测评流程。从出题到分析，从监控到推荐�?            �?AI 助力每一个孩子的成长之路�?          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/30 flex items-center gap-2"
            >
              立即免费体验
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 bg-white/5 backdrop-blur-sm text-white rounded-2xl font-semibold text-sm hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2"
            >
              <Calendar size={16} />
              已有账号？登�?            </button>
          </div>

          <p className="text-sm text-slate-500 mt-8">
            无需信用�?· 免费试用全部功能 · 随时取消
          </p>
        </div>
      </div>
    </section>
  );
}
