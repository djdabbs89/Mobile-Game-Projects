import { BookOpen, Code2, FolderTree, LayoutList, Lightbulb, Wallet, Gamepad2 } from 'lucide-react';
import { TabId } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: 'vision', label: 'Executive Vision', icon: Lightbulb },
  { id: 'gdd', label: 'Game Design Doc', icon: BookOpen },
  { id: 'architecture', label: 'Technical Arch', icon: Code2 },
  { id: 'structure', label: 'Unity Structure', icon: FolderTree },
  { id: 'backlog', label: 'Sprint Backlog', icon: LayoutList },
  { id: 'prototype', label: 'Minigame Demo', icon: Wallet },
  { id: 'game', label: 'Play Full Game', icon: Gamepad2 },
] as const;

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-[#1a1c20] border-r border-[#2a2d35] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#2a2d35_0%,_#08090A_100%)] opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-xl font-black italic text-white tracking-tight">PICKY POCKET</h1>
          <p className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold mt-1">Project Hub</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as TabId)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent",
                  activeTab === tab.id 
                    ? "bg-cyan-500/10 border-cyan-400/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                    : "text-[#64748b] hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#2a2d35]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2a2d35] flex items-center justify-center text-xs font-bold text-slate-300">
              LD
            </div>
            <div className="text-xs text-slate-400">
              <p className="font-medium text-slate-300">Lead Dev / Design</p>
              <p>Access Level: Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
