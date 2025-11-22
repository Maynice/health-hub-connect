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

const PatientRecords = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState('');
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

  const { data: conditions } = useQuery({
    queryKey: ['conditions'],
    queryFn: async () => {
      const { data } = await supabase.from('conditions').select('*');
      return data || [];
    },
  });

  const { data: patientConditions, isLoading } = useQuery({
    queryKey: ['all-patient-conditions'],
    queryFn: async () => {
      const { data: records } = await supabase
        .from('patient_conditions')
        .select('*, conditions(name)')
        .order('diagnosed_date', { ascending: false });
      
      if (!records?.length) return [];
      
      const patientIds = [...new Set(records.map(r => r.patient_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', patientIds);
      
      return records.map(rec => ({
        ...rec,
        profile: profiles?.find(p => p.id === rec.patient_id)
      }));
    },
  });

  const addCondition = useMutation({
    mutationFn: async () => {
      if (!selectedPatient || !selectedCondition || !diagnosedDate) {
        throw new Error('Please fill all required fields');
      }

      const { error } = await supabase.from('patient_conditions').insert({
        patient_id: selectedPatient,
        condition_id: selectedCondition,
        diagnosed_date: diagnosedDate,
        notes: notes.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-patient-conditions'] });
      toast.success('Condition added');
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setSelectedPatient('');
    setSelectedCondition('');
    setDiagnosedDate('');
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
                Add Diagnosis
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Patient Diagnosis</DialogTitle>
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
                  <Label>Condition</Label>
                  <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions?.map((condition) => (
                        <SelectItem key={condition.id} value={condition.id}>
                          {condition.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Diagnosed Date</Label>
                  <Input type="date" value={diagnosedDate} onChange={(e) => setDiagnosedDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>
                <Button onClick={() => addCondition.mutate()} disabled={addCondition.isPending} className="w-full">
                  {addCondition.isPending ? 'Adding...' : 'Add Diagnosis'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Patient Records</h2>
          <p className="text-muted-foreground">Manage patient diagnoses</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading records...</p>
          </div>
        ) : !patientConditions?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No patient records yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {patientConditions.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{record.profile?.full_name || 'Unknown Patient'}</CardTitle>
                    <CardDescription>
                      Diagnosed: {new Date(record.diagnosed_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                    <Badge>{record.conditions?.name}</Badge>
                  </div>
                </CardHeader>
                {record.notes && (
                  <CardContent>
                    <span className="text-sm text-muted-foreground">Notes:</span>
                    <p className="mt-1">{record.notes}</p>
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

export default PatientRecords;
