import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Calendar } from 'lucide-react';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments', user?.id],
    queryFn: async () => {
      const { data: appts } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user!.id)
        .order('appointment_date', { ascending: true });
      
      if (!appts?.length) return [];
      
      const patientIds = [...new Set(appts.map(a => a.patient_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', patientIds);
      
      return appts.map(apt => ({
        ...apt,
        profile: profiles?.find(p => p.id === apt.patient_id)
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      toast.success('Appointment updated');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
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
          <h2 className="text-3xl font-bold mb-2">My Appointments</h2>
          <p className="text-muted-foreground">Manage your patient appointments</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading appointments...</p>
          </div>
        ) : !appointments?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appointments scheduled</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>
                      {appointment.profile?.full_name || 'Unknown Patient'}
                    </CardTitle>
                    <CardDescription>
                      {new Date(appointment.appointment_date).toLocaleString()}
                    </CardDescription>
                  </div>
                    <Badge variant={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Reason:</span>
                    <p className="mt-1">{appointment.reason}</p>
                  </div>
                  {appointment.notes && (
                    <div>
                      <span className="text-sm text-muted-foreground">Notes:</span>
                      <p className="mt-1">{appointment.notes}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground">Contact:</span>
                    <p className="mt-1">{appointment.profile?.phone || 'No phone'}</p>
                  </div>
                  {appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <Select
                        defaultValue={appointment.status}
                        onValueChange={(status) =>
                          updateStatus.mutate({ id: appointment.id, status })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">Confirm</SelectItem>
                          <SelectItem value="cancelled">Cancel</SelectItem>
                          <SelectItem value="completed">Complete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorAppointments;
