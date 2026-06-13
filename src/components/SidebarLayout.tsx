import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  FileClock,
  Volume2,
  ClipboardCheck,
  Store,
  AlertTriangle,
  Wrench,
  ScanLine,
  ListChecks,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

interface SidebarLayoutProps {
  children: ReactNode;
  role: UserRole;
}

const vendorNavItems = [
  { path: '/vendor/dashboard', label: '首页概览', icon: LayoutDashboard },
  { path: '/vendor/upload', label: '证照上传', icon: Upload },
  { path: '/vendor/records', label: '审核记录', icon: FileClock },
  { path: '/vendor/complaints', label: '投诉整改', icon: Volume2 },
];

const adminNavItems = [
  { path: '/admin/dashboard', label: '数据概览', icon: LayoutDashboard },
  { path: '/admin/review', label: '证照审核', icon: ClipboardCheck },
  { path: '/admin/stalls', label: '摊位管理', icon: Store },
  { path: '/admin/complaints', label: '投诉管理', icon: AlertTriangle },
  { path: '/admin/rectifications', label: '整改管理', icon: Wrench },
];

const inspectorNavItems = [
  { path: '/inspector/dashboard', label: '巡查首页', icon: LayoutDashboard },
  { path: '/inspector/scan', label: '扫码查验', icon: ScanLine },
  { path: '/inspector/complaints', label: '投诉记录', icon: ListChecks },
];

export default function SidebarLayout({ children, role }: SidebarLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAppStore();

  const navItems = {
    vendor: vendorNavItems,
    admin: adminNavItems,
    inspector: inspectorNavItems,
  }[role];

  const roleLabel = {
    vendor: '摊主端',
    admin: '管理员端',
    inspector: '巡查端',
  }[role];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-soft">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-secondary-500 text-lg">夜市证照</h1>
              <p className="text-xs text-gray-500">{roleLabel}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-secondary-500'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-primary-500' : '')} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-300 to-secondary-500 flex items-center justify-center text-white font-medium">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-secondary-500 truncate">
                {currentUser?.name || '未登录'}
              </p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.phone}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-secondary-500">
            {navItems.find((item) => item.path === location.pathname)?.label || ''}
          </h2>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Moon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
