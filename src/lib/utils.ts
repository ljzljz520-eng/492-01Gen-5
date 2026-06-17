import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Stall, Certificate, CertificateType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isCertificateValid(cert?: Certificate): boolean {
  if (!cert) return false
  if (cert.status !== 'approved') return false
  if (cert.expiryDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(cert.expiryDate)
    if (expiry < today) return false
  }
  return true
}

export const REQUIRED_CERT_TYPES: CertificateType[] = [
  'business_license',
  'food_permit',
  'health_cert',
  'stall_photo',
]

export interface StallComplianceResult {
  isFullyCompliant: boolean
  reasons: string[]
  validCertCount: number
  totalCerts: number
  expiredCerts: Certificate[]
  missingCerts: CertificateType[]
  invalidCerts: Certificate[]
}

export function checkStallCompliance(
  stall: Stall | undefined,
  certificates: Certificate[]
): StallComplianceResult {
  const reasons: string[] = []
  const expiredCerts: Certificate[] = []
  const missingCerts: CertificateType[] = []
  const invalidCerts: Certificate[] = []
  let validCertCount = 0

  if (!stall) {
    return {
      isFullyCompliant: false,
      reasons: ['未找到摊位信息'],
      validCertCount: 0,
      totalCerts: REQUIRED_CERT_TYPES.length,
      expiredCerts: [],
      missingCerts: [],
      invalidCerts: [],
    }
  }

  if (stall.status === 'suspended') {
    reasons.push('摊位已停业')
  }
  if (stall.status === 'pending') {
    reasons.push('摊位待审核')
  }

  for (const type of REQUIRED_CERT_TYPES) {
    const cert = certificates.find((c) => c.type === type)
    if (!cert) {
      missingCerts.push(type)
      continue
    }
    if (cert.status === 'expired') {
      expiredCerts.push(cert)
    } else if (cert.status !== 'approved') {
      invalidCerts.push(cert)
    } else if (cert.expiryDate && new Date(cert.expiryDate) < new Date(new Date().toDateString())) {
      expiredCerts.push(cert)
    } else {
      validCertCount++
    }
  }

  if (expiredCerts.length > 0) {
    reasons.push(`${expiredCerts.length} 项证照已过期`)
  }
  if (invalidCerts.length > 0) {
    reasons.push(`${invalidCerts.length} 项证照未通过审核`)
  }
  if (missingCerts.length > 0) {
    reasons.push(`${missingCerts.length} 项证照未上传`)
  }

  const isFullyCompliant =
    stall.status === 'active' &&
    validCertCount === REQUIRED_CERT_TYPES.length

  return {
    isFullyCompliant,
    reasons,
    validCertCount,
    totalCerts: REQUIRED_CERT_TYPES.length,
    expiredCerts,
    missingCerts,
    invalidCerts,
  }
}
