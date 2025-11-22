import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Package, ShoppingCart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PharmacistDashboard = () => {
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
          <h1 className="text-2xl font-bold text-primary">Pharmacist Portal</h1>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, Pharmacist</h2>
          <p className="text-muted-foreground">Manage medicine inventory and orders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-card transition-shadow cursor-pointer border-2 border-transparent hover:border-primary" onClick={() => navigate('/pharmacy-inventory')}>
            <CardHeader>
              <Package className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Medicine Inventory</CardTitle>
              <CardDescription>Manage medicine stock and catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                Manage Inventory
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow border-2 border-transparent hover:border-secondary">
            <CardHeader>
              <Pill className="w-12 h-12 text-secondary mb-4" />
              <CardTitle>Medicine Catalog</CardTitle>
              <CardDescription>View available medicines</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-secondary to-primary">
                View Catalog
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow border-2 border-transparent hover:border-accent-foreground">
            <CardHeader>
              <ShoppingCart className="w-12 h-12 text-accent-foreground mb-4" />
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>Process medicine purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Orders
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">All medicines in stock</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PharmacistDashboard;
