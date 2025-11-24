import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, FileText } from 'lucide-react';

const Prescriptions = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'patient');
      
      if (!roles?.length) return [];
      
      const patientIds = roles.map(r => r.user_id);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('id', patientIds);
      
      return data || [];
    },
  });

  const { data: medicines } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const { data } = await supabase
        .from('medicines')
        .select('*')
        .eq('requires_prescription', true);
      return data || [];
    },
  });

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      // Using patient_conditions as a proxy for prescriptions
      const { data } = await supabase
        .from('patient_conditions')
        .select('*, conditions(name)')
        .order('diagnosed_date', { ascending: false });
      
      if (!data?.length) return [];
      
      const patientIds = [...new Set(data.map(r => r.patient_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', patientIds);
      
      return data.map(rec => ({
        ...rec,
        profile: profiles?.find(p => p.id === rec.patient_id)
      }));
    },
  });

  const createPrescription = useMutation({
    mutationFn: async () => {
      if (!selectedPatient || !selectedMedicine || !dosage || !duration) {
        throw new Error('Please fill all required fields');
      }

      // Create a reminder as prescription record
      const { error } = await supabase.from('medicine_reminders').insert({
        patient_id: selectedPatient,
        medicine_id: selectedMedicine,
        dosage,
        frequency: 'once_daily',
        start_date: new Date().toISOString().split('T')[0],
        reminder_times: ['08:00'],
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast.success('Prescription created');
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setSelectedPatient('');
    setSelectedMedicine('');
    setDosage('');
    setDuration('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
      <header className="bg-card shadow-soft border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Prescription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Prescription</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients?.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Medicine</Label>
                  <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select medicine" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicines?.map((med) => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g., 500mg" />
                </div>
                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>
                <Button onClick={() => createPrescription.mutate()} disabled={createPrescription.isPending} className="w-full">
                  {createPrescription.isPending ? 'Creating...' : 'Create Prescription'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Prescriptions</h2>
          <p className="text-muted-foreground">Manage patient prescriptions</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading prescriptions...</p>
          </div>
        ) : !prescriptions?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No prescriptions yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{prescription.profile?.full_name || 'Unknown Patient'}</CardTitle>
                      <CardDescription>
                        Diagnosed: {new Date(prescription.diagnosed_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge>{prescription.conditions?.name}</Badge>
                  </div>
                </CardHeader>
                {prescription.notes && (
                  <CardContent>
                    <span className="text-sm text-muted-foreground">Notes:</span>
                    <p className="mt-1">{prescription.notes}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Prescriptions;
