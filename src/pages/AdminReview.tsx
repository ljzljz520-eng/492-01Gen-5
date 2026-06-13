import { useState } from 'react';
import {
  FileCheck,
  Check,
  X,
  AlertTriangle,
  Store,
  User,
  Clock,
  Search,
  Filter,
  ChevronDown,
  Tag,
} from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import {
  certificateTypeNames,
  Certificate,
  businessCategories,
  CertificateStatus,
} from '@/types';
import { cn } from '@/lib/utils';

export default function AdminReview() {
  const {
    stalls,
    certificates,
    currentUser,
    updateCertificateStatus,
    updateStallAllowedCategories,
  } = useAppStore();

  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | CertificateStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [tempCategories, setTempCategories] = useState<string[]>([]);

  const filteredCerts = certificates.filter((cert) => {
    if (filterStatus !== 'all' && cert.status !== filterStatus) return false;
    const stall = stalls.find((s) => s.id === cert.stallId);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        stall?.stallName.toLowerCase().includes(term) ||
        cert.name.toLowerCase().includes(term) ||
        stall?.stallNumber.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const selectedCert = certificates.find((c) => c.id === selectedCertId);
  const selectedStall = stalls.find((s) => s.id === selectedCert?.stallId);
  const stallCerts = certificates.filter((c) => c.stallId === selectedStall?.id);

  const handleApprove = () => {
    if (selectedCert && currentUser) {
      updateCertificateStatus(selectedCert.id, 'approved', currentUser.name);
    }
  };

  const handleReject = () => {
    if (selectedCert && currentUser && rejectReason.trim()) {
      updateCertificateStatus(selectedCert.id, 'rejected', currentUser.name, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  const handleOpenCategoryModal = () => {
    if (selectedStall) {
      setTempCategories([...selectedStall.allowedCategories]);
      setShowCategoryModal(true);
    }
  };

  const handleSaveCategories = () => {
    if (selectedStall) {
      updateStallAllowedCategories(selectedStall.id, tempCategories);
      setShowCategoryModal(false);
    }
  };

  const toggleTempCategory = (category: string) => {
    setTempCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <SidebarLayout role="admin">
      <div className="h-[calc(100vh-140px)] flex gap-6">
        {/* 左侧列表 */}
        <div className="w-96 bg-white rounded-2xl shadow-card border border-gray-50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-50 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索摊位名称、证照..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    filterStatus === status
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {status === 'all' && '全部'}
                  {status === 'pending' && '待审核'}
                  {status === 'approved' && '已通过'}
                  {status === 'rejected' && '已退回'}
                  <span className="ml-1 opacity-75">
                    {status === 'all'
                      ? certificates.length
                      : certificates.filter((c) => c.status === status).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredCerts.length > 0 ? (
              filteredCerts.map((cert) => {
                const stall = stalls.find((s) => s.id === cert.stallId);
                const isSelected = selectedCertId === cert.id;
                return (
                  <button
                    key={cert.id}
                    onClick={() => setSelectedCertId(cert.id)}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all duration-200',
                      isSelected
                        ? 'bg-primary-50 border border-primary-200 shadow-sm'
                        : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-secondary-500">
                          {stall?.stallName || '未知摊位'}
                        </span>
                      </div>
                      <StatusTag status={cert.status} type="certificate" size="sm" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{cert.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {cert.submitTime}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="py-12 text-center text-gray-400">
                <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无证照记录</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧详情 */}
        <div className="flex-1 bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden flex flex-col">
          {selectedCert && selectedStall ? (
            <>
              {/* 详情头部 */}
              <div className="p-6 border-b border-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-secondary-500 mb-1">
                      {selectedCert.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedStall.stallName} · {selectedStall.stallNumber} · {selectedStall.location}
                    </p>
                  </div>
                  <StatusTag status={selectedCert.status} type="certificate" />
                </div>
              </div>

              {/* 详情内容 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 证照图片 */}
                <div>
                  <h4 className="font-semibold text-secondary-500 mb-3">证照照片</h4>
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={selectedCert.imageUrl}
                      alt={selectedCert.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>

                {/* 证照信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">证照类型</p>
                    <p className="font-medium text-secondary-500">{selectedCert.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">提交时间</p>
                    <p className="font-medium text-secondary-500">{selectedCert.submitTime}</p>
                  </div>
                  {selectedCert.reviewTime && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">审核时间</p>
                      <p className="font-medium text-secondary-500">{selectedCert.reviewTime}</p>
                    </div>
                  )}
                  {selectedCert.reviewer && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">审核人</p>
                      <p className="font-medium text-secondary-500">{selectedCert.reviewer}</p>
                    </div>
                  )}
                  {selectedCert.certificateNumber && (
                    <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                      <p className="text-sm text-gray-500 mb-1">证照编号</p>
                      <p className="font-medium text-secondary-500">{selectedCert.certificateNumber}</p>
                    </div>
                  )}
                </div>

                {/* 退回原因 */}
                {selectedCert.rejectReason && (
                  <div className="p-4 bg-danger-50 rounded-xl border border-danger-100">
                    <h4 className="font-semibold text-danger-700 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      退回原因
                    </h4>
                    <p className="text-danger-600">{selectedCert.rejectReason}</p>
                  </div>
                )}

                {/* 摊位信息 */}
                <div>
                  <h4 className="font-semibold text-secondary-500 mb-3">摊位信息</h4>
                  <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                        <Store className="w-6 h-6 text-primary-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-500">{selectedStall.stallName}</p>
                        <p className="text-sm text-gray-500">{selectedStall.stallNumber}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">摊主：</span>
                        <span className="text-secondary-500">{selectedStall.vendorName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">电话：</span>
                        <span className="text-secondary-500">{selectedStall.vendorPhone}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">位置：</span>
                        <span className="text-secondary-500">{selectedStall.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 经营品类 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-secondary-500">经营品类</h4>
                    <button
                      onClick={handleOpenCategoryModal}
                      className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
                    >
                      <Tag className="w-4 h-4" />
                      限制品类
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedStall.allowedCategories.length > 0 ? (
                      selectedStall.allowedCategories.map((cat) => (
                        <span
                          key={cat}
                          className="px-3 py-1.5 bg-success-50 text-success-600 rounded-full text-sm font-medium"
                        >
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">暂无经营品类</span>
                    )}
                  </div>
                </div>

                {/* 该摊位其他证照 */}
                <div>
                  <h4 className="font-semibold text-secondary-500 mb-3">该摊位其他证照</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {stallCerts
                      .filter((c) => c.id !== selectedCert.id)
                      .map((cert) => (
                        <div
                          key={cert.id}
                          onClick={() => setSelectedCertId(cert.id)}
                          className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <p className="text-sm font-medium text-secondary-500 mb-1">{cert.name}</p>
                          <StatusTag status={cert.status} type="certificate" size="sm" />
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* 审核操作按钮 */}
              {selectedCert.status === 'pending' && (
                <div className="p-6 border-t border-gray-50 flex gap-4">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 py-3 rounded-xl font-medium text-danger-600 bg-danger-50 hover:bg-danger-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    退回补充
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex-1 py-3 rounded-xl font-medium text-white bg-success-500 hover:bg-success-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    通过审核
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FileCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>请选择一个证照进行审核</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 退回弹窗 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-bold text-secondary-500 mb-4">退回原因</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请输入退回原因，以便摊主补充材料..."
              className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className={cn(
                  'flex-1 py-2.5 rounded-xl font-medium transition-colors',
                  rejectReason.trim()
                    ? 'text-white bg-danger-500 hover:bg-danger-600'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                )}
              >
                确认退回
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 限制品类弹窗 */}
      {showCategoryModal && selectedStall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-slide-up">
            <h3 className="text-xl font-bold text-secondary-500 mb-2">设置经营品类</h3>
            <p className="text-sm text-gray-500 mb-4">
              选择允许该摊位经营的品类，取消勾选即限制该品类
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {businessCategories.map((category) => {
                const isSelected = tempCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => toggleTempCategory(category)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      isSelected
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {isSelected ? (
                      <Check className="w-3 h-3 inline mr-1" />
                    ) : (
                      <X className="w-3 h-3 inline mr-1 opacity-50" />
                    )}
                    {category}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveCategories}
                className="flex-1 py-2.5 rounded-xl font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
