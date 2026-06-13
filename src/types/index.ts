export type UserRole = 'vendor' | 'admin' | 'inspector';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar?: string;
}

export type StallStatus = 'active' | 'suspended' | 'pending';

export interface Stall {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  stallNumber: string;
  stallName: string;
  location: string;
  businessType: string[];
  allowedCategories: string[];
  status: StallStatus;
  createdAt: string;
  description?: string;
}

export type CertificateType = 'business_license' | 'food_permit' | 'health_cert' | 'stall_photo';
export type CertificateStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface Certificate {
  id: string;
  stallId: string;
  type: CertificateType;
  name: string;
  imageUrl: string;
  status: CertificateStatus;
  submitTime: string;
  reviewTime?: string;
  reviewer?: string;
  rejectReason?: string;
  expiryDate?: string;
  certificateNumber?: string;
}

export type ComplaintType = 'noise' | 'oil_smoke' | 'other';
export type ComplaintStatus = 'pending' | 'processing' | 'resolved' | 'closed';

export interface Complaint {
  id: string;
  stallId: string;
  stallName?: string;
  type: ComplaintType;
  title: string;
  description: string;
  status: ComplaintStatus;
  submitterId: string;
  submitterName: string;
  submitTime: string;
  handlerId?: string;
  handlerName?: string;
  handleTime?: string;
  handleNote?: string;
  images?: string[];
}

export type RectificationStatus = 'pending' | 'in_progress' | 'completed' | 'verified';
export type RectificationType = 'oil_smoke' | 'noise' | 'other';

export interface Rectification {
  id: string;
  stallId: string;
  stallName?: string;
  type: RectificationType;
  title: string;
  description: string;
  deadline: string;
  status: RectificationStatus;
  issuerId: string;
  issuerName: string;
  issueTime: string;
  vendorFeedback?: string;
  feedbackTime?: string;
  feedbackImages?: string[];
  verifierId?: string;
  verifyTime?: string;
  verifyNote?: string;
}

export interface Inspection {
  id: string;
  stallId: string;
  stallName?: string;
  inspectorId: string;
  inspectorName: string;
  inspectTime: string;
  isCompliant: boolean;
  issues?: string[];
  notes?: string;
}

export const certificateTypeNames: Record<CertificateType, string> = {
  business_license: '营业执照',
  food_permit: '食品经营许可证',
  health_cert: '健康证',
  stall_photo: '摊位照片',
};

export const certificateStatusNames: Record<CertificateStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已退回',
  expired: '已过期',
};

export const complaintTypeNames: Record<ComplaintType, string> = {
  noise: '噪音扰民',
  oil_smoke: '油烟污染',
  other: '其他问题',
};

export const complaintStatusNames: Record<ComplaintStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
};

export const rectificationTypeNames: Record<RectificationType, string> = {
  noise: '噪音整改',
  oil_smoke: '油烟整改',
  other: '其他整改',
};

export const rectificationStatusNames: Record<RectificationStatus, string> = {
  pending: '待整改',
  in_progress: '整改中',
  completed: '待验收',
  verified: '已验收',
};

export const stallStatusNames: Record<StallStatus, string> = {
  active: '经营中',
  suspended: '已停业',
  pending: '待审核',
};

export const businessCategories = [
  '烧烤类',
  '油炸类',
  '蒸煮类',
  '饮品奶茶',
  '冰品甜点',
  '特色小吃',
  '主食快餐',
  '生鲜果蔬',
  '服饰百货',
  '饰品礼品',
  '游戏娱乐',
  '手工艺品',
];
