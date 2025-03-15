
import React from 'react';
import { UserCheck, UserX, UserIcon } from 'lucide-react';
import { format, formatDistance } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PendingUsers: React.FC = () => {
  const { users, approveUser, rejectUser } = useAuth();
  
  const pendingUsers = users.filter(u => u.pendingApproval);
  
  const handleApproveUser = (userId: string) => {
    approveUser(userId);
  };

  const handleRejectUser = (userId: string) => {
    rejectUser(userId);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pending User Approvals</CardTitle>
        <CardDescription>
          Review and approve user registration requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingUsers.length > 0 ? (
          <div className="space-y-4">
            {pendingUsers.map((pendingUser) => (
              <div key={pendingUser.id} className="border border-yellow-200 bg-yellow-50 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{pendingUser.username}</h3>
                    <p className="text-sm text-gray-600">
                      Email: {pendingUser.email}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Registered {formatDistance(new Date(pendingUser.registeredAt || Date.now()), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleRejectUser(pendingUser.id)}
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleApproveUser(pendingUser.id)}
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No pending user approvals at this time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingUsers;
