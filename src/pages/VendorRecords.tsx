import { useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Image as ImageIcon, Calendar, User } from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { certificateTypeNames, Certificate } from '@/types';
import { cn } from '@/lib/utils';

interface CertItemProps {
  cert: Certificate;
  isExpanded: boolean;
  onToggle: () => void;
}

function CertItem({ cert, isExpanded, onToggle }: CertItemProps) {
  const typeIcon = {
    business_license: FileText,
    food_permit: CheckCircle,
    health_cert: User,
    stall_photo: ImageIcon,
  }[cert.type];

  const Icon = typeIcon;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white transition-all duration-300 hover:shadow-card">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
      >
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          cert.status === 'approved' ? 'bg-success-50' :
          cert.status === 'rejected' ? 'bg-danger-50' :
          'bg-warning-50'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            cert.status === 'approved' ? 'text-success-500' :
            cert.status === 'rejected' ? 'text-danger-500' :
            'text-warning-500'
          )} />
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-semibold text-secondary-500">{cert.name}</h4>
          <p className="text-sm text-gray-500">提交时间：{cert.submitTime}</p>
        </div>
        <StatusTag status={cert.status} type="certificate" size="sm" />
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 animate-slide-down">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <img
                src={cert.imageUrl}
                alt={cert.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">证照名称</p>
                <p className="font-medium text-secondary-500">{cert.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">提交时间</p>
                <p className="font-medium text-secondary-500">{cert.submitTime}</p>
              </div>
              {cert.reviewTime && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">审核时间</p>
                  <p className="font-medium text-secondary-500">{cert.reviewTime}</p>
                </div>
              )}
              {cert.reviewer && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">审核人</p>
                  <p className="font-medium text-secondary-500">{cert.reviewer}</p>
                </div>
              )}
              {cert.rejectReason && (
                <div className="p-3 bg-danger-50 rounded-lg border border-danger-100">
                  <p className="text-sm text-danger-600 font-medium mb-1">退回原因</p>
                  <p className="text-sm text-danger-700">{cert.rejectReason}</p>
                </div>
              )}
              {cert.expiryDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">有效期至</p>
                  <p className="font-medium text-secondary-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {cert.expiryDate}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorRecords() {
  const { stalls, certificates, currentUser } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const vendorStalls = stalls.filter((s) => s.vendorId === currentUser?.id);
  const stall = vendorStalls[0];
  const stallCerts = certificates.filter((c) => c.stallId === stall?.id);

  const filteredCerts = stallCerts.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const counts = {
    all: stallCerts.length,
    pending: stallCerts.filter((c) => c.status === 'pending').length,
    approved: stallCerts.filter((c) => c.status === 'approved').length,
    rejected: stallCerts.filter((c) => c.status === 'rejected').length,
  };

  return (
    <SidebarLayout role="vendor">
      <div className="space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { key: 'all', label: '全部证照', count: counts.all, icon: FileText, color: 'text-secondary-500', bg: 'bg-secondary-50' },
            { key: 'pending', label: '待审核', count: counts.pending, icon: Clock, color: 'text-warning-500', bg: 'bg-warning-50' },
            { key: 'approved', label: '已通过', count: counts.approved, icon: CheckCircle, color: 'text-success-500', bg: 'bg-success-50' },
            { key: 'rejected', label: '已退回', count: counts.rejected, icon: XCircle, color: 'text-danger-500', bg: 'bg-danger-50' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = filter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as typeof filter)}
                className={cn(
                  'p-5 rounded-xl text-left transition-all duration-300',
                  isActive
                    ? 'bg-white shadow-card border border-primary-200'
                    : 'bg-white/50 border border-gray-100 hover:bg-white hover:shadow-card'
                )}
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', item.bg)}>
                  <Icon className={cn('w-5 h-5', item.color)} />
                </div>
                <p className="text-2xl font-bold text-secondary-500">{item.count}</p>
                <p className="text-sm text-gray-500 mt-1">{item.label}</p>
              </button>
            );
          })}
        </div>

        {/* 证照列表 */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-secondary-500 text-lg">
              {filter === 'all' && '全部证照记录'}
              {filter === 'pending' && '待审核证照'}
              {filter === 'approved' && '已通过证照'}
              {filter === 'rejected' && '已退回证照'}
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {filteredCerts.length > 0 ? (
              filteredCerts.map((cert) => (
                <CertItem
                  key={cert.id}
                  cert={cert}
                  isExpanded={expandedId === cert.id}
                  onToggle={() => setExpandedId(expandedId === cert.id ? null : cert.id)}
                />
              ))
            ) : (
              <div className="py-12 text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无记录</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
