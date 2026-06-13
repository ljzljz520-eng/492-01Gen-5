import { useState } from 'react';
import {
  Volume2,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle,
  ChevronRight,
  Calendar,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { complaintTypeNames, rectificationStatusNames } from '@/types';
import { cn } from '@/lib/utils';

type TabType = 'complaints' | 'rectifications';

export default function VendorComplaints() {
  const { stalls, complaints, rectifications, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('complaints');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const vendorStalls = stalls.filter((s) => s.vendorId === currentUser?.id);
  const stall = vendorStalls[0];
  
  const stallComplaints = complaints.filter((c) => c.stallId === stall?.id);
  const stallRectifications = rectifications.filter((r) => r.stallId === stall?.id);

  const typeIcon = {
    noise: Volume2,
    oil_smoke: Flame,
    other: AlertTriangle,
  };

  return (
    <SidebarLayout role="vendor">
      <div className="space-y-6">
        {/* Tab切换 */}
        <div className="bg-white rounded-2xl p-2 shadow-card border border-gray-50 inline-flex">
          <button
            onClick={() => setActiveTab('complaints')}
            className={cn(
              'px-6 py-3 rounded-xl font-medium transition-all duration-200',
              activeTab === 'complaints'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            噪音油烟投诉
            {stallComplaints.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {stallComplaints.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('rectifications')}
            className={cn(
              'px-6 py-3 rounded-xl font-medium transition-all duration-200',
              activeTab === 'rectifications'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            整改通知
            {stallRectifications.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {stallRectifications.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'complaints' && (
          <div className="grid grid-cols-3 gap-6">
            {/* 投诉列表 */}
            <div className="col-span-1 space-y-3">
              <h3 className="font-bold text-secondary-500 text-lg mb-4">投诉记录</h3>
              {stallComplaints.length > 0 ? (
                stallComplaints.map((complaint) => {
                  const Icon = typeIcon[complaint.type];
                  const isSelected = selectedItem === complaint.id;
                  return (
                    <button
                      key={complaint.id}
                      onClick={() => setSelectedItem(complaint.id)}
                      className={cn(
                        'w-full p-4 rounded-xl text-left transition-all duration-200',
                        isSelected
                          ? 'bg-primary-50 border border-primary-200 shadow-sm'
                          : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-card'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                          complaint.type === 'noise' ? 'bg-warning-50 text-warning-500' :
                          complaint.type === 'oil_smoke' ? 'bg-danger-50 text-danger-500' :
                          'bg-gray-50 text-gray-500'
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-secondary-500 truncate">{complaint.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {complaint.submitTime}
                          </p>
                        </div>
                        <StatusTag status={complaint.status} type="complaint" size="sm" />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">
                  <Volume2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>暂无投诉记录</p>
                </div>
              )}
            </div>

            {/* 投诉详情 */}
            <div className="col-span-2">
              {selectedItem ? (
                <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
                  {(() => {
                    const complaint = stallComplaints.find((c) => c.id === selectedItem);
                    if (!complaint) return null;
                    const Icon = typeIcon[complaint.type];
                    return (
                      <>
                        <div className="p-6 border-b border-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                'w-14 h-14 rounded-xl flex items-center justify-center',
                                complaint.type === 'noise' ? 'bg-warning-50 text-warning-500' :
                                complaint.type === 'oil_smoke' ? 'bg-danger-50 text-danger-500' :
                                'bg-gray-50 text-gray-500'
                              )}>
                                <Icon className="w-7 h-7" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-secondary-500">{complaint.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {complaintTypeNames[complaint.type]} · {complaint.stallName}
                                </p>
                              </div>
                            </div>
                            <StatusTag status={complaint.status} type="complaint" />
                          </div>
                        </div>

                        <div className="p-6 space-y-6">
                          <div>
                            <h4 className="font-semibold text-secondary-500 mb-2">投诉描述</h4>
                            <p className="text-gray-600 bg-gray-50 rounded-xl p-4">
                              {complaint.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-secondary-500 mb-2">投诉人</h4>
                              <p className="text-gray-600">{complaint.submitterName}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-secondary-500 mb-2">投诉时间</h4>
                              <p className="text-gray-600 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {complaint.submitTime}
                              </p>
                            </div>
                          </div>

                          {complaint.handlerName && (
                            <div className="p-4 bg-success-50 rounded-xl border border-success-100">
                              <h4 className="font-semibold text-success-700 mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                处理结果
                              </h4>
                              <p className="text-success-600 mb-2">{complaint.handleNote}</p>
                              <p className="text-xs text-success-500">
                                处理人：{complaint.handlerName} · {complaint.handleTime}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-card border border-gray-50">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>请选择一条投诉记录查看详情</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rectifications' && (
          <div className="space-y-4">
            <h3 className="font-bold text-secondary-500 text-lg">整改通知</h3>
            {stallRectifications.length > 0 ? (
              <div className="space-y-4">
                {stallRectifications.map((rect) => (
                  <div
                    key={rect.id}
                    className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden hover:shadow-card-hover transition-shadow"
                  >
                    <div className="p-6 border-b border-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center',
                            rect.status === 'verified' ? 'bg-success-50' :
                            rect.status === 'completed' ? 'bg-primary-50' :
                            rect.status === 'in_progress' ? 'bg-warning-50' :
                            'bg-danger-50'
                          )}>
                            <FileCheck className={cn(
                              'w-6 h-6',
                              rect.status === 'verified' ? 'text-success-500' :
                              rect.status === 'completed' ? 'text-primary-500' :
                              rect.status === 'in_progress' ? 'text-warning-500' :
                              'text-danger-500'
                            )} />
                          </div>
                          <div>
                            <h4 className="font-bold text-secondary-500 text-lg">{rect.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              下发时间：{rect.issueTime} · 下发人：{rect.issuerName}
                            </p>
                          </div>
                        </div>
                        <StatusTag status={rect.status} type="rectification" />
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-gray-600 mb-4">{rect.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          整改期限：{rect.deadline}
                        </span>
                      </div>

                      {/* 整改进度时间线 */}
                      <div className="flex items-center gap-2 mt-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-success-500" />
                          </div>
                          <span className="text-sm text-success-600 font-medium">下发通知</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-gray-200">
                          <div
                            className={cn(
                              'h-full transition-all duration-500',
                              rect.status !== 'pending' ? 'bg-success-500 w-full' : 'w-0'
                            )}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const status = rect.status;
                            const isActive = status === 'in_progress' || status === 'completed';
                            const isDone = status === 'completed' || status === 'verified';
                            return (
                              <>
                                <div className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center',
                                  isDone ? 'bg-success-100' :
                                  isActive ? 'bg-warning-100' : 'bg-gray-100'
                                )}>
                                  {isDone ? (
                                    <CheckCircle className="w-4 h-4 text-success-500" />
                                  ) : (
                                    <Clock className={cn(
                                      'w-4 h-4',
                                      isActive ? 'text-warning-500' : 'text-gray-400'
                                    )} />
                                  )}
                                </div>
                                <span className={cn(
                                  'text-sm font-medium',
                                  isDone ? 'text-success-600' :
                                  isActive ? 'text-warning-600' : 'text-gray-400'
                                )}>
                                  整改中
                                </span>
                              </>
                            );
                          })()}
                        </div>
                        <div className="flex-1 h-0.5 bg-gray-200">
                          {(() => {
                            const status = rect.status;
                            const progress = 
                              status === 'verified' ? 'w-full bg-success-500' :
                              status === 'completed' || status === 'in_progress' ? 'w-1/2 bg-warning-500' :
                              'w-0';
                            return (
                              <div
                                className={cn(
                                  'h-full transition-all duration-500',
                                  progress
                                )}
                              />
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            rect.status === 'verified' ? 'bg-success-100' : 'bg-gray-100'
                          )}>
                            {rect.status === 'verified' ? (
                              <CheckCircle className="w-4 h-4 text-success-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <span className={cn(
                            'text-sm font-medium',
                            rect.status === 'verified' ? 'text-success-600' : 'text-gray-400'
                          )}>
                            验收完成
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 反馈区域 */}
                    {rect.vendorFeedback && (
                      <div className="px-6 pb-6">
                        <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                          <h5 className="font-medium text-primary-700 mb-2">您的反馈</h5>
                          <p className="text-primary-600 text-sm">{rect.vendorFeedback}</p>
                          <p className="text-xs text-primary-400 mt-2">{rect.feedbackTime}</p>
                        </div>
                      </div>
                    )}

                    {/* 验收结果 */}
                    {rect.verifyNote && (
                      <div className="px-6 pb-6">
                        <div className="p-4 bg-success-50 rounded-xl border border-success-100">
                          <h5 className="font-medium text-success-700 mb-2">验收结果</h5>
                          <p className="text-success-600 text-sm">{rect.verifyNote}</p>
                          <p className="text-xs text-success-400 mt-2">
                            验收人：{rect.issuerName} · {rect.verifyTime}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-card border border-gray-50">
                <FileCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>暂无整改通知</p>
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
