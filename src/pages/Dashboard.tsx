import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import PatientDashboard from '@/components/dashboards/PatientDashboard';
import DoctorDashboard from '@/components/dashboards/DoctorDashboard';
import HospitalAdminDashboard from '@/components/dashboards/HospitalAdminDashboard';
import PharmacistDashboard from '@/components/dashboards/PharmacistDashboard';

const Dashboard = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  switch (userRole) {
    case 'patient':
      return <PatientDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'hospital_admin':
      return <HospitalAdminDashboard />;
    case 'pharmacist_admin':
      return <PharmacistDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Role Not Assigned</h1>
            <p className="text-muted-foreground">Please contact an administrator to assign your role.</p>
          </div>
        </div>
      );
  }
};

export default Dashboard;
