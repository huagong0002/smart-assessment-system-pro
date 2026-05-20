import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { X, Download, Copy, Check, Sparkles, Trophy, QrCode } from 'lucide-react';

interface SharePosterProps {
  record: any;
  studentName: string;
  onClose: () => void;
}

export default function SharePoster({ record, studentName, onClose }: SharePosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const levelColors: Record<string, string> = {
    A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#ef4444',
  };

  const maskName = (name: string) => {
    if (!name || name.length < 2) return name;
    return name[0] + '*'.repeat(name.length - 1);
  };

  const downloadPoster = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, { scale: 3, useCORS: true, backgroundColor: '#0f172a' });
      const link = document.createElement('a');
      link.download = `测评海报-${record.exam_name || '报告'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('下载海报失败');
    } finally {
      setDownloading(false);
    }
  };

  const copyPoster = async () => {
    if (!posterRef.current) return;
    try {
      const canvas = await html2canvas(posterRef.current, { scale: 2, useCORS: true, backgroundColor: '#0f172a' });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (e) {
      alert('复制海报失败');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">分享海报</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Poster Preview */}
        <div className="mb-4 flex justify-center">
          <div
            ref={posterRef}
            className="w-[320px] rounded-2xl overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="text-blue-400" size={20} />
                  <span className="text-blue-300 text-xs font-medium tracking-wider">智能测评系统</span>
                  <Sparkles className="text-blue-400" size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">测评报告</h2>
                <p className="text-blue-300/70 text-xs mt-1">{record.exam_name || '综合素质测评'}</p>
              </div>

              {/* Student Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-blue-200 text-sm">学生姓名</span>
                  <span className="text-white font-bold">{maskName(studentName)}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-blue-200 text-sm">年级</span>
                  <span className="text-white">{record.student_grade || '-'}年级</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200 text-sm">学校</span>
                  <span className="text-white text-sm">{record.school || '-'}</span>
                </div>
              </div>

              {/* Score */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/10 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="text-amber-400" size={18} />
                  <span className="text-blue-200 text-sm">测评成绩</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{record.score}<span className="text-lg text-blue-300">�?/span></div>
                <div
                  className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                  style={{ backgroundColor: `${levelColors[record.level]}30`, color: levelColors[record.level] }}
                >
                  等级 {record.level}
                </div>
              </div>

              {/* Recommendation */}
              {record.recommendations && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/10">
                  <p className="text-blue-200 text-xs mb-1">推荐班级</p>
                  <p className="text-white font-bold text-sm">
                    {(() => {
                      try {
                        const rec = JSON.parse(record.recommendations);
                        return rec.classRecommendation?.className || '待定';
                      } catch { return '待定'; }
                    })()}
                  </p>
                </div>
              )}

              {/* QR Code Placeholder */}
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="text-slate-800" size={32} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">扫码参加测评</p>
                  <p className="text-blue-300/60 text-xs mt-0.5">快来挑战你的知识储备吧！</p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-4 pt-4 border-t border-white/10">
                <p className="text-blue-300/50 text-xs">素质教育智能测评平台</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={downloadPoster}
            disabled={downloading}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Download size={16} />
            {downloading ? '生成�?..' : '下载海报'}
          </button>
          <button
            onClick={copyPoster}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            {copied ? '已复�? : '复制图片'}
          </button>
        </div>
      </div>
    </div>
  );
}
