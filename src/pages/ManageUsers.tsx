import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users } from 'lucide-react';

const ManageUsers = () => {
  const navigate = useNavigate();

  const { data: users, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: roles } = await supabase.from('user_roles').select('*');

      const userMap = new Map();
      profiles?.forEach((profile) => {
        userMap.set(profile.id, { ...profile, roles: [] });
      });

      roles?.forEach((role) => {
        if (userMap.has(role.user_id)) {
          userMap.get(role.user_id).roles.push(role.role);
        }
      });

      return Array.from(userMap.values());
    },
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'hospital_admin': return 'default';
      case 'doctor': return 'secondary';
      case 'pharmacist_admin': return 'outline';
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
          <h2 className="text-3xl font-bold mb-2">User Management</h2>
          <p className="text-muted-foreground">View all system users and their roles</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : !users?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{user.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {user.roles?.length ? (
                        user.roles.map((role: string) => (
                          <Badge key={role} variant={getRoleBadgeVariant(role)}>
                            {role.replace(/_/g, ' ')}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">No Role</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {user.phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    )}
                    {user.date_of_birth && (
                      <div>
                        <span className="text-muted-foreground">DOB:</span>
                        <p className="font-medium">
                          {new Date(user.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                    )}
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

export default ManageUsers;
