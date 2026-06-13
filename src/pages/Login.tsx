import { useNavigate } from 'react-router-dom';
import { Store, Shield, ScanLine, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface RoleCardProps {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  userId: string;
  delay: number;
}

function RoleCard({ role, title, description, icon, gradient, userId, delay }: RoleCardProps) {
  const navigate = useNavigate();
  const { login } = useAppStore();

  const handleClick = () => {
    login(userId);
    const routes: Record<UserRole, string> = {
      vendor: '/vendor/dashboard',
      admin: '/admin/dashboard',
      inspector: '/inspector/dashboard',
    };
    navigate(routes[role]);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-500',
        'bg-white shadow-card hover:shadow-card-hover hover:-translate-y-1',
        'border border-gray-100 hover:border-primary-200'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn('absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-150', gradient)} />
      
      <div className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110',
        gradient
      )}>
        {icon}
      </div>
      
      <h3 className="text-xl font-bold text-secondary-500 mb-2 group-hover:text-primary-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed">
        {description}
      </p>
      
      <div className="mt-6 flex items-center text-primary-500 font-medium text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        立即进入
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 relative overflow-hidden">
      {/* 装饰元素 */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-warning-200 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
      
      {/* 星星装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary-300 rounded-full animate-pulse-soft"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部 */}
        <header className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-500">夜市摊主证照审核系统</h1>
              <p className="text-sm text-gray-500">Night Market Vendor Certification System</p>
            </div>
          </div>
        </header>

        {/* 主体内容 */}
        <main className="flex-1 flex flex-col items-center justify-center px-8 pb-16">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl font-bold text-secondary-500 mb-4 font-display">
              选择您的身份
            </h2>
            <p className="text-gray-500 text-lg">
              请选择您的角色进入系统，体验不同的功能
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
            <RoleCard
              role="vendor"
              title="摊主入口"
              description="上传营业执照、食品经营许可等证照，查看审核状态，管理摊位信息，接收整改通知"
              icon={<Store className="w-7 h-7 text-white" />}
              gradient="bg-gradient-to-br from-primary-400 to-primary-600"
              userId="v1"
              delay={100}
            />
            <RoleCard
              role="admin"
              title="管理员入口"
              description="审核摊主证照，管理摊位经营，处理投诉举报，下发整改通知，查看数据统计"
              icon={<Shield className="w-7 h-7 text-white" />}
              gradient="bg-gradient-to-br from-secondary-400 to-secondary-600"
              userId="a1"
              delay={200}
            />
            <RoleCard
              role="inspector"
              title="巡查人员入口"
              description="扫码查验摊位证照合规性，记录巡查情况，提交噪音油烟投诉，维护夜市秩序"
              icon={<ScanLine className="w-7 h-7 text-white" />}
              gradient="bg-gradient-to-br from-warning-400 to-warning-600"
              userId="i1"
              delay={300}
            />
          </div>

          <p className="mt-12 text-gray-400 text-sm">
            演示账号：点击任意角色卡片即可直接进入系统
          </p>
        </main>

        {/* 底部 */}
        <footer className="p-6 text-center text-gray-400 text-sm">
          © 2024 夜市摊主证照审核系统 · 让夜市经营更规范
        </footer>
      </div>
    </div>
  );
}
