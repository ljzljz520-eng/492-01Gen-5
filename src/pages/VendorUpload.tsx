import { useState } from 'react';
import { Upload, X, Image as ImageIcon, FileText, Shield, User, Camera, Plus, CheckCircle } from 'lucide-react';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store/useAppStore';
import { certificateTypeNames, businessCategories, CertificateType } from '@/types';
import { cn } from '@/lib/utils';

const certInfo: Record<CertificateType, { icon: typeof FileText; color: string; bgColor: string; desc: string }> = {
  business_license: { icon: FileText, color: 'text-primary-500', bgColor: 'bg-primary-50', desc: '营业执照照片' },
  food_permit: { icon: Shield, color: 'text-success-500', bgColor: 'bg-success-50', desc: '食品经营许可证' },
  health_cert: { icon: User, color: 'text-secondary-500', bgColor: 'bg-secondary-50', desc: '从业人员健康证' },
  stall_photo: { icon: Camera, color: 'text-warning-500', bgColor: 'bg-warning-50', desc: '摊位实景照片' },
};

export default function VendorUpload() {
  const { stalls, certificates, currentUser, addCertificate } = useAppStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<CertificateType | null>(null);

  const vendorStalls = stalls.filter((s) => s.vendorId === currentUser?.id);
  const stall = vendorStalls[0];
  const stallCerts = certificates.filter((c) => c.stallId === stall?.id);

  const handleFileUpload = (type: CertificateType, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(type);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImages((prev) => ({ ...prev, [type]: imageUrl }));
        setUploading(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (type: CertificateType, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploading(type);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImages((prev) => ({ ...prev, [type]: imageUrl }));
        setUploading(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const removeImage = (type: CertificateType) => {
    setUploadedImages((prev) => {
      const newImages = { ...prev };
      delete newImages[type];
      return newImages;
    });
  };

  const handleSubmit = () => {
    if (!stall) return;
    
    Object.entries(uploadedImages).forEach(([type, imageUrl]) => {
      const newCert = {
        id: `cert_${Date.now()}_${type}`,
        stallId: stall.id,
        type: type as CertificateType,
        name: certificateTypeNames[type as CertificateType],
        imageUrl,
        status: 'pending' as const,
        submitTime: new Date().toLocaleString('zh-CN'),
      };
      addCertificate(newCert);
    });

    setUploadedImages({});
    alert('证照提交成功，等待管理员审核！');
  };

  const canSubmit = Object.keys(uploadedImages).length > 0;

  return (
    <SidebarLayout role="vendor">
      <div className="space-y-6">
        {/* 上传说明 */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-2xl p-6 border border-primary-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Upload className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h3 className="font-bold text-secondary-500 text-lg mb-1">证照上传须知</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 请上传清晰的证照照片，确保文字内容可辨认</li>
                <li>• 营业执照、食品经营许可证、健康证均需在有效期内</li>
                <li>• 摊位照片需展示摊位全貌及周边环境</li>
                <li>• 审核通常在1-3个工作日内完成</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 证照上传区 */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
          <h3 className="font-bold text-secondary-500 text-lg mb-6">上传证照</h3>
          <div className="grid grid-cols-2 gap-6">
            {(Object.keys(certInfo) as CertificateType[]).map((type) => {
              const info = certInfo[type];
              const Icon = info.icon;
              const existingCert = stallCerts.find((c) => c.type === type);
              const uploadedImage = uploadedImages[type];
              const isUploading = uploading === type;

              return (
                <div
                  key={type}
                  className={cn(
                    'relative rounded-xl border-2 border-dashed transition-all duration-300',
                    'hover:border-primary-300 hover:bg-primary-50/50',
                    uploadedImage ? 'border-primary-300 bg-primary-50/30' : 'border-gray-200'
                  )}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(type, e)}
                >
                  {/* 已有证照标签 */}
                  {existingCert && (
                    <div className="absolute top-3 right-3 z-10">
                      <StatusTag status={existingCert.status} type="certificate" size="sm" />
                    </div>
                  )}

                  {uploadedImage ? (
                    <div className="relative p-4">
                      <img
                        src={uploadedImage}
                        alt={certificateTypeNames[type]}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(type)}
                        className="absolute top-6 right-6 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="mt-3 text-center text-sm text-success-600 font-medium flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        已上传，点击提交
                      </p>
                    </div>
                  ) : existingCert ? (
                    <div className="p-4">
                      <img
                        src={existingCert.imageUrl}
                        alt={certificateTypeNames[type]}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <p className="mt-3 text-center text-sm text-gray-500">
                        {existingCert.submitTime} 提交
                      </p>
                    </div>
                  ) : (
                    <label className="block cursor-pointer p-8">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(type, e)}
                      />
                      <div className="flex flex-col items-center">
                        <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-4', info.bgColor)}>
                          <Icon className={cn('w-8 h-8', info.color)} />
                        </div>
                        <p className="font-semibold text-secondary-500 mb-1">
                          {certificateTypeNames[type]}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">{info.desc}</p>
                        <div className="flex items-center gap-2 text-sm text-primary-500">
                          <Plus className="w-4 h-4" />
                          点击或拖拽上传
                        </div>
                      </div>
                    </label>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                      <div className="text-center">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-600">上传中...</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 经营品类 */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
          <h3 className="font-bold text-secondary-500 text-lg mb-2">经营品类</h3>
          <p className="text-sm text-gray-500 mb-6">请选择您的经营品类，管理员将根据经营范围进行审核</p>
          
          {stall && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">当前已批准品类：</p>
              <div className="flex flex-wrap gap-2">
                {stall.allowedCategories.length > 0 ? (
                  stall.allowedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 bg-success-50 text-success-600 rounded-full text-sm"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">暂无</span>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-2">申请新增品类：</p>
          <div className="flex flex-wrap gap-3">
            {businessCategories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              const isApproved = stall?.allowedCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => !isApproved && toggleCategory(category)}
                  disabled={isApproved}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    isApproved
                      ? 'bg-success-50 text-success-600 cursor-default'
                      : isSelected
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {isApproved && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setUploadedImages({});
              setSelectedCategories([]);
            }}
            className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            重置
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'px-8 py-3 rounded-xl font-medium transition-all duration-300',
              canSubmit
                ? 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            提交审核
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
}
