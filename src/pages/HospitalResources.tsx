import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bed, Activity, Users, Ambulance } from 'lucide-react';

const HospitalResources = () => {
  const navigate = useNavigate();

  const resources = [
    { name: 'ICU Beds', total: 50, occupied: 32, icon: Bed, status: 'warning' },
    { name: 'General Beds', total: 200, occupied: 145, icon: Bed, status: 'normal' },
    { name: 'Operating Rooms', total: 12, occupied: 7, icon: Activity, status: 'normal' },
    { name: 'Ambulances', total: 15, occupied: 4, icon: Ambulance, status: 'good' },
    { name: 'Emergency Staff', total: 45, onDuty: 38, icon: Users, status: 'good' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning': return 'destructive';
      case 'normal': return 'secondary';
      case 'good': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
      <header className="bg-card shadow-soft border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Hospital Resources</h2>
          <p className="text-muted-foreground">Monitor hospital capacity and availability</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => {
            const Icon = resource.icon;
            const available = resource.total - (resource.occupied || 0);
            const percentage = ((resource.occupied || 0) / resource.total) * 100;

            return (
              <Card key={resource.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="w-10 h-10 text-primary" />
                    <Badge variant={getStatusColor(resource.status)}>
                      {resource.status}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{resource.name}</CardTitle>
                  <CardDescription>
                    {resource.occupied !== undefined ? 
                      `${available} available of ${resource.total}` :
                      `${resource.onDuty} on duty of ${resource.total}`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilization</span>
                      <span className="font-medium">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default HospitalResources;
