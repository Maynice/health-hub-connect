import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Pill, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
      <header className="bg-card shadow-soft border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">MediCare Portal</h1>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, Patient</h2>
          <p className="text-muted-foreground">Manage your appointments, medicines, and health</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-card transition-shadow cursor-pointer border-2 border-transparent hover:border-primary" onClick={() => navigate('/book-appointment')}>
            <CardHeader>
              <Calendar className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Book Appointment</CardTitle>
              <CardDescription>Schedule a visit with our doctors</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                Schedule Now
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow cursor-pointer border-2 border-transparent hover:border-secondary" onClick={() => navigate('/medicine-shop')}>
            <CardHeader>
              <Pill className="w-12 h-12 text-secondary mb-4" />
              <CardTitle>Buy Medicine</CardTitle>
              <CardDescription>Browse and purchase prescribed medicines</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-secondary to-primary">
                Shop Now
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow cursor-pointer border-2 border-transparent hover:border-accent-foreground" onClick={() => navigate('/medicine-reminders')}>
            <CardHeader>
              <Clock className="w-12 h-12 text-accent-foreground mb-4" />
              <CardTitle>Medicine Reminders</CardTitle>
              <CardDescription>Track your medication schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Reminders
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No upcoming appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Medicine Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No medicine scheduled for today</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
