
import React, { useState } from 'react';
import { 
  Search, 
  UserPen, 
  Ban, 
  Trash, 
  CheckCircle,
  UserIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserEditDialog from '@/components/UserEditDialog';
import PendingUsers from './PendingUsers';

const UserManagement: React.FC = () => {
  const { 
    users, 
    suspendUser, 
    activateUser, 
    editUser, 
    deleteUser 
  } = useAuth();
  
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  
  const filteredUsers = users
    .filter(u => !u.pendingApproval)
    .filter(u => {
      if (!userSearch) return true;
      const search = userSearch.toLowerCase();
      return (
        u.username.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search)
      );
    });
  
  const handleOpenEditDialog = (userData: any) => {
    setEditingUser(userData);
    setShowEditDialog(true);
  };

  const handleSaveUserEdit = (userId: string, userData: any) => {
    editUser(userId, userData);
    setShowEditDialog(false);
  };

  const handleToggleSuspend = (userData: any) => {
    if (userData.suspended) {
      activateUser(userData.id);
    } else {
      suspendUser(userData.id);
    }
  };

  const handleConfirmDelete = (userId: string) => {
    setShowConfirmDelete(null);
    deleteUser(userId);
  };
  
  return (
    <>
      <PendingUsers />
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by username or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map((userData) => (
                <div key={userData.id} className={`border rounded-md p-3 ${
                  userData.suspended ? 'border-red-200 bg-red-50' :
                  userData.isAdmin ? 'border-blue-200 bg-blue-50' :
                  userData.isRadioHost ? 'border-green-200 bg-green-50' :
                  'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-medium">{userData.username}</h3>
                        {userData.isAdmin && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                        {userData.isRadioHost && !userData.isAdmin && (
                          <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">
                            Host
                          </span>
                        )}
                        {userData.suspended && (
                          <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded">
                            Suspended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {userData.email}
                      </p>
                      {userData.registeredAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Member since {format(new Date(userData.registeredAt), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {showConfirmDelete === userData.id ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowConfirmDelete(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleConfirmDelete(userData.id)}
                          >
                            Confirm
                          </Button>
                        </>
                      ) : (
                        <>
                          {!userData.isAdmin && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={userData.suspended ? 
                                "border-green-200 text-green-700 hover:bg-green-50" : 
                                "border-red-200 text-red-700 hover:bg-red-50"
                              }
                              onClick={() => handleToggleSuspend(userData)}
                            >
                              {userData.suspended ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Activate
                                </>
                              ) : (
                                <>
                                  <Ban className="w-4 h-4 mr-1" />
                                  Suspend
                                </>
                              )}
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenEditDialog(userData)}
                          >
                            <UserPen className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          
                          {userData.id !== '1' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => setShowConfirmDelete(userData.id)}
                            >
                              <Trash className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No users found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {editingUser && (
        <UserEditDialog
          user={editingUser}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSave={handleSaveUserEdit}
        />
      )}
    </>
  );
};

export default UserManagement;
