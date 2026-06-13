import { useState } from 'react';
import {
  Store,
  Search,
  Filter,
  Phone,
  MapPin,
  Tag,
  ChevronRight,
  Eye,
} from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { Stall, StallStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminStalls() {
  const { stalls, certificates } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | StallStatus>('all');
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);

  const filteredStalls = stalls.filter((stall) => {
    if (filterStatus !== 'all' && stall.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        stall.stallName.toLowerCase().includes(term) ||
        stall.vendorName.toLowerCase().includes(term) ||
        stall.stallNumber.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const getStallCertCount = (stallId: string) => {
    const certs = certificates.filter((c) => c.stallId === stallId);
    const approved = certs.filter((c) => c.status === 'approved').length;
    return { total: certs.length, approved };
  };

  return (
    <SidebarLayout role="admin">
      <div className="space-y-6">
        {/* 搜索和筛选 */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索摊位名称、摊主、编号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'pending', 'suspended'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  'px-4 py-3 rounded-xl font-medium transition-colors',
                  filterStatus === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {status === 'all' && '全部'}
                {status === 'active' && '经营中'}
                {status === 'pending' && '待审核'}
                {status === 'suspended' && '已停业'}
              </button>
            ))}
          </div>
        </div>

        {/* 摊位列表 */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-secondary-500 text-lg">摊位列表</h3>
            <span className="text-sm text-gray-500">共 {filteredStalls.length} 个摊位</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">摊位信息</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">摊主信息</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">位置</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">经营品类</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">证照情况</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStalls.map((stall) => {
                  const certInfo = getStallCertCount(stall.id);
                  return (
                    <tr
                      key={stall.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                            <Store className="w-5 h-5 text-primary-500" />
                          </div>
                          <div>
                            <p className="font-medium text-secondary-500">{stall.stallName}</p>
                            <p className="text-xs text-gray-500">{stall.stallNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-secondary-500">{stall.vendorName}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {stall.vendorPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {stall.location}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {stall.allowedCategories.slice(0, 3).map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-xs"
                            >
                              {cat}
                            </span>
                          ))}
                          {stall.allowedCategories.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                              +{stall.allowedCategories.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                              style={{ width: `${(certInfo.approved / 4) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {certInfo.approved}/4
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusTag status={stall.status} type="stall" size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedStall(stall)}
                          className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
                        >
                          查看详情
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 摊位详情弹窗 */}
        {selectedStall && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedStall(null)}
          >
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-lg animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-secondary-500">
                    {selectedStall.stallName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedStall.stallNumber}</p>
                </div>
                <StatusTag status={selectedStall.status} type="stall" />
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">摊主姓名</p>
                    <p className="font-medium text-secondary-500">{selectedStall.vendorName}</p>
                  </div>
                  <div className="flex-1 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">联系电话</p>
                    <p className="font-medium text-secondary-500">{selectedStall.vendorPhone}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">摊位位置</p>
                  <p className="font-medium text-secondary-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    {selectedStall.location}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">经营品类</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStall.allowedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedStall.description && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-2">摊位介绍</p>
                    <p className="text-secondary-500">{selectedStall.description}</p>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={() => setSelectedStall(null)}
                    className="w-full py-3 rounded-xl font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
