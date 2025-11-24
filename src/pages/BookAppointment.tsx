import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [reason, setReason] = useState('');

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'doctor');
      
      if (!roles?.length) return [];
      
      const doctorIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', doctorIds);
      
      const { data: availability } = await supabase
        .from('doctor_availability')
        .select('*')
        .in('doctor_id', doctorIds);
      
      return profiles?.map(profile => ({
        ...profile,
        availability: availability?.find(a => a.doctor_id === profile.id)?.availability_type || 'all'
      })) || [];
    },
  });

  const selectedDoctorData = doctors?.find(d => d.id === selectedDoctor);

  const isDoctorAvailable = (date: Date, doctorAvailability: string) => {
    if (doctorAvailability === 'all') return true;
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (doctorAvailability === 'weekdays') return !isWeekend;
    if (doctorAvailability === 'weekends') return isWeekend;
    return true;
  };

  const createAppointment = useMutation({
    mutationFn: async () => {
      if (!selectedDoctor || !selectedDate || !reason.trim()) {
        throw new Error('Please fill all fields');
      }

      if (!isDoctorAvailable(selectedDate, selectedDoctorData?.availability || 'all')) {
        throw new Error('Doctor is not available on this day');
      }

      const { error } = await supabase.from('appointments').insert({
        patient_id: user!.id,
        doctor_id: selectedDoctor,
        appointment_date: selectedDate.toISOString(),
        reason: reason.trim(),
        status: 'pending',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment booked successfully');
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

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
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Book Appointment</CardTitle>
            <CardDescription>Schedule a visit with one of our doctors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : doctors?.length ? (
                    doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center gap-2">
                          Dr. {doctor.full_name}
                          {doctor.availability !== 'all' && (
                            <Badge variant="outline" className="text-xs">
                              {doctor.availability}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No doctors available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {selectedDoctorData && selectedDoctorData.availability !== 'all' && (
                <p className="text-sm text-muted-foreground">
                  This doctor is only available on {selectedDoctorData.availability}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  if (date < new Date()) return true;
                  if (!selectedDoctorData) return false;
                  return !isDoctorAvailable(date, selectedDoctorData.availability);
                }}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-2">
              <Label>Reason for Visit</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms or reason for visit"
                rows={4}
              />
            </div>

            <Button
              onClick={() => createAppointment.mutate()}
              disabled={createAppointment.isPending || !selectedDoctor || !selectedDate || !reason.trim()}
              className="w-full"
            >
              {createAppointment.isPending ? 'Booking...' : 'Book Appointment'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BookAppointment;
