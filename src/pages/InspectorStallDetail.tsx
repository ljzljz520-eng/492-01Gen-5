import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Store,
  MapPin,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Shield,
  Camera,
  Tag,
  Clock,
  Plus,
  Check,
  ArrowLeft,
  Volume2,
  Flame,
} from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import {
  certificateTypeNames,
  businessCategories,
  Inspection,
} from '@/types';
import { cn, checkStallCompliance, isCertificateValid } from '@/lib/utils';

export default function InspectorStallDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stalls, certificates, inspections, currentUser, addInspection, addComplaint } = useAppStore();

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintType, setComplaintType] = useState<'noise' | 'oil_smoke' | 'other'>('noise');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [showInspectConfirm, setShowInspectConfirm] = useState(false);
  const [inspectionIssues, setInspectionIssues] = useState<string[]>([]);
  const [inspectionNotes, setInspectionNotes] = useState('');

  const stall = stalls.find((s) => s.id === id);
  const stallCerts = certificates.filter((c) => c.stallId === id);
  const stallInspections = inspections.filter((i) => i.stallId === id).sort(
    (a, b) => new Date(b.inspectTime).getTime() - new Date(a.inspectTime).getTime()
  );

  const compliance = checkStallCompliance(stall, stallCerts);
  const isFullyCompliant = compliance.isFullyCompliant;

  const certTypeIcons: Record<string, React.ReactNode> = {
    business_license: <FileText className="w-5 h-5" />,
    food_permit: <Shield className="w-5 h-5" />,
    health_cert: <User className="w-5 h-5" />,
    stall_photo: <Camera className="w-5 h-5" />,
  };

  const handleSubmitComplaint = () => {
    if (stall && currentUser && complaintTitle && complaintDesc) {
      addComplaint({
        id: `comp_${Date.now()}`,
        stallId: stall.id,
        stallName: stall.stallName,
        type: complaintType,
        title: complaintTitle,
        description: complaintDesc,
        status: 'pending',
        submitterId: currentUser.id,
        submitterName: currentUser.name,
        submitTime: new Date().toLocaleString('zh-CN'),
      });

      setShowComplaintModal(false);
      setComplaintTitle('');
      setComplaintDesc('');
      setComplaintType('noise');
      alert('投诉已提交！');
    }
  };

  const handleConfirmInspection = () => {
    if (stall && currentUser) {
      const isCompliant = inspectionIssues.length === 0;
      const inspection: Inspection = {
        id: `ins_${Date.now()}`,
        stallId: stall.id,
        stallName: stall.stallName,
        inspectorId: currentUser.id,
        inspectorName: currentUser.name,
        inspectTime: new Date().toLocaleString('zh-CN'),
        isCompliant,
        issues: inspectionIssues.length > 0 ? inspectionIssues : undefined,
        notes: inspectionNotes || undefined,
      };
      addInspection(inspection);

      setShowInspectConfirm(false);
      setInspectionIssues([]);
      setInspectionNotes('');
      alert('巡查记录已提交！');
    }
  };

  const toggleIssue = (issue: string) => {
    setInspectionIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  if (!stall) {
    return (
      <SidebarLayout role="inspector">
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p>未找到该摊位信息</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout role="inspector">
      <div className="space-y-6">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-secondary-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        {/* 合规状态大卡片 */}
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl p-8 text-white',
            isFullyCompliant
              ? 'bg-gradient-to-br from-success-500 to-success-600'
              : 'bg-gradient-to-br from-danger-500 to-danger-600'
          )}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full opacity-10 translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {isFullyCompliant ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                  <span className="text-2xl font-bold">
                    {isFullyCompliant ? '经营合规' : '存在问题'}
                  </span>
                </div>
                <p className="text-white/80 mb-2">
                  有效证照 {compliance.validCertCount}/{compliance.totalCerts} 项
                </p>
                {compliance.reasons.length > 0 && (
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <ul className="text-sm text-white/90 space-y-1">
                      {compliance.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold mb-1">{stall.stallName}</h2>
                <p className="text-white/80">{stall.stallNumber}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-3 gap-4">
              <div>
                <p className="text-white/60 text-sm">摊主</p>
                <p className="font-medium mt-1">{stall.vendorName}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">位置</p>
                <p className="font-medium mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {stall.location}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">联系电话</p>
                <p className="font-medium mt-1 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {stall.vendorPhone}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 证照列表 */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h3 className="font-bold text-secondary-500 text-lg">证照详情</h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                {(['business_license', 'food_permit', 'health_cert', 'stall_photo'] as const).map(
                  (type) => {
                    const cert = stallCerts.find((c) => c.type === type);
                    return (
                      <div
                        key={type}
                        className={cn(
                          'p-4 rounded-xl border transition-all',
                          isCertificateValid(cert)
                            ? 'bg-success-50/50 border-success-200'
                            : cert?.status === 'pending'
                            ? 'bg-warning-50/50 border-warning-200'
                            : cert?.status === 'expired' || cert?.status === 'rejected'
                            ? 'bg-danger-50/50 border-danger-200'
                            : 'bg-gray-50 border-gray-200'
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center',
                              isCertificateValid(cert)
                                ? 'bg-success-100 text-success-600'
                                : cert?.status === 'pending'
                                ? 'bg-warning-100 text-warning-600'
                                : cert?.status === 'expired' || cert?.status === 'rejected'
                                ? 'bg-danger-100 text-danger-600'
                                : 'bg-gray-100 text-gray-400'
                            )}
                          >
                            {certTypeIcons[type]}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-secondary-500">
                              {certificateTypeNames[type]}
                            </p>
                          </div>
                          {cert ? (
                            <StatusTag status={cert.status} type="certificate" size="sm" />
                          ) : (
                            <span className="text-xs text-gray-400">未上传</span>
                          )}
                        </div>
                        {cert?.imageUrl && (
                          <img
                            src={cert.imageUrl}
                            alt={certificateTypeNames[type]}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        )}
                        {cert?.rejectReason && (
                          <p className="mt-2 text-xs text-danger-600 bg-danger-50 rounded p-2">
                            退回原因：{cert.rejectReason}
                          </p>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* 经营品类 */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-50">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-secondary-500 text-lg">经营品类</h3>
                <span className="text-sm text-gray-500">
                  已批准 {stall.allowedCategories.length} 项
                </span>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  {businessCategories.map((cat) => {
                    const isAllowed = stall.allowedCategories.includes(cat);
                    return (
                      <div
                        key={cat}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2',
                          isAllowed
                            ? 'bg-success-50 text-success-600 border border-success-200'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        )}
                      >
                        {isAllowed ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {cat}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 巡查记录 */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h3 className="font-bold text-secondary-500 text-lg">巡查记录</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {stallInspections.length > 0 ? (
                  stallInspections.slice(0, 5).map((inspection) => (
                    <div key={inspection.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {inspection.isCompliant ? (
                            <CheckCircle className="w-5 h-5 text-success-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-warning-500" />
                          )}
                          <span className="font-medium text-secondary-500">
                            {inspection.isCompliant ? '巡查正常' : '存在问题'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {inspection.inspectTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 ml-7">
                        巡查员：{inspection.inspectorName}
                      </p>
                      {inspection.issues && inspection.issues.length > 0 && (
                        <div className="mt-2 ml-7">
                          <p className="text-xs text-gray-500 mb-1">发现问题：</p>
                          <div className="flex flex-wrap gap-1">
                            {inspection.issues.map((issue) => (
                              <span
                                key={issue}
                                className="px-2 py-0.5 bg-warning-50 text-warning-600 rounded text-xs"
                              >
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {inspection.notes && (
                        <p className="text-sm text-gray-500 mt-2 ml-7">
                          备注：{inspection.notes}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>暂无巡查记录</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧操作区 */}
          <div className="space-y-6">
            {/* 快捷操作 */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-6">
              <h3 className="font-bold text-secondary-500 text-lg mb-4">快捷操作</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowInspectConfirm(true)}
                  className="w-full py-4 rounded-xl font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  记录本次巡查
                </button>
                <button
                  onClick={() => setShowComplaintModal(true)}
                  className="w-full py-4 rounded-xl font-medium text-danger-600 bg-danger-50 hover:bg-danger-100 transition-colors flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  提交投诉
                </button>
              </div>
            </div>

            {/* 投诉提示 */}
            <div className="bg-gradient-to-br from-warning-50 to-warning-100 rounded-2xl p-6 border border-warning-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning-200 flex items-center justify-center flex-shrink-0">
                  <Volume2 className="w-5 h-5 text-warning-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-warning-700 mb-1">重点检查项</h4>
                  <ul className="text-sm text-warning-600 space-y-1">
                    <li>• 证照是否在有效期内</li>
                    <li>• 是否超范围经营</li>
                    <li>• 噪音是否超标</li>
                    <li>• 油烟是否达标排放</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 巡查确认弹窗 */}
      {showInspectConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-bold text-secondary-500 mb-6">记录巡查结果</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  发现的问题（可多选，不选则为正常）
                </label>
                <div className="flex flex-wrap gap-2">
                  {['证照不全', '超范围经营', '噪音超标', '油烟污染', '占道经营', '卫生不达标'].map(
                    (issue) => {
                      const isSelected = inspectionIssues.includes(issue);
                      return (
                        <button
                          key={issue}
                          onClick={() => toggleIssue(issue)}
                          className={cn(
                            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            isSelected
                              ? 'bg-danger-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {isSelected ? <Check className="w-3 h-3 inline mr-1" /> : null}
                          {issue}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  巡查备注
                </label>
                <textarea
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="输入巡查备注..."
                  className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInspectConfirm(false);
                  setInspectionIssues([]);
                  setInspectionNotes('');
                }}
                className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmInspection}
                className="flex-1 py-2.5 rounded-xl font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 投诉弹窗 */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-bold text-secondary-500 mb-6">提交投诉</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  投诉类型
                </label>
                <div className="flex gap-2">
                  {([
                    { key: 'noise', label: '噪音扰民', icon: Volume2 },
                    { key: 'oil_smoke', label: '油烟污染', icon: Flame },
                    { key: 'other', label: '其他', icon: AlertTriangle },
                  ] as const).map((item) => {
                    const Icon = item.icon;
                    const isSelected = complaintType === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setComplaintType(item.key)}
                        className={cn(
                          'flex-1 py-3 rounded-xl text-sm font-medium transition-colors flex flex-col items-center gap-1',
                          isSelected
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
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
                  value={complaintTitle}
                  onChange={(e) => setComplaintTitle(e.target.value)}
                  placeholder="请输入投诉标题"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  投诉描述
                </label>
                <textarea
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="请详细描述投诉内容..."
                  className="w-full h-28 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowComplaintModal(false);
                  setComplaintTitle('');
                  setComplaintDesc('');
                }}
                className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitComplaint}
                disabled={!complaintTitle || !complaintDesc}
                className={cn(
                  'flex-1 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2',
                  complaintTitle && complaintDesc
                    ? 'text-white bg-danger-500 hover:bg-danger-600'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                )}
              >
                <Plus className="w-4 h-4" />
                提交投诉
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
