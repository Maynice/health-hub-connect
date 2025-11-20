import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HeartPulse, Calendar, Pill, Clock } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary">MediCare</span>
          </div>
          <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-secondary">
            Sign In
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Health, Simplified
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Comprehensive hospital management system for patients, doctors, and healthcare providers
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-primary to-secondary text-lg px-8 py-6"
          >
            Get Started
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-8 rounded-2xl shadow-card border border-border hover:border-primary transition-colors">
            <Calendar className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Easy Appointments</h3>
            <p className="text-muted-foreground">
              Book and manage your doctor appointments with just a few clicks
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-card border border-border hover:border-secondary transition-colors">
            <Pill className="w-12 h-12 text-secondary mb-4" />
            <h3 className="text-xl font-bold mb-2">Medicine Shop</h3>
            <p className="text-muted-foreground">
              Purchase prescribed medicines securely based on your conditions
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-card border border-border hover:border-accent-foreground transition-colors">
            <Clock className="w-12 h-12 text-accent-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Reminders</h3>
            <p className="text-muted-foreground">
              Never miss a dose with our intelligent medicine reminder system
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
