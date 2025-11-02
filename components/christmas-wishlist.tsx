// components/christmas-wishlist.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Gift, Plus, Pencil, Trash2, X, Check, ShoppingCart, Package, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Gift as GiftType } from '../lib/db/schema';

type GiftStatus = 'pending' | 'will_buy' | 'bought';
interface ExtendedGift extends Omit<GiftType, 'status'> {
  status: GiftStatus | null;
}

// URL detection regex pattern
const urlPattern = /(https?:\/\/[^\s]+)/g;

// Component to render text with clickable links
const TextWithLinks = ({ text }: { text: string }) => {
  if (!text) return null;

  const parts = text.split(urlPattern);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.match(urlPattern)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-amber-200 underline font-medium"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </span>
  );
};

const ChristmasWishlist = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [gifts, setGifts] = useState<ExtendedGift[]>([]);
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

  const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;

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

  const addGift = async () => {
    if (newGift.item.trim()) {
      try {
        const response = await fetch('/api/gifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newGift)
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

  const getStatusColor = (status: GiftStatus | null | undefined) => {
    switch (status) {
      case 'bought':
        return 'text-emerald-700 bg-emerald-100';
      case 'will_buy':
        return 'text-amber-700 bg-amber-100';
      default:
        return 'text-slate-600 bg-slate-100';
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

  const isCurrentUserSelected = selectedUser === currentUserId;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 relative z-10">
      <Card className="glass-strong border-white/30 shadow-2xl overflow-hidden relative group">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/8 via-green-700/5 to-red-600/10 animate-pulse pointer-events-none" style={{ animationDuration: '4s' }}></div>

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 text-red-400/30 text-2xl animate-pulse">🎄</div>
        <div className="absolute top-4 right-4 text-red-400/30 text-2xl animate-pulse" style={{ animationDelay: '1s' }}>🎄</div>
        <div className="absolute bottom-4 left-4 text-amber-300/30 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
        <div className="absolute bottom-4 right-4 text-amber-300/30 text-xl animate-pulse" style={{ animationDelay: '1.5s' }}>⭐</div>

        <CardHeader className="relative z-10 pb-8">
          <CardTitle className="flex items-center justify-center gap-3 text-white drop-shadow-lg">
            <div className="relative animate-bounce" style={{ animationDuration: '3s' }}>
              <Gift className="h-12 w-12 text-emerald-300 drop-shadow-lg filter drop-shadow-[0_0_8px_rgba(6,95,70,0.4)]" />
              <Sparkles className="h-5 w-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-emerald-300 via-white to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
              Family Christmas Wishlist
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {users.map((user) => (
                <Button
                  key={user.id}
                  variant={selectedUser === user.id ? "default" : "outline"}
                  className={selectedUser === user.id
                    ? "bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white border-0 shadow-lg font-semibold transition-all duration-300 hover:scale-105 festive-glow"
                    : "glass border-white/30 text-white hover:bg-white/20 font-medium transition-all duration-300 hover:scale-105 hover:border-white/50"}
                  onClick={() => setSelectedUser(user.id)}
                >
                  {user.name}
                  {user.id === currentUserId && " (You)"}
                </Button>
              ))}
            </div>

            {selectedUser && (
              <div className="mt-4">
                <Card className="glass-card border-white/20 shadow-xl">
                  <CardContent className="pt-6">
                    {isCurrentUserSelected && (
                      <div className="space-y-4 mb-6">
                        <div>
                          <Label className="text-white/90 font-medium">Gift Item</Label>
                          <Input
                            placeholder="What would you like?"
                            value={newGift.item}
                            onChange={(e) => setNewGift({ ...newGift, item: e.target.value })}
                            className="glass border-white/30 text-white placeholder:text-white/50 focus:border-emerald-300 focus:ring-emerald-300/30 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <Label className="text-white/90 font-medium">Description</Label>
                          <Textarea
                            placeholder="Add any specific details... URLs will become clickable links!"
                            value={newGift.description}
                            onChange={(e) => setNewGift({ ...newGift, description: e.target.value })}
                            className="glass border-white/30 text-white placeholder:text-white/50 focus:border-emerald-300 focus:ring-emerald-300/30 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <Label className="text-white/90 font-medium">Price Range</Label>
                          <Input
                            placeholder="$20-30"
                            value={newGift.priceRange}
                            onChange={(e) => setNewGift({ ...newGift, priceRange: e.target.value })}
                            className="glass border-white/30 text-white placeholder:text-white/50 focus:border-emerald-300 focus:ring-emerald-300/30 transition-all duration-300"
                          />
                        </div>
                        <Button
                          onClick={addGift}
                          className="bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white border-0 shadow-lg font-semibold transition-all duration-300 hover:scale-105 festive-glow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to My Wishlist
                        </Button>
                      </div>
                    )}

                    <div className="space-y-4">
                      {selectedUserGifts.map((gift) => (
                        <Card key={gift.id} className="glass-card border-white/20 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <CardContent className="pt-6 relative z-10">
                            {editingGift === gift.id ? (
                              <div className="space-y-4">
                                <Input
                                  value={editedGift.item}
                                  onChange={(e) => setEditedGift({ ...editedGift, item: e.target.value })}
                                  className="glass border-white/30 text-white placeholder:text-white/50 focus:border-emerald-300 focus:ring-emerald-300/30 transition-all duration-300"
                                />
                                <Textarea
                                  value={editedGift.description}
                                  onChange={(e) => setEditedGift({ ...editedGift, description: e.target.value })}
                                  className="glass border-white/30 text-white placeholder:text-white/50 focus:border-emerald-300 focus:ring-emerald-300/30 transition-all duration-300"
                                />
                                <Input
                                  value={editedGift.priceRange}
                                  onChange={(e) => setEditedGift({ ...editedGift, priceRange: e.target.value })}
                                  className="glass border-white/30 text-white placeholder:text-white/50 focus:border-emerald-300 focus:ring-emerald-300/30 transition-all duration-300"
                                />
                                <div className="flex gap-2">
                                  <Button onClick={() => saveEdit(gift.id)} size="sm" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 festive-glow">
                                    <Check className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button onClick={cancelEditing} variant="outline" size="sm" className="glass border-white/30 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="space-y-2 min-w-0 flex-1">
                                  <h3 className="font-bold flex items-center gap-2 text-white text-lg drop-shadow">
                                    {gift.item}
                                    <span className={`${getStatusColor(gift.status)} p-1.5 rounded-full shadow-lg`}>
                                      {getStatusIcon(gift.status)}
                                    </span>
                                  </h3>
                                  <div className="text-sm text-white/80 break-words">
                                    <TextWithLinks text={gift.description || ''} />
                                  </div>
                                  <p className="text-sm font-semibold text-emerald-300">{gift.priceRange}</p>
                                </div>
                                <div className="flex gap-2 items-start shrink-0">
                                  <Select
                                    value={gift.status || 'pending'}
                                    onValueChange={(value: GiftStatus) => updateGiftStatus(gift.id, value)}
                                  >
                                    <SelectTrigger className="w-[140px] glass border-white/30 text-white focus:ring-white/30 transition-all duration-300 hover:border-white/50 hover:bg-white/10">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-strong border-white/30">
                                      <SelectItem value="pending" className="text-white hover:bg-white/20 cursor-pointer transition-all">Available</SelectItem>
                                      <SelectItem value="will_buy" className="text-white hover:bg-white/20 cursor-pointer transition-all">I&apos;ll Buy This! 🎁</SelectItem>
                                      <SelectItem value="bought" className="text-white hover:bg-white/20 cursor-pointer transition-all">Bought ✓</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {gift.userId === currentUserId && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="glass border-white/30 text-emerald-300 hover:text-emerald-200 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:rotate-3"
                                        onClick={() => startEditing(gift)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="glass border-white/30 text-red-400 hover:text-red-300 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:rotate-3"
                                        onClick={() => deleteGift(gift.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
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
