// components/christmas-wishlist.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Gift, Plus, Pencil, Trash2, X, Check, ShoppingCart, Package } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Gift as GiftType } from '../lib/db/schema';

type GiftStatus = 'pending' | 'will_buy' | 'bought';
// Update the ExtendedGift interface to properly extend GiftType
interface ExtendedGift extends Omit<GiftType, 'status'> {
  status: GiftStatus | null;
}


const ChristmasWishlist = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [gifts, setGifts] = useState<ExtendedGift[]>([]);
    const [newUser, setNewUser] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [editingGift, setEditingGift] = useState<number | null>(null);
  const [editedGift, setEditedGift] = useState({
    item: '',
    description: '',
    priceRange: ''
  });
  const [newGift, setNewGift] = useState({
    item: '',
    description: '',
    priceRange: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchGifts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('API did not return an array for users:', data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchGifts = async () => {
    try {
      const response = await fetch('/api/gifts');
      const data = await response.json();
      if (Array.isArray(data)) {
        setGifts(data);
      } else {
        console.error('API did not return an array for gifts:', data);
        setGifts([]);
      }
    } catch (error) {
      console.error('Error fetching gifts:', error);
      setGifts([]);
    }
  };

  const addUser = async () => {
    if (newUser.trim()) {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newUser })
        });
        const data = await response.json();
        if (data.id) {
          setUsers(prevUsers => [...prevUsers, data]);
          setNewUser('');
        }
      } catch (error) {
        console.error('Error adding user:', error);
      }
    }
  };

  const addGift = async () => {
    if (newGift.item.trim() && selectedUser) {
      try {
        const giftData = {
          ...newGift,
          userId: selectedUser
        };
        
        const response = await fetch('/api/gifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(giftData)
        });
        
        const data = await response.json();
        if (data.id) {
          setGifts(prevGifts => [...prevGifts, data]);
          setNewGift({ item: '', description: '', priceRange: '' });
        }
      } catch (error) {
        console.error('Error adding gift:', error);
      }
    }
  };

  const deleteGift = async (giftId: number) => {
    try {
      const response = await fetch(`/api/gifts/${giftId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setGifts(prevGifts => prevGifts.filter(gift => gift.id !== giftId));
      }
    } catch (error) {
      console.error('Error deleting gift:', error);
    }
  };

  const startEditing = (gift: ExtendedGift) => {
    setEditingGift(gift.id);
    setEditedGift({
      item: gift.item,
      description: gift.description || '',
      priceRange: gift.priceRange || ''
    });
  };

  const cancelEditing = () => {
    setEditingGift(null);
    setEditedGift({ item: '', description: '', priceRange: '' });
  };

  const saveEdit = async (giftId: number) => {
    try {
      const response = await fetch(`/api/gifts/${giftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedGift)
      });
      
      const updatedGift = await response.json();
      
      if (updatedGift.id) {
        setGifts(prevGifts => 
          prevGifts.map(gift => 
            gift.id === giftId ? { ...gift, ...editedGift } : gift
          )
        );
        setEditingGift(null);
        setEditedGift({ item: '', description: '', priceRange: '' });
      }
    } catch (error) {
      console.error('Error updating gift:', error);
    }
  };

  const updateGiftStatus = async (giftId: number, status: GiftStatus) => {
    try {
      const response = await fetch(`/api/gifts/${giftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      const updatedGift = await response.json();
      
      if (updatedGift.id) {
        setGifts(prevGifts => 
          prevGifts.map(gift => 
            gift.id === giftId ? { ...gift, status: status } : gift
          )
        );
      }
    } catch (error) {
      console.error('Error updating gift status:', error);
    }
  };

  // Enhanced status color function
  const getStatusColor = (status: GiftStatus | null | undefined) => {
    switch (status) {
      case 'bought':
        return 'text-green-600 bg-green-50';
      case 'will_buy':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  const getStatusIcon = (status: GiftStatus | null | undefined) => {
    switch (status) {
      case 'bought':
        return <Package className="h-4 w-4" />;
      case 'will_buy':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const selectedUserGifts = selectedUser 
    ? gifts.filter(gift => gift.userId === selectedUser)
    : [];


  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <Card className="border-2 border-red-100 bg-gradient-to-b from-white to-red-50">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Gift className="h-8 w-8 text-red-600" />
            <span className="text-2xl font-bold">Family Christmas Wishlist</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add family member..."
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                className="border-red-200 focus:border-red-300 focus:ring-red-200"
              />
              <Button 
                onClick={addUser}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <Button
                  key={user.id}
                  variant={selectedUser === user.id ? "default" : "outline"}
                  className={selectedUser === user.id 
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "border-green-200 text-green-700 hover:bg-green-50"}
                  onClick={() => setSelectedUser(user.id)}
                >
                  {user.name}
                </Button>
              ))}
            </div>

            {selectedUser && (
              <div className="mt-4">
                <Card className="border-2 border-green-100">
                  <CardContent className="pt-6">
                    <div className="space-y-4 mb-6">
                      <div>
                        <Label className="text-green-700">Gift Item</Label>
                        <Input
                          placeholder="What would you like?"
                          value={newGift.item}
                          onChange={(e) => setNewGift({ ...newGift, item: e.target.value })}
                          className="border-green-200 focus:border-green-300"
                        />
                      </div>
                      <div>
                        <Label className="text-green-700">Description</Label>
                        <Textarea
                          placeholder="Add any specific details..."
                          value={newGift.description}
                          onChange={(e) => setNewGift({ ...newGift, description: e.target.value })}
                          className="border-green-200 focus:border-green-300"
                        />
                      </div>
                      <div>
                        <Label className="text-green-700">Price Range</Label>
                        <Input
                          placeholder="$20-30"
                          value={newGift.priceRange}
                          onChange={(e) => setNewGift({ ...newGift, priceRange: e.target.value })}
                          className="border-green-200 focus:border-green-300"
                        />
                      </div>
                      <Button 
                        onClick={addGift}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Add Gift
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {selectedUserGifts.map((gift) => (
                        <Card key={gift.id} className="border-green-100 hover:border-green-200 transition-colors">
                          <CardContent className="pt-6">
                            {editingGift === gift.id ? (
                              <div className="space-y-4">
                                <Input
                                  value={editedGift.item}
                                  onChange={(e) => setEditedGift({ ...editedGift, item: e.target.value })}
                                  className="border-green-200"
                                />
                                <Textarea
                                  value={editedGift.description}
                                  onChange={(e) => setEditedGift({ ...editedGift, description: e.target.value })}
                                  className="border-green-200"
                                />
                                <Input
                                  value={editedGift.priceRange}
                                  onChange={(e) => setEditedGift({ ...editedGift, priceRange: e.target.value })}
                                  className="border-green-200"
                                />
                                <div className="flex gap-2">
                                  <Button onClick={() => saveEdit(gift.id)} size="sm" className="bg-green-600 hover:bg-green-700">
                                    <Check className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button onClick={cancelEditing} variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <h3 className="font-semibold flex items-center gap-2 text-green-700">
                                    {gift.item}
                                    <span className={`${getStatusColor(gift.status)} p-1 rounded-full`}>
                                      {getStatusIcon(gift.status)}
                                    </span>
                                  </h3>
                                  <p className="text-sm text-gray-600">{gift.description}</p>
                                  <p className="text-sm font-medium text-green-600">{gift.priceRange}</p>
                                </div>
                                <div className="flex gap-2 items-start">
                                  <Select
                                    value={gift.status || 'pending'}
                                    onValueChange={(value: GiftStatus) => updateGiftStatus(gift.id, value)}
                                  >
                                    <SelectTrigger className="w-[130px] border-green-200">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Available</SelectItem>
                                      <SelectItem value="will_buy">I'll Buy This!</SelectItem>
                                      <SelectItem value="bought">Bought</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="border-green-200 text-green-600 hover:bg-green-50"
                                    onClick={() => startEditing(gift)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => deleteGift(gift.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChristmasWishlist;