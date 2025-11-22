import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Pill, ShoppingCart } from 'lucide-react';

const MedicineShop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: patientConditions } = useQuery({
    queryKey: ['patient-conditions', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('patient_conditions')
        .select('condition_id')
        .eq('patient_id', user!.id);
      return data?.map(pc => pc.condition_id) || [];
    },
  });

  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines', patientConditions],
    queryFn: async () => {
      if (!patientConditions?.length) return [];
      
      const { data } = await supabase
        .from('medicines')
        .select('*, conditions(name)')
        .in('condition_id', patientConditions)
        .gt('stock_quantity', 0);
      
      return data || [];
    },
    enabled: !!patientConditions,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (medicine: any) => {
      const quantity = quantities[medicine.id] || 1;
      
      if (quantity > medicine.stock_quantity) {
        throw new Error('Insufficient stock');
      }

      const { error } = await supabase.from('medicine_purchases').insert({
        patient_id: user!.id,
        medicine_id: medicine.id,
        quantity,
        total_price: medicine.price * quantity,
        prescription_verified: medicine.requires_prescription,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Purchase successful');
      setQuantities({});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleQuantityChange = (medicineId: string, value: string) => {
    const num = parseInt(value) || 1;
    setQuantities(prev => ({ ...prev, [medicineId]: Math.max(1, num) }));
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
          <h2 className="text-3xl font-bold mb-2">Medicine Shop</h2>
          <p className="text-muted-foreground">
            Browse medicines for your diagnosed conditions
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading medicines...</p>
          </div>
        ) : !medicines?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Pill className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No medicines available for your conditions
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((medicine) => (
              <Card key={medicine.id}>
                <CardHeader>
                  <CardTitle>{medicine.name}</CardTitle>
                  <CardDescription>{medicine.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {medicine.conditions?.name || 'General'}
                    </Badge>
                    <span className="text-2xl font-bold text-primary">
                      ${Number(medicine.price).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">In Stock:</span>
                      <span className="font-medium">{medicine.stock_quantity}</span>
                    </div>
                    {medicine.requires_prescription && (
                      <Badge variant="secondary" className="w-full justify-center">
                        Requires Prescription
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      max={medicine.stock_quantity}
                      value={quantities[medicine.id] || 1}
                      onChange={(e) => handleQuantityChange(medicine.id, e.target.value)}
                      className="w-20"
                    />
                    <Button
                      onClick={() => purchaseMutation.mutate(medicine)}
                      disabled={purchaseMutation.isPending}
                      className="flex-1"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MedicineShop;
