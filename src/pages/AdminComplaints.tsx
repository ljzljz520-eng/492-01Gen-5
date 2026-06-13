import { useState } from 'react';
import {
  Volume2,
  Flame,
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  Clock,
  Send,
  Wrench,
} from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { ComplaintStatus, Complaint, complaintTypeNames } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminComplaints() {
  const { complaints, currentUser, updateComplaint, addRectification } = useAppStore();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ComplaintStatus>('all');
  const [handleNote, setHandleNote] = useState('');
  const [showRectifyModal, setShowRectifyModal] = useState(false);
  const [rectifyTitle, setRectifyTitle] = useState('');
  const [rectifyDesc, setRectifyDesc] = useState('');
  const [rectifyDeadline, setRectifyDeadline] = useState('');

  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
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

  const handleProcess = (status: ComplaintStatus) => {
    if (selectedComplaint && currentUser) {
      updateComplaint(selectedComplaint.id, status, currentUser.name, handleNote || undefined);
      setHandleNote('');
      setSelectedComplaint(null);
    }
  };

  const handleIssueRectification = () => {
    if (selectedComplaint && currentUser && rectifyTitle && rectifyDesc && rectifyDeadline) {
      addRectification({
        id: `rect_${Date.now()}`,
        stallId: selectedComplaint.stallId,
        stallName: selectedComplaint.stallName,
        type: selectedComplaint.type === 'other' ? 'other' : selectedComplaint.type,
        title: rectifyTitle,
        description: rectifyDesc,
        deadline: rectifyDeadline,
        status: 'pending',
        issuerId: currentUser.id,
        issuerName: currentUser.name,
        issueTime: new Date().toLocaleString('zh-CN'),
      });

      updateComplaint(selectedComplaint.id, 'processing', currentUser.name, '已下发整改通知');

      setShowRectifyModal(false);
      setRectifyTitle('');
      setRectifyDesc('');
      setRectifyDeadline('');
      setSelectedComplaint(null);
    }
  };

  const counts = {
    all: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    processing: complaints.filter((c) => c.status === 'processing').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
    closed: complaints.filter((c) => c.status === 'closed').length,
  };

  return (
    <SidebarLayout role="admin">
      <div className="space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { key: 'all', label: '全部投诉', count: counts.all, icon: AlertTriangle, color: 'text-secondary-500', bg: 'bg-secondary-50' },
            { key: 'pending', label: '待处理', count: counts.pending, icon: Clock, color: 'text-warning-500', bg: 'bg-warning-50' },
            { key: 'processing', label: '处理中', count: counts.processing, icon: MessageSquare, color: 'text-primary-500', bg: 'bg-primary-50' },
            { key: 'resolved', label: '已解决', count: counts.resolved, icon: CheckCircle, color: 'text-success-500', bg: 'bg-success-50' },
            { key: 'closed', label: '已关闭', count: counts.closed, icon: CheckCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = filterStatus === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setFilterStatus(item.key as typeof filterStatus)}
                className={cn(
                  'p-4 rounded-xl text-left transition-all duration-300',
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

        <div className="grid grid-cols-3 gap-6">
          {/* 投诉列表 */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <h3 className="font-bold text-secondary-500">投诉列表</h3>
              </div>
              <div className="h-[600px] overflow-y-auto p-3 space-y-2">
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((complaint) => {
                    const Icon = typeIcon[complaint.type];
                    const isSelected = selectedComplaint?.id === complaint.id;
                    return (
                      <button
                        key={complaint.id}
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setHandleNote('');
                        }}
                        className={cn(
                          'w-full p-4 rounded-xl text-left transition-all duration-200',
                          isSelected
                            ? 'bg-primary-50 border border-primary-200 shadow-sm'
                            : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm'
                        )}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                              typeColors[complaint.type]
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-secondary-500 truncate">
                              {complaint.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {complaint.stallName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">{complaint.submitTime}</p>
                          <StatusTag status={complaint.status} type="complaint" size="sm" />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-gray-400">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">暂无投诉记录</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 投诉详情 */}
          <div className="col-span-2">
            {selectedComplaint ? (
              <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center',
                          typeColors[selectedComplaint.type]
                        )}
                      >
                        {(() => {
                          const Icon = typeIcon[selectedComplaint.type];
                          return <Icon className="w-7 h-7" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-secondary-500">
                          {selectedComplaint.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {complaintTypeNames[selectedComplaint.type]} ·{' '}
                          {selectedComplaint.stallName}
                        </p>
                      </div>
                    </div>
                    <StatusTag
                      status={selectedComplaint.status}
                      type="complaint"
                    />
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="font-semibold text-secondary-500 mb-2">投诉描述</h4>
                    <p className="text-gray-600 bg-gray-50 rounded-xl p-4">
                      {selectedComplaint.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-secondary-500 mb-2">投诉人</h4>
                      <p className="text-gray-600">
                        {selectedComplaint.submitterName}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-500 mb-2">
                        投诉时间
                      </h4>
                      <p className="text-gray-600">
                        {selectedComplaint.submitTime}
                      </p>
                    </div>
                  </div>

                  {selectedComplaint.handlerName && (
                    <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                      <h4 className="font-semibold text-primary-700 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        处理记录
                      </h4>
                      <p className="text-primary-600 mb-2">
                        {selectedComplaint.handleNote}
                      </p>
                      <p className="text-xs text-primary-400">
                        处理人：{selectedComplaint.handlerName} ·{' '}
                        {selectedComplaint.handleTime}
                      </p>
                    </div>
                  )}

                  {/* 处理操作 */}
                  {selectedComplaint.status === 'pending' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-secondary-500">处理投诉</h4>
                      <textarea
                        value={handleNote}
                        onChange={(e) => setHandleNote(e.target.value)}
                        placeholder="输入处理意见..."
                        className="w-full h-24 p-4 border border-gray-200 rounded-xl resize-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowRectifyModal(true)}
                          className="flex-1 py-3 rounded-xl font-medium text-warning-600 bg-warning-50 hover:bg-warning-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Wrench className="w-5 h-5" />
                          下发整改通知
                        </button>
                        <button
                          onClick={() => handleProcess('resolved')}
                          className="flex-1 py-3 rounded-xl font-medium text-white bg-success-500 hover:bg-success-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          标记已解决
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedComplaint.status === 'processing' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-secondary-500">继续处理</h4>
                      <textarea
                        value={handleNote}
                        onChange={(e) => setHandleNote(e.target.value)}
                        placeholder="补充处理意见..."
                        className="w-full h-24 p-4 border border-gray-200 rounded-xl resize-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleProcess('resolved')}
                          className="flex-1 py-3 rounded-xl font-medium text-white bg-success-500 hover:bg-success-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          标记已解决
                        </button>
                        <button
                          onClick={() => handleProcess('closed')}
                          className="flex-1 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                          关闭投诉
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-card border border-gray-50">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>请选择一条投诉记录查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 下发整改通知弹窗 */}
      {showRectifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-bold text-secondary-500 mb-4">
              下发整改通知
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                整改标题
              </label>
              <input
                type="text"
                value={rectifyTitle}
                onChange={(e) => setRectifyTitle(e.target.value)}
                placeholder="请输入整改标题"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                整改要求
              </label>
              <textarea
                value={rectifyDesc}
                onChange={(e) => setRectifyDesc(e.target.value)}
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
                value={rectifyDeadline}
                onChange={(e) => setRectifyDeadline(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>
          </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRectifyModal(false);
                  setRectifyTitle('');
                  setRectifyDesc('');
                  setRectifyDeadline('');
                }}
                className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleIssueRectification}
                disabled={!rectifyTitle || !rectifyDesc || !rectifyDeadline}
                className={cn(
                  'flex-1 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2',
                  rectifyTitle && rectifyDesc && rectifyDeadline
                    ? 'text-white bg-primary-500 hover:bg-primary-600'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                )}
              >
                <Send className="w-4 h-4" />
                下发通知
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
