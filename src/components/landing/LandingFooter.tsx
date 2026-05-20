import { Brain, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  product: [
    { label: '在线测评', href: '#features' },
    { label: 'AI分析报告', href: '#features' },
    { label: '智能体管�?, href: '#ai-agents' },
    { label: '数据可视�?, href: '#data-viz' },
  ],
  support: [
    { label: '帮助中心', href: '#' },
    { label: '使用指南', href: '#' },
    { label: 'API文档', href: '#' },
    { label: '联系我们', href: '#' },
  ],
};

export default function LandingFooter() {
  const scrollTo = (href: string) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <span className="font-bold text-lg text-white">智测�?/span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI驱动的K-9素质教育测评平台，让每个孩子都被看见�?            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">产品功能</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">支持服务</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">联系我们</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail size={14} />
                contact@zhiceyun.com
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone size={14} />
                400-888-9999
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={14} />
                北京市海淀区中关村
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2025 智测�? All rights reserved.
          </p>
          <div className="flex gap-6">
            <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              隐私政策
            </button>
            <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              服务条款
            </button>
            <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              京ICP备xxxxxxxx�?            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
