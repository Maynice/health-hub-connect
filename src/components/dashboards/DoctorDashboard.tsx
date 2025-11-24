import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, FileText, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
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
          <h1 className="text-2xl font-bold text-primary">Doctor Portal</h1>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, Doctor</h2>
          <p className="text-muted-foreground">Manage your appointments and patient records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-card transition-shadow cursor-pointer border-2 border-transparent hover:border-primary" onClick={() => navigate('/doctor-appointments')}>
            <CardHeader>
              <Calendar className="w-12 h-12 text-primary mb-4" />
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>View and manage patient appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                View Appointments
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow cursor-pointer border-2 border-transparent hover:border-secondary" onClick={() => navigate('/patient-records')}>
            <CardHeader>
              <FileText className="w-12 h-12 text-secondary mb-4" />
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>Access and update patient health records</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-secondary to-primary">
                View Records
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow cursor-pointer border-2 border-transparent hover:border-accent-foreground" onClick={() => navigate('/prescriptions')}>
            <CardHeader>
              <FileText className="w-12 h-12 text-accent-foreground mb-4" />
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>Create and manage prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Manage
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No appointments scheduled for today</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
