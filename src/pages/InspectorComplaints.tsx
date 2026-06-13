import { useState } from 'react';
import {
  Volume2,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
} from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { ComplaintStatus, ComplaintType, complaintTypeNames } from '@/types';
import { cn } from '@/lib/utils';

export default function InspectorComplaints() {
  const { complaints, currentUser, addComplaint } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<'all' | ComplaintStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newComplaint, setNewComplaint] = useState<{
    stallId: string;
    type: ComplaintType;
    title: string;
    description: string;
  }>({
    stallId: '',
    type: 'noise',
    title: '',
    description: '',
  });

  const myComplaints = complaints.filter((c) => c.submitterId === currentUser?.id);
  
  const filteredComplaints = myComplaints.filter((c) => {
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

  const { stalls } = useAppStore();

  const handleCreateComplaint = () => {
    if (currentUser && newComplaint.stallId && newComplaint.title && newComplaint.description) {
      const stall = stalls.find((s) => s.id === newComplaint.stallId);
      addComplaint({
        id: `comp_${Date.now()}`,
        stallId: newComplaint.stallId,
        stallName: stall?.stallName,
        type: newComplaint.type,
        title: newComplaint.title,
        description: newComplaint.description,
        status: 'pending',
        submitterId: currentUser.id,
        submitterName: currentUser.name,
        submitTime: new Date().toLocaleString('zh-CN'),
      });

      setShowCreateModal(false);
      setNewComplaint({
        stallId: '',
        type: 'noise',
        title: '',
        description: '',
      });
    }
  };

  const counts = {
    all: myComplaints.length,
    pending: myComplaints.filter((c) => c.status === 'pending').length,
    processing: myComplaints.filter((c) => c.status === 'processing').length,
    resolved: myComplaints.filter((c) => c.status === 'resolved').length,
    closed: myComplaints.filter((c) => c.status === 'closed').length,
  };

  return (
    <SidebarLayout role="inspector">
      <div className="space-y-6">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {([
              { key: 'all', label: '全部', count: counts.all },
              { key: 'pending', label: '待处理', count: counts.pending },
              { key: 'processing', label: '处理中', count: counts.processing },
              { key: 'resolved', label: '已解决', count: counts.resolved },
              { key: 'closed', label: '已关闭', count: counts.closed },
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
            新建投诉
          </button>
        </div>

        {/* 投诉列表 */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-secondary-500 text-lg">我的投诉记录</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => {
                const Icon = typeIcon[complaint.type];
                const isExpanded = expandedId === complaint.id;
                return (
                  <div key={complaint.id} className="hover:bg-gray-50 transition-colors">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
                      className="w-full p-6 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center',
                              typeColors[complaint.type]
                            )}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-secondary-500">
                              {complaint.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {complaint.stallName} · {complaintTypeNames[complaint.type]}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {complaint.submitTime}
                            </p>
                          </div>
                          <StatusTag
                            status={complaint.status}
                            type="complaint"
                            size="sm"
                          />
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 animate-slide-down">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <h5 className="font-medium text-secondary-500 mb-2">投诉描述</h5>
                          <p className="text-gray-600">{complaint.description}</p>
                        </div>

                        {complaint.handlerName && (
                          <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                            <h5 className="font-medium text-primary-700 mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              处理结果
                            </h5>
                            <p className="text-primary-600">{complaint.handleNote}</p>
                            <p className="text-xs text-primary-400 mt-2">
                              处理人：{complaint.handlerName} · {complaint.handleTime}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-gray-400">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">暂无投诉记录</p>
                <p className="text-sm">发现问题时及时提交投诉，维护夜市秩序</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 新建投诉弹窗 */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-500">
                新建投诉
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择摊位
                </label>
                <select
                  value={newComplaint.stallId}
                  onChange={(e) => setNewComplaint({ ...newComplaint, stallId: e.target.value })}
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
                  投诉类型
                </label>
                <div className="flex gap-2">
                  {(['noise', 'oil_smoke', 'other'] as const).map((type) => {
                    const Icon = typeIcon[type];
                    const isSelected = newComplaint.type === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setNewComplaint({ ...newComplaint, type })}
                        className={cn(
                          'flex-1 py-3 rounded-xl text-sm font-medium transition-colors flex flex-col items-center gap-1',
                          isSelected
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {complaintTypeNames[type]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  投诉标题
                </label>
                <input
                  type="text"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                  placeholder="请输入投诉标题"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  投诉描述
                </label>
                <textarea
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  placeholder="请详细描述投诉内容..."
                  className="w-full h-28 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
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
                onClick={handleCreateComplaint}
                disabled={
                  !newComplaint.stallId ||
                  !newComplaint.title ||
                  !newComplaint.description
                }
                className={cn(
                  'flex-1 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2',
                  newComplaint.stallId && newComplaint.title && newComplaint.description
                    ? 'text-white bg-primary-500 hover:bg-primary-600'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                )}
              >
                提交投诉
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
