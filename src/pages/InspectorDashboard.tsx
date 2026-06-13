import { useNavigate } from 'react-router-dom';
import {
  ScanLine,
  CheckCircle,
  AlertTriangle,
  ListChecks,
  Clock,
  Store,
  MapPin,
  Volume2,
  Flame,
  ChevronRight,
} from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export default function InspectorDashboard() {
  const navigate = useNavigate();
  const { stalls, inspections, complaints, currentUser } = useAppStore();

  const todayInspections = inspections.filter(
    (i) => i.inspectorId === currentUser?.id && i.inspectTime.includes('2024-06-10')
  );

  const compliantCount = todayInspections.filter((i) => i.isCompliant).length;
  const nonCompliantCount = todayInspections.filter((i) => !i.isCompliant).length;

  const myComplaints = complaints.filter((c) => c.submitterId === currentUser?.id);

  return (
    <SidebarLayout role="inspector">
      <div className="space-y-6">
        {/* 扫码大按钮 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-8 text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full opacity-10 translate-y-1/2 -translate-x-1/3" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">开始巡查</h2>
              <p className="text-primary-100 mb-6">
                扫码查验摊位证照是否齐全、经营是否合规
              </p>
              <button
                onClick={() => navigate('/inspector/scan')}
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors flex items-center gap-3 shadow-lg"
              >
                <ScanLine className="w-6 h-6" />
                扫码查验
              </button>
            </div>
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse-soft">
                <ScanLine className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -inset-2 rounded-2xl border-2 border-white/30 animate-ping opacity-50" />
            </div>
          </div>
        </div>

        {/* 今日统计 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-50">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <ListChecks className="w-6 h-6 text-primary-500" />
            </div>
            <p className="text-3xl font-bold text-secondary-500">{todayInspections.length}</p>
            <p className="text-sm text-gray-500 mt-1">今日巡查</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-50">
            <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-success-500" />
            </div>
            <p className="text-3xl font-bold text-success-500">{compliantCount}</p>
            <p className="text-sm text-gray-500 mt-1">合规摊位</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-50">
            <div className="w-12 h-12 rounded-xl bg-danger-50 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-danger-500" />
            </div>
            <p className="text-3xl font-bold text-danger-500">{nonCompliantCount}</p>
            <p className="text-sm text-gray-500 mt-1">存在问题</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-50">
            <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center mb-3">
              <Volume2 className="w-6 h-6 text-warning-500" />
            </div>
            <p className="text-3xl font-bold text-warning-500">{myComplaints.length}</p>
            <p className="text-sm text-gray-500 mt-1">我的投诉</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 最近巡查 */}
          <div className="col-span-2 bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-secondary-500 text-lg">最近巡查记录</h3>
              <span className="text-sm text-gray-500">今日</span>
            </div>
            <div className="divide-y divide-gray-50">
              {todayInspections.length > 0 ? (
                todayInspections.slice(0, 5).map((inspection) => {
                  const stall = stalls.find((s) => s.id === inspection.stallId);
                  return (
                    <div
                      key={inspection.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/inspector/stall/${inspection.stallId}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            inspection.isCompliant ? 'bg-success-50' : 'bg-danger-50'
                          )}>
                            {inspection.isCompliant ? (
                              <CheckCircle className="w-5 h-5 text-success-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-danger-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-secondary-500">
                              {inspection.stallName || stall?.stallName}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {inspection.inspectTime}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无巡查记录</p>
                  <button
                    onClick={() => navigate('/inspector/scan')}
                    className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                  >
                    开始扫码巡查
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6">
              <h3 className="font-bold text-secondary-500 text-lg mb-4">快捷操作</h3>
              <div className="space-y-3">
                {[
                  { label: '扫码查验', icon: ScanLine, path: '/inspector/scan', color: 'text-primary-500 bg-primary-50' },
                  { label: '投诉记录', icon: Volume2, path: '/inspector/complaints', color: 'text-warning-500 bg-warning-50' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="w-full p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-sm transition-all flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-secondary-500">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-6 border border-secondary-200">
              <h4 className="font-bold text-secondary-600 mb-3">巡查提示</h4>
              <ul className="text-sm text-secondary-500 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 mt-1.5 flex-shrink-0" />
                  重点检查证照是否齐全有效
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 mt-1.5 flex-shrink-0" />
                  核实经营品类是否在许可范围内
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 mt-1.5 flex-shrink-0" />
                  发现噪音、油烟问题及时投诉
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 mt-1.5 flex-shrink-0" />
                  巡查记录请详细填写问题
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
