import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, 
  Calendar, Users, MapPin, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Cart() {
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getGuestId = () => {
    let id = localStorage.getItem('guest_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('guest_id', id);
    }
    return id;
  };
  const guestId = getGuestId();

  const { data: cartItems, isLoading: cartLoading } = useQuery({
    queryKey: ['cartItems', guestId],
    queryFn: () => base44.entities.CartItem.filter({ user_email: guestId }),
    initialData: []
  });

  const { data: trips } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list(),
    initialData: []
  });

  const tripsMap = (trips || []).reduce((acc, trip) => {
    acc[trip.id] = trip;
    return acc;
  }, {});

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CartItem.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cartItems'] })
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.CartItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast.success('Item removed from cart');
    }
  });

  const updateTravelersCount = (item, delta) => {
    const newCount = Math.max(1, (item.travelers_count || 1) + delta);
    updateItemMutation.mutate({
      id: item.id,
      data: { travelers_count: newCount }
    });
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.unit_price || 0) * (item.travelers_count || 1);
  }, 0);

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-slate-900 mb-8"
        >
          Your Cart
        </motion.h1>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-600 mb-8">Looks like you haven't added any trips yet.</p>
            <Link to={createPageUrl('Trips')}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                Explore Trips
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => {
                  const trip = tripsMap[item.trip_id];
                  if (!trip) return null;
                  
                  const itemTotal = (item.unit_price || 0) * (item.travelers_count || 1);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Card className="overflow-hidden border-0 shadow-lg">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
                              <img
                                src={trip.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400'}
                                alt={trip.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {trip.title}
                                  </h3>
                                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                                    <MapPin className="w-4 h-4" />
                                    {trip.destination}
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteItemMutation.mutate(item.id)}
                                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                                {item.departure_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(item.departure_date), 'MMM d, yyyy')}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-slate-600">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Travelers:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateTravelersCount(item, -1)}
                                      className="p-1 rounded-full hover:bg-slate-100"
                                      disabled={item.travelers_count <= 1}
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">
                                      {item.travelers_count || 1}
                                    </span>
                                    <button
                                      onClick={() => updateTravelersCount(item, 1)}
                                      className="p-1 rounded-full hover:bg-slate-100"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-sm text-slate-500">
                                    ${item.unit_price?.toLocaleString()} × {item.travelers_count || 1}
                                  </p>
                                  <p className="text-xl font-bold text-slate-900">
                                    ${itemTotal.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => {
                      const trip = tripsMap[item.trip_id];
                      if (!trip) return null;
                      return (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-600 truncate max-w-[200px]">
                            {trip.title} × {item.travelers_count || 1}
                          </span>
                          <span className="font-medium">
                            ${((item.unit_price || 0) * (item.travelers_count || 1)).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-lg font-bold text-slate-900">
                      <span>Total</span>
                      <span>${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <Link to={createPageUrl('Checkout')}>
                    <Button className="w-full py-6 text-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl">
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>

                  <Link to={createPageUrl('Trips')}>
                    <Button variant="ghost" className="w-full mt-3">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}