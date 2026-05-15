import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProfileSelection } from "@/components/mockups/lopes-tv/ProfileSelection";
import { UnifiedAdmin } from "@/pages/UnifiedAdmin";
import { LopesSignage } from "@/components/mockups/lopes-tv/LopesSignage";

// Protected Route Wrapper for Admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const isLogged = localStorage.getItem("lopes_admin_logged") === "true";
  if (!isLogged) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

// Protected Route Wrapper for Unit
function UnitRoute({ children }: { children: React.ReactNode }) {
  const isSelected = !!localStorage.getItem("lopes_selected_unit");
  if (!isSelected) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfileSelection />} />
        
        {/* Hub / Dashboard for Units -> directly to LopesSignage */}
        <Route 
          path="/hub" 
          element={
            <UnitRoute>
              <LopesSignage />
            </UnitRoute>
          } 
        />
        
        {/* Unified Admin Panel */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <UnifiedAdmin />
            </AdminRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
