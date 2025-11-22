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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Package } from 'lucide-react';

const PharmacyInventory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [conditionId, setConditionId] = useState('');
  const [requiresPrescription, setRequiresPrescription] = useState(true);

  const { data: conditions } = useQuery({
    queryKey: ['conditions'],
    queryFn: async () => {
      const { data } = await supabase.from('conditions').select('*');
      return data || [];
    },
  });

  const { data: medicines, isLoading } = useQuery({
    queryKey: ['all-medicines'],
    queryFn: async () => {
      const { data } = await supabase
        .from('medicines')
        .select('*, conditions(name)')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const addMedicine = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !price || !stockQuantity) {
        throw new Error('Please fill all required fields');
      }

      const { error } = await supabase.from('medicines').insert({
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        stock_quantity: parseInt(stockQuantity),
        condition_id: conditionId || null,
        requires_prescription: requiresPrescription,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-medicines'] });
      toast.success('Medicine added');
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStockQuantity('');
    setConditionId('');
    setRequiresPrescription(true);
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
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Medicine</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Medicine Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Stock Quantity</Label>
                  <Input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Condition (Optional)</Label>
                  <Select value={conditionId} onValueChange={setConditionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {conditions?.map((condition) => (
                        <SelectItem key={condition.id} value={condition.id}>
                          {condition.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={requiresPrescription}
                    onCheckedChange={setRequiresPrescription}
                  />
                  <Label>Requires Prescription</Label>
                </div>
                <Button onClick={() => addMedicine.mutate()} disabled={addMedicine.isPending} className="w-full">
                  {addMedicine.isPending ? 'Adding...' : 'Add Medicine'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Medicine Inventory</h2>
          <p className="text-muted-foreground">Manage medicine catalog and stock</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        ) : !medicines?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No medicines in inventory</p>
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
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ${Number(medicine.price).toFixed(2)}
                    </span>
                    <Badge variant={medicine.stock_quantity > 10 ? 'default' : 'destructive'}>
                      Stock: {medicine.stock_quantity}
                    </Badge>
                  </div>
                  {medicine.conditions && (
                    <Badge variant="outline">{medicine.conditions.name}</Badge>
                  )}
                  {medicine.requires_prescription && (
                    <Badge variant="secondary" className="w-full justify-center">
                      Requires Prescription
                    </Badge>
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

export default PharmacyInventory;
