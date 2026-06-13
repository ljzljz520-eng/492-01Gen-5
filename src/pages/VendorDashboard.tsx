import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  Store,
  MapPin,
  Phone,
  ChevronRight,
  Bell,
} from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { certificateTypeNames } from '@/types';
import { cn } from '@/lib/utils';

interface CertCardProps {
  type: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  date: string;
}

function CertCard({ type, name, status, date }: CertCardProps) {
  const statusConfig = {
    approved: { icon: CheckCircle, color: 'text-success-500', bg: 'bg-success-50' },
    pending: { icon: Clock, color: 'text-warning-500', bg: 'bg-warning-50' },
    rejected: { icon: AlertCircle, color: 'text-danger-500', bg: 'bg-danger-50' },
    expired: { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      'p-5 rounded-xl border transition-all duration-300 hover:shadow-card hover:-translate-y-0.5',
      config.bg,
      'border-gray-100'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.bg)}>
          <Icon className={cn('w-6 h-6', config.color)} />
        </div>
        <StatusTag status={status} type="certificate" size="sm" />
      </div>
      <h4 className="font-semibold text-secondary-500 mb-1">{name}</h4>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
  );
}

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { stalls, certificates, complaints, rectifications, currentUser } = useAppStore();

  const vendorStalls = stalls.filter((s) => s.vendorId === currentUser?.id);
  const stall = vendorStalls[0];
  const stallCerts = certificates.filter((c) => c.stallId === stall?.id);
  const stallComplaints = complaints.filter((c) => c.stallId === stall?.id);
  const stallRectifications = rectifications.filter((r) => r.stallId === stall?.id);

  const pendingCerts = stallCerts.filter((c) => c.status === 'pending').length;
  const approvedCerts = stallCerts.filter((c) => c.status === 'approved').length;
  const activeRectifications = stallRectifications.filter(
    (r) => r.status === 'pending' || r.status === 'in_progress'
  ).length;

  const recentActivities = [
    { type: 'cert', title: '健康证提交审核', time: '2小时前', status: 'pending' },
    { type: 'complaint', title: '噪音投诉已处理', time: '昨天', status: 'resolved' },
    { type: 'rectification', title: '收到整改通知', time: '3天前', status: 'pending' },
  ];

  return (
    <SidebarLayout role="vendor">
      <div className="space-y-6">
        {/* 欢迎横幅 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 translate-y-1/2 -translate-x-1/3" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">您好，{currentUser?.name}！</h2>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs backdrop-blur-sm">
                {stall?.stallName || '待入驻'}
              </span>
            </div>
            <p className="text-primary-100">
              欢迎回到夜市证照管理系统，祝您生意兴隆！
            </p>
          </div>
        </div>

        {/* 摊位信息 */}
        {stall && (
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-secondary-500 text-lg">摊位信息</h3>
              <StatusTag status={stall.status} type="stall" size="sm" />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">摊位编号</p>
                  <p className="font-semibold text-secondary-500">{stall.stallNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-secondary-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">摊位位置</p>
                  <p className="font-semibold text-secondary-500">{stall.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-success-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">联系电话</p>
                  <p className="font-semibold text-secondary-500">{stall.vendorPhone}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-500 mb-2">经营品类</p>
              <div className="flex flex-wrap gap-2">
                {stall.allowedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 证照状态卡片 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-secondary-500 text-lg">证照状态</h3>
            <button
              onClick={() => navigate('/vendor/upload')}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
            >
              上传证照 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {(['business_license', 'food_permit', 'health_cert', 'stall_photo'] as const).map(
              (type) => {
                const cert = stallCerts.find((c) => c.type === type);
                return (
                  <CertCard
                    key={type}
                    type={type}
                    name={certificateTypeNames[type]}
                    status={cert?.status || 'pending'}
                    date={cert?.submitTime || '未上传'}
                  />
                );
              }
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 快捷入口 */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
            <h3 className="font-bold text-secondary-500 text-lg mb-4">快捷入口</h3>
            <div className="space-y-3">
              {[
                { label: '上传证照', icon: FileCheck, path: '/vendor/upload', color: 'text-primary-500' },
                { label: '审核记录', icon: Clock, path: '/vendor/records', color: 'text-secondary-500' },
                { label: '投诉整改', icon: Bell, path: '/vendor/complaints', color: 'text-warning-500' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors`}>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <span className="font-medium text-secondary-500">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </button>
                );

              })}
            </div>
          </div>

          {/* 待办提醒 */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-card border border-gray-50">
            <h3 className="font-bold text-secondary-500 text-lg mb-4">待办提醒</h3>
            <div className="space-y-3">
              {pendingCerts > 0 && (
                <div className="flex items-center gap-4 p-4 bg-warning-50 rounded-xl border border-warning-100">
                  <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-warning-700">证照待审核</p>
                    <p className="text-sm text-warning-600">您有 {pendingCerts} 个证照正在等待审核</p>
                  </div>
                  <span className="text-2xl font-bold text-warning-500">{pendingCerts}</span>
                </div>
              )}
              {activeRectifications > 0 && (
                <div className="flex items-center gap-4 p-4 bg-danger-50 rounded-xl border border-danger-100">
                  <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-danger-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-danger-700">待整改事项</p>
                    <p className="text-sm text-danger-600">您有 {activeRectifications} 项整改待完成</p>
                  </div>
                  <span className="text-2xl font-bold text-danger-500">{activeRectifications}</span>
                </div>
              )}
              {approvedCerts === 4 && (
                <div className="flex items-center gap-4 p-4 bg-success-50 rounded-xl border border-success-100">
                  <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-success-700">证照齐全</p>
                    <p className="text-sm text-success-600">您的所有证照均已通过审核</p>
                  </div>
                  <span className="text-2xl font-bold text-success-500">✓</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
