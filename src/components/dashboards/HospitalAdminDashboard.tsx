import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Activity, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HospitalAdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
      <header className="bg-card shadow-soft border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Admin Portal</h1>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, Admin</h2>
          <p className="text-muted-foreground">Manage hospital operations and staff</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-card transition-shadow cursor-pointer border-2 border-transparent hover:border-primary" onClick={() => navigate('/manage-users')}>
            <CardHeader>
              <Users className="w-12 h-12 text-primary mb-4" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage staff and patient accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow border-2 border-transparent hover:border-secondary">
            <CardHeader>
              <Building2 className="w-12 h-12 text-secondary mb-4" />
              <CardTitle>Hospital Resources</CardTitle>
              <CardDescription>Manage conditions and departments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-secondary to-primary">
                View Resources
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow border-2 border-transparent hover:border-accent-foreground">
            <CardHeader>
              <Activity className="w-12 h-12 text-accent-foreground mb-4" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View hospital performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database</span>
                  <span className="text-sm text-secondary font-semibold">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Services</span>
                  <span className="text-sm text-secondary font-semibold">Running</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HospitalAdminDashboard;
