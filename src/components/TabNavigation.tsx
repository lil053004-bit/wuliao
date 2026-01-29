import { FileText, BarChart2, Clock } from 'lucide-react';

export default function TabNavigation() {
  return (
    <div className="w-full py-3 px-4">
      <div className="flex items-center justify-center gap-6">
        <a href="#overview" className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/10 group">
          <FileText className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
          <span className="text-sm text-white/80 group-hover:text-white transition-colors">概要</span>
        </a>

        <a href="#comparison" className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/10 group">
          <BarChart2 className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
          <span className="text-sm text-white/80 group-hover:text-white transition-colors">比較</span>
        </a>

        <a href="#history" className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/10 group">
          <Clock className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
          <span className="text-sm text-white/80 group-hover:text-white transition-colors">履歴</span>
        </a>
      </div>
    </div>
  );
}
