import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User,
  Stall,
  Certificate,
  Complaint,
  Rectification,
  Inspection,
  CertificateStatus,
  ComplaintStatus,
  RectificationStatus,
} from '@/types';
import {
  mockUsers,
  mockStalls,
  mockCertificates,
  mockComplaints,
  mockRectifications,
  mockInspections,
} from '@/data/mockData';

interface AppState {
  currentUser: User | null;
  users: User[];
  stalls: Stall[];
  certificates: Certificate[];
  complaints: Complaint[];
  rectifications: Rectification[];
  inspections: Inspection[];

  login: (userId: string) => void;
  logout: () => void;

  addCertificate: (cert: Certificate) => void;
  updateCertificateStatus: (
    certId: string,
    status: CertificateStatus,
    reviewer: string,
    rejectReason?: string
  ) => void;

  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (
    complaintId: string,
    status: ComplaintStatus,
    handlerName: string,
    handleNote?: string
  ) => void;

  addRectification: (rect: Rectification) => void;
  updateRectification: (
    rectId: string,
    updates: Partial<Rectification>
  ) => void;

  addInspection: (inspection: Inspection) => void;

  updateStallAllowedCategories: (
    stallId: string,
    categories: string[]
  ) => void;
  updateStallStatus: (stallId: string, status: Stall['status']) => void;

  resetToMockData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      stalls: mockStalls,
      certificates: mockCertificates,
      complaints: mockComplaints,
      rectifications: mockRectifications,
      inspections: mockInspections,

      login: (userId: string) => {
        const user = get().users.find((u) => u.id === userId);
        if (user) {
          set({ currentUser: user });
        }
      },

      logout: () => {
        set({ currentUser: null });
      },

      addCertificate: (cert: Certificate) => {
        set((state) => ({
          certificates: [...state.certificates, cert],
        }));
      },

      updateCertificateStatus: (
        certId: string,
        status: CertificateStatus,
        reviewer: string,
        rejectReason?: string
      ) => {
        set((state) => ({
          certificates: state.certificates.map((c) =>
            c.id === certId
              ? {
                  ...c,
                  status,
                  reviewer,
                  reviewTime: new Date().toLocaleString('zh-CN'),
                  rejectReason: status === 'rejected' ? rejectReason : undefined,
                }
              : c
          ),
        }));
      },

      addComplaint: (complaint: Complaint) => {
        set((state) => ({
          complaints: [...state.complaints, complaint],
        }));
      },

      updateComplaint: (
        complaintId: string,
        status: ComplaintStatus,
        handlerName: string,
        handleNote?: string
      ) => {
        set((state) => ({
          complaints: state.complaints.map((c) =>
            c.id === complaintId
              ? {
                  ...c,
                  status,
                  handlerName,
                  handleTime: new Date().toLocaleString('zh-CN'),
                  handleNote,
                }
              : c
          ),
        }));
      },

      addRectification: (rect: Rectification) => {
        set((state) => ({
          rectifications: [...state.rectifications, rect],
        }));
      },

      updateRectification: (
        rectId: string,
        updates: Partial<Rectification>
      ) => {
        set((state) => ({
          rectifications: state.rectifications.map((r) =>
            r.id === rectId ? { ...r, ...updates } : r
          ),
        }));
      },

      addInspection: (inspection: Inspection) => {
        set((state) => ({
          inspections: [...state.inspections, inspection],
        }));
      },

      updateStallAllowedCategories: (
        stallId: string,
        categories: string[]
      ) => {
        set((state) => ({
          stalls: state.stalls.map((s) =>
            s.id === stallId ? { ...s, allowedCategories: categories } : s
          ),
        }));
      },

      updateStallStatus: (stallId: string, status: Stall['status']) => {
        set((state) => ({
          stalls: state.stalls.map((s) =>
            s.id === stallId ? { ...s, status } : s
          ),
        }));
      },

      resetToMockData: () => {
        set({
          users: mockUsers,
          stalls: mockStalls,
          certificates: mockCertificates,
          complaints: mockComplaints,
          rectifications: mockRectifications,
          inspections: mockInspections,
        });
      },
    }),
    {
      name: 'night-market-cert-storage',
      partialize: (state) => ({
        stalls: state.stalls,
        certificates: state.certificates,
        complaints: state.complaints,
        rectifications: state.rectifications,
        inspections: state.inspections,
        users: state.users,
      }),
    }
  )
);
