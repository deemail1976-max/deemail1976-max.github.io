import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  ClipboardCheck,
  AlertTriangle,
  ListOrdered,
  FileSpreadsheet,
  History,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Workflow,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  canViewAuditLogs?: boolean;
  badgeCounts?: {
    findings?: number;
    overdueActions?: number;
    activeInspections?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  canViewAuditLogs = false,
  badgeCounts,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'ड्यासबोर्ड',
      sublabel: '',
      icon: LayoutDashboard,
    },
    {
      id: 'procurements',
      label: 'खरिद आयोजनाहरू',
      // sublabel: 'Procurement Records',
      icon: FolderGit2,
    },
    {
      id: 'inspections',
      label: 'खरिद विश्लेषण',
      // sublabel: '34-Stage Evaluation',
      icon: ClipboardCheck,
      badge: badgeCounts?.activeInspections,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'findings',
      label: 'कैफियत / Findings',
      // sublabel: 'Risk & Irregularities',
      icon: AlertTriangle,
      badge: badgeCounts?.findings,
      badgeColor: 'bg-red-100 text-red-800',
    },
    {
      id: 'master-checklist',
      label: 'खरिद चेकलिस्ट',
      // sublabel: 'Statutory 142 Items',
      icon: ListOrdered,
    },
    {
      id: 'reports',
      label: 'प्रतिवेदन',
      // sublabel: 'Official Dossier & CSV',
      icon: FileSpreadsheet,
    },
    {
      id: 'procurement-process',
      label: 'खरिद प्रक्रिया',
      // sublabel: 'Procurement Guide & Checklist',
      icon: Workflow,
    },
    {
      id: 'audit-logs',
      label: 'प्रणाली अडिट लग',
      // sublabel: 'Activity & Audit Trail',
      icon: History,
    },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-54'} bg-[#0f2c4d] text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800 transition-[width] duration-200`}>
      <div className={`${isCollapsed ? 'p-3' : 'p-4'} border-b border-slate-800/80`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider min-w-0">
              <Shield className="w-4 h-4 text-red-400 shrink-0" />
              <span className="truncate">खरिद अनुगमन</span>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Sidebar खोल्नुहोस्' : 'Sidebar बन्द गर्नुहोस्'}
            title={isCollapsed ? 'Sidebar खोल्नुहोस्' : 'Sidebar बन्द गर्नुहोस्'}
            className="p-1.5 rounded-md text-slate-300 hover:bg-blue-800 hover:text-white transition shrink-0"
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.filter((item) => item.id !== 'audit-logs' || canViewAuditLogs).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? `${item.label} - ${item.sublabel}` : undefined}
              className={`w-full flex items-center justify-between ${isCollapsed ? 'px-2.5' : 'px-3'} py-2.5 rounded-lg text-left transition text-xs font-medium ${
                isActive
                  ? 'bg-blue-800/90 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'} truncate`}>
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <div className={`${isCollapsed ? 'hidden' : 'block'} truncate`}>
                  <div className="leading-tight truncate">{item.label}</div>
                  <div
                    className={`text-[10px] leading-tight font-normal ${
                      isActive ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive ? 'bg-white text-blue-900' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Statutory Guidance Note Footer */}
      <div className={`${isCollapsed ? 'hidden' : 'block'} p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40`}>
         <p className="text-[10px] leading-relaxed text-slate-400">
          सार्वजनिक खरिद ऐन, २०६३ र सार्वजनिक खरिद नियमावली, २०६४ को प्रावधान बमोजिम तयार गरिएको सहयोगी सामग्री।
        </p>
      </div>
    </aside>
  );
};
