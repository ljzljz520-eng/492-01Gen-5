import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import VendorDashboard from '@/pages/VendorDashboard';
import VendorUpload from '@/pages/VendorUpload';
import VendorRecords from '@/pages/VendorRecords';
import VendorComplaints from '@/pages/VendorComplaints';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminReview from '@/pages/AdminReview';
import AdminStalls from '@/pages/AdminStalls';
import AdminComplaints from '@/pages/AdminComplaints';
import AdminRectifications from '@/pages/AdminRectifications';
import InspectorDashboard from '@/pages/InspectorDashboard';
import InspectorScan from '@/pages/InspectorScan';
import InspectorStallDetail from '@/pages/InspectorStallDetail';
import InspectorComplaints from '@/pages/InspectorComplaints';
import { useAppStore } from '@/store/useAppStore';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: string }) {
  const { currentUser } = useAppStore();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  if (currentUser.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* 摊主端路由 */}
        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute allowedRole="vendor">
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/upload"
          element={
            <ProtectedRoute allowedRole="vendor">
              <VendorUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/records"
          element={
            <ProtectedRoute allowedRole="vendor">
              <VendorRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/complaints"
          element={
            <ProtectedRoute allowedRole="vendor">
              <VendorComplaints />
            </ProtectedRoute>
          }
        />
        
        {/* 管理员端路由 */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/review"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stalls"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminStalls />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rectifications"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminRectifications />
            </ProtectedRoute>
          }
        />
        
        {/* 巡查端路由 */}
        <Route
          path="/inspector/dashboard"
          element={
            <ProtectedRoute allowedRole="inspector">
              <InspectorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspector/scan"
          element={
            <ProtectedRoute allowedRole="inspector">
              <InspectorScan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspector/stall/:id"
          element={
            <ProtectedRoute allowedRole="inspector">
              <InspectorStallDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspector/complaints"
          element={
            <ProtectedRoute allowedRole="inspector">
              <InspectorComplaints />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
