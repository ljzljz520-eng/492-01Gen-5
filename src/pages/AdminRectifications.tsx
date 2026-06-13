import { useState } from 'react';
import {
  Wrench,
  Flame,
  Volume2,
  AlertTriangle,
  Clock,
  CheckCircle,
  Store,
  Calendar,
  MessageSquare,
  FileCheck,
  Plus,
  X,
} from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import {
  RectificationStatus,
  rectificationTypeNames,
  Rectification,
  RectificationType,
} from '@/types';
import { cn } from '@/lib/utils';

export default function AdminRectifications() {
  const { rectifications, stalls, currentUser, updateRectification } = useAppStore();
  const [selectedRect, setSelectedRect] = useState<Rectification | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | RectificationStatus>('all');
  const [verifyNote, setVerifyNote] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRect, setNewRect] = useState<{
    stallId: string;
    type: RectificationType;
    title: string;
    description: string;
    deadline: string;
  }>({
    stallId: '',
    type: 'oil_smoke',
    title: '',
    description: '',
    deadline: '',
  });

  const filteredRectifications = rectifications.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const typeIcon = {
    noise: Volume2,
    oil_smoke: Flame,
    other: AlertTriangle,
  };

  const typeColors = {
    noise: 'text-warning-500 bg-warning-50',
    oil_smoke: 'text-danger-500 bg-danger-50',
    other: 'text-gray-500 bg-gray-50',
  };

  const counts = {
    all: rectifications.length,
    pending: rectifications.filter((r) => r.status === 'pending').length,
    in_progress: rectifications.filter((r) => r.status === 'in_progress').length,
    completed: rectifications.filter((r) => r.status === 'completed').length,
    verified: rectifications.filter((r) => r.status === 'verified').length,
  };

  const handleVerify = (status: 'verified') => {
    if (selectedRect && currentUser) {
      updateRectification(selectedRect.id, {
        status,
        verifierId: currentUser.id,
        verifyNote: verifyNote || undefined,
        verifyTime: new Date().toLocaleString('zh-CN'),
      });
      setVerifyNote('');
      setSelectedRect(null);
    }
  };

  const handleCreate = () => {
    if (currentUser && newRect.stallId && newRect.title && newRect.description && newRect.deadline) {
      const stall = stalls.find((s) => s.id === newRect.stallId);
      const rect: Rectification = {
        id: `rect_${Date.now()}`,
        stallId: newRect.stallId,
        stallName: stall?.stallName,
        type: newRect.type,
        title: newRect.title,
        description: newRect.description,
        deadline: newRect.deadline,
        status: 'pending',
        issuerId: currentUser.id,
        issuerName: currentUser.name,
        issueTime: new Date().toLocaleString('zh-CN'),
      };
      
      // 需要addRectification，但store中没有这个方法，让我检查一下
      // 实际上store里有addRectification，我来使用它
      useAppStore.getState().addRectification(rect);
      
      setShowCreateModal(false);
      setNewRect({
        stallId: '',
        type: 'oil_smoke',
        title: '',
        description: '',
        deadline: '',
      });
    }
  };

  return (
    <SidebarLayout role="admin">
      <div className="space-y-6">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {([
              { key: 'all', label: '全部', count: counts.all },
              { key: 'pending', label: '待整改', count: counts.pending },
              { key: 'in_progress', label: '整改中', count: counts.in_progress },
              { key: 'completed', label: '待验收', count: counts.completed },
              { key: 'verified', label: '已验收', count: counts.verified },
            ] as const).map((item) => (
              <button
                key={item.key}
                onClick={() => setFilterStatus(item.key as typeof filterStatus)}
                className={cn(
                  'px-4 py-2 rounded-xl font-medium transition-colors',
                  filterStatus === item.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {item.label}
                <span className="ml-1 opacity-75">{item.count}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新建整改通知
          </button>
        </div>

        {/* 整改卡片列表 */}
        <div className="grid grid-cols-2 gap-6">
          {filteredRectifications.length > 0 ? (
            filteredRectifications.map((rect) => {
              const Icon = typeIcon[rect.type];
              const stall = stalls.find((s) => s.id === rect.stallId);
              const isSelected = selectedRect?.id === rect.id;
              return (
                <div
                  key={rect.id}
                  onClick={() => {
                    setSelectedRect(rect);
                    setVerifyNote('');
                  }}
                  className={cn(
                    'bg-white rounded-2xl shadow-card border cursor-pointer transition-all duration-300 overflow-hidden hover:shadow-card-hover',
                    isSelected ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-50'
                  )}
                >
                  <div className="p-6 border-b border-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', typeColors[rect.type])}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-secondary-500">{rect.title}</h4>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Store className="w-4 h-4" />
                            {rect.stallName || stall?.stallName}
                          </p>
                        </div>
                      </div>
                      <StatusTag status={rect.status} type="rectification" />
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {rect.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        整改期限：{rect.deadline}
                      </span>
                      <span className="text-gray-400">
                        {rectificationTypeNames[rect.type as keyof typeof rectificationTypeNames]}
                      </span>
                    </div>

                    {/* 进度条 */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>整改进度</span>
                        <span>
                          {rect.status === 'verified'
                            ? '100%'
                            : rect.status === 'completed'
                            ? '75%'
                            : rect.status === 'in_progress'
                            ? '50%'
                            : '25%'}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            rect.status === 'verified'
                              ? 'bg-success-500 w-full'
                              : rect.status === 'completed'
                              ? 'bg-primary-500 w-3/4'
                              : rect.status === 'in_progress'
                              ? 'bg-warning-500 w-1/2'
                              : 'bg-danger-400 w-1/4'
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-gray-400 shadow-card border border-gray-50">
              <Wrench className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>暂无整改记录</p>
            </div>
          )}
        </div>

        {/* 整改详情弹窗 */}
        {selectedRect && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedRect(null)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-50 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-secondary-500">
                    {selectedRect.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedRect.stallName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRect(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <StatusTag status={selectedRect.status} type="rectification" />
                  <span className="text-sm text-gray-500">
                    下发时间：{selectedRect.issueTime}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary-500 mb-2">整改要求</h4>
                  <p className="text-gray-600 bg-gray-50 rounded-xl p-4">
                    {selectedRect.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">整改期限</p>
                    <p className="font-medium text-secondary-500 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-warning-500" />
                      {selectedRect.deadline}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">下发人</p>
                    <p className="font-medium text-secondary-500">{selectedRect.issuerName}</p>
                  </div>
                </div>

                {selectedRect.vendorFeedback && (
                  <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                    <h4 className="font-semibold text-primary-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      摊主反馈
                    </h4>
                    <p className="text-primary-600">{selectedRect.vendorFeedback}</p>
                    <p className="text-xs text-primary-400 mt-2">
                      反馈时间：{selectedRect.feedbackTime}
                    </p>
                  </div>
                )}

                {selectedRect.verifyNote && (
                  <div className="p-4 bg-success-50 rounded-xl border border-success-100">
                    <h4 className="font-semibold text-success-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      验收结果
                    </h4>
                    <p className="text-success-600">{selectedRect.verifyNote}</p>
                    <p className="text-xs text-success-400 mt-2">
                      验收人：{selectedRect.issuerName} · {selectedRect.verifyTime}
                    </p>
                  </div>
                )}

                {/* 验收操作 */}
                {selectedRect.status === 'completed' && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-secondary-500">验收整改</h4>
                    <textarea
                      value={verifyNote}
                      onChange={(e) => setVerifyNote(e.target.value)}
                      placeholder="请输入验收意见..."
                      className="w-full h-24 p-4 border border-gray-200 rounded-xl resize-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVerify('verified')}
                        className="flex-1 py-3 rounded-xl font-medium text-white bg-success-500 hover:bg-success-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        通过验收
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 新建整改弹窗 */}
        {showCreateModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-secondary-500 mb-6">
                新建整改通知
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择摊位
                  </label>
                  <select
                    value={newRect.stallId}
                    onChange={(e) => setNewRect({ ...newRect, stallId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  >
                    <option value="">请选择摊位</option>
                    {stalls.map((stall) => (
                      <option key={stall.id} value={stall.id}>
                        {stall.stallName} ({stall.stallNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    整改类型
                  </label>
                  <div className="flex gap-2">
                    {(['oil_smoke', 'noise', 'other'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewRect({ ...newRect, type })}
                        className={cn(
                          'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
                          newRect.type === type
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        {rectificationTypeNames[type as keyof typeof rectificationTypeNames]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    整改标题
                  </label>
                  <input
                    type="text"
                    value={newRect.title}
                    onChange={(e) => setNewRect({ ...newRect, title: e.target.value })}
                    placeholder="请输入整改标题"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    整改要求
                  </label>
                  <textarea
                    value={newRect.description}
                    onChange={(e) => setNewRect({ ...newRect, description: e.target.value })}
                    placeholder="请详细描述整改要求..."
                    className="w-full h-28 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    整改期限
                  </label>
                  <input
                    type="date"
                    value={newRect.deadline}
                    onChange={(e) => setNewRect({ ...newRect, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  disabled={
                    !newRect.stallId ||
                    !newRect.title ||
                    !newRect.description ||
                    !newRect.deadline
                  }
                  className={cn(
                    'flex-1 py-2.5 rounded-xl font-medium transition-colors',
                    newRect.stallId && newRect.title && newRect.description && newRect.deadline
                      ? 'text-white bg-primary-500 hover:bg-primary-600'
                      : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                  )}
                >
                  下发通知
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
