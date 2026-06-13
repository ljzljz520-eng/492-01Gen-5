import { useNavigate } from 'react-router-dom';
import {
  Store,
  FileCheck,
  AlertTriangle,
  Wrench,
  Users,
  Clock,
  TrendingUp,
  ChevronRight,
  Bell,
  CheckCircle,
  XCircle,
  ScanLine,
} from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: string;
  onClick?: () => void;
}

function StatCard({ title, value, icon, color, bgColor, trend, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-6 rounded-2xl bg-white shadow-card border border-gray-50 text-left',
        'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
        'group'
      )}
    >
      <div className={cn('absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full', bgColor)} />
      
      <div className="relative z-10">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', bgColor)}>
          {icon}
        </div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className={cn('text-3xl font-bold', color)}>{value}</p>
        {trend && (
          <p className="text-xs text-success-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>

      <ChevronRight className={cn(
        'absolute bottom-6 right-6 w-5 h-5 text-gray-300 transition-all duration-300',
        'group-hover:text-primary-500 group-hover:translate-x-1'
      )} />
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { stalls, certificates, complaints, rectifications, inspections } = useAppStore();

  const pendingCerts = certificates.filter((c) => c.status === 'pending').length;
  const pendingComplaints = complaints.filter((c) => c.status === 'pending').length;
  const activeRectifications = rectifications.filter(
    (r) => r.status === 'pending' || r.status === 'in_progress'
  ).length;
  const activeStalls = stalls.filter((s) => s.status === 'active').length;

  const recentComplaints = complaints.slice(0, 5);
  const pendingReviews = certificates.filter((c) => c.status === 'pending').slice(0, 5);
  const todayInspections = inspections.filter((i) =>
    i.inspectTime.includes('2024-06-10')
  ).length;

  return (
    <SidebarLayout role="admin">
      <div className="space-y-6">
        {/* 欢迎横幅 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary-500 to-secondary-600 p-6 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 translate-y-1/2 -translate-x-1/3" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">管理员工作台</h2>
            <p className="text-secondary-100">
              今日已巡查 {todayInspections} 个摊位，有 {pendingCerts + pendingComplaints} 项待处理事项
            </p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard
            title="摊位总数"
            value={activeStalls}
            icon={<Store className="w-6 h-6 text-primary-500" />}
            color="text-primary-500"
            bgColor="bg-primary-50"
            trend="较上月 +3"
            onClick={() => navigate('/admin/stalls')}
          />
          <StatCard
            title="待审核证照"
            value={pendingCerts}
            icon={<FileCheck className="w-6 h-6 text-warning-500" />}
            color="text-warning-500"
            bgColor="bg-warning-50"
            onClick={() => navigate('/admin/review')}
          />
          <StatCard
            title="待处理投诉"
            value={pendingComplaints}
            icon={<AlertTriangle className="w-6 h-6 text-danger-500" />}
            color="text-danger-500"
            bgColor="bg-danger-50"
            onClick={() => navigate('/admin/complaints')}
          />
          <StatCard
            title="整改中"
            value={activeRectifications}
            icon={<Wrench className="w-6 h-6 text-secondary-500" />}
            color="text-secondary-500"
            bgColor="bg-secondary-50"
            onClick={() => navigate('/admin/rectifications')}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 待办事项 */}
          <div className="col-span-2 bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-secondary-500 text-lg">待办事项</h3>
              <span className="text-sm text-gray-500">共 {pendingCerts + pendingComplaints} 项</span>
            </div>
            <div className="p-4 space-y-3">
              {pendingReviews.map((cert) => {
                const stall = stalls.find((s) => s.id === cert.stallId);
                return (
                  <div
                    key={cert.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-warning-50/50 border border-warning-100 hover:bg-warning-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/review')}
                  >
                    <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-warning-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-500">
                        {stall?.stallName} - {cert.name}
                      </p>
                      <p className="text-sm text-gray-500">提交时间：{cert.submitTime}</p>
                    </div>
                    <StatusTag status={cert.status} type="certificate" size="sm" />
                  </div>
                );
              })}
              {recentComplaints
                .filter((c) => c.status === 'pending')
                .map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-danger-50/50 border border-danger-100 hover:bg-danger-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/complaints')}
                  >
                    <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-danger-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-500">
                        {complaint.stallName} - {complaint.title}
                      </p>
                      <p className="text-sm text-gray-500">提交时间：{complaint.submitTime}</p>
                    </div>
                    <StatusTag status={complaint.status} type="complaint" size="sm" />
                  </div>
                ))}
              {pendingCerts === 0 && pendingComplaints === 0 && (
                <div className="py-8 text-center text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success-300" />
                  <p>暂无待办事项</p>
                </div>
              )}
            </div>
          </div>

          {/* 今日数据 */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6">
              <h3 className="font-bold text-secondary-500 text-lg mb-4">今日数据</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">已巡查摊位</span>
                  <span className="font-bold text-secondary-500">{todayInspections}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                    style={{ width: `${(todayInspections / stalls.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">完成进度 {Math.round((todayInspections / stalls.length) * 100)}%</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6">
              <h3 className="font-bold text-secondary-500 text-lg mb-4">快捷操作</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '证照审核', icon: FileCheck, path: '/admin/review', color: 'text-primary-500 bg-primary-50' },
                  { label: '摊位管理', icon: Store, path: '/admin/stalls', color: 'text-secondary-500 bg-secondary-50' },
                  { label: '投诉处理', icon: AlertTriangle, path: '/admin/complaints', color: 'text-danger-500 bg-danger-50' },
                  { label: '整改管理', icon: Wrench, path: '/admin/rectifications', color: 'text-warning-500 bg-warning-50' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-card transition-all duration-200 flex flex-col items-center gap-2"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-secondary-500">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 最近动态 */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-secondary-500 text-lg">最近动态</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {/* 最近审核 */}
              <div>
                <h4 className="font-medium text-secondary-500 mb-4 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-primary-500" />
                  最近审核
                </h4>
                <div className="space-y-3">
                  {certificates
                    .filter((c) => c.status !== 'pending')
                    .slice(0, 4)
                    .map((cert) => {
                      const stall = stalls.find((s) => s.id === cert.stallId);
                      return (
                        <div key={cert.id} className="flex items-center gap-3">
                          {cert.status === 'approved' ? (
                            <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-danger-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-secondary-500 truncate">
                              {stall?.stallName} - {cert.name}
                            </p>
                            <p className="text-xs text-gray-400">{cert.reviewTime}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 最近投诉 */}
              <div>
                <h4 className="font-medium text-secondary-500 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-danger-500" />
                  最近投诉
                </h4>
                <div className="space-y-3">
                  {complaints.slice(0, 4).map((complaint) => (
                    <div key={complaint.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-danger-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary-500 truncate">
                          {complaint.stallName} - {complaint.title}
                        </p>
                        <p className="text-xs text-gray-400">{complaint.submitTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 最近巡查 */}
              <div>
                <h4 className="font-medium text-secondary-500 mb-4 flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-success-500" />
                  最近巡查
                </h4>
                <div className="space-y-3">
                  {inspections.slice(0, 4).map((inspection) => (
                    <div key={inspection.id} className="flex items-center gap-3">
                      {inspection.isCompliant ? (
                        <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-warning-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary-500 truncate">
                          {inspection.stallName}
                        </p>
                        <p className="text-xs text-gray-400">{inspection.inspectTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
