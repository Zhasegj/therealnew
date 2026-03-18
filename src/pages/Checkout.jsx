import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, Lock, CheckCircle, ArrowLeft, 
  User, Mail, Loader2, ShieldCheck
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Checkout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    country: '',
    phone: '',
    address: '',
    city: '',
    special_requests: ''
  });

  const countryCodes = {
    'US': { name: 'United States', code: '+1', flag: '🇺🇸' },
    'MX': { name: 'Mexico', code: '+52', flag: '🇲🇽' },
    'CA': { name: 'Canada', code: '+1', flag: '🇨🇦' },
    'GB': { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    'ES': { name: 'Spain', code: '+34', flag: '🇪🇸' },
    'FR': { name: 'France', code: '+33', flag: '🇫🇷' },
    'DE': { name: 'Germany', code: '+49', flag: '🇩🇪' },
    'IT': { name: 'Italy', code: '+39', flag: '🇮🇹' },
    'BR': { name: 'Brazil', code: '+55', flag: '🇧🇷' },
    'AR': { name: 'Argentina', code: '+54', flag: '🇦🇷' },
    'CO': { name: 'Colombia', code: '+57', flag: '🇨🇴' },
    'CL': { name: 'Chile', code: '+56', flag: '🇨🇱' },
    'PE': { name: 'Peru', code: '+51', flag: '🇵🇪' },
    'AU': { name: 'Australia', code: '+61', flag: '🇦🇺' },
    'JP': { name: 'Japan', code: '+81', flag: '🇯🇵' },
    'CN': { name: 'China', code: '+86', flag: '🇨🇳' },
    'IN': { name: 'India', code: '+91', flag: '🇮🇳' },
    'KR': { name: 'South Korea', code: '+82', flag: '🇰🇷' },
  };
  const [isProcessing, setIsProcessing] = useState(false);

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

  const tripsMap = trips.reduce((acc, trip) => {
    acc[trip.id] = trip;
    return acc;
  }, {});

  const createReservationMutation = useMutation({
    mutationFn: (data) => base44.entities.Reservation.create(data),
  });

  const deleteCartItemMutation = useMutation({
    mutationFn: (id) => base44.entities.CartItem.delete(id),
  });

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.unit_price || 0) * (item.travelers_count || 1);
  }, 0);

  const generateBookingRef = () => {
    return 'TRV' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.phone || !formData.country || !formData.address || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    // Create reservations for each cart item
    for (const item of cartItems) {
      const trip = tripsMap[item.trip_id];
      if (!trip) continue;

      await createReservationMutation.mutateAsync({
        trip_id: item.trip_id,
        user_email: guestId,
        departure_date: item.departure_date,
        travelers_count: item.travelers_count || 1,
        travelers_info: [{
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone
        }],
        total_price: (item.unit_price || 0) * (item.travelers_count || 1),
        status: 'confirmed',
        payment_status: 'paid',
        special_requests: formData.special_requests,
        booking_reference: generateBookingRef()
      });

      await deleteCartItemMutation.mutateAsync(item.id);
    }

    queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
    
    toast.success('Booking confirmed! Check your reservations.');
    navigate(createPageUrl('MyReservations'));
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-600 mb-6">Add some trips to your cart first.</p>
            <Link to={createPageUrl('Trips')}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                Explore Trips
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <Link to={createPageUrl('Cart')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-slate-900 mb-8"
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-500" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        placeholder="John Doe"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(v) => setFormData({...formData, country: v, phone: ''})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(countryCodes).map(([code, data]) => (
                          <SelectItem key={code} value={code}>
                            {data.flag} {data.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center gap-2 px-4 bg-slate-100 border border-slate-200 rounded-md text-slate-600 font-medium min-w-[100px]">
                        {formData.country ? (
                          <>
                            <span className="text-lg">{countryCodes[formData.country]?.flag}</span>
                            <span>{countryCodes[formData.country]?.code}</span>
                          </>
                        ) : '---'}
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={formData.country ? "Enter phone number" : "Select country first"}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                        disabled={!formData.country}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street, Apt 4B"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Special Requests */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Special Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any dietary requirements, accessibility needs, or special requests..."
                    className="min-h-[100px]"
                    value={formData.special_requests}
                    onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                  />
                </CardContent>
              </Card>

              {/* Payment (Simulated) */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-800">Demo Mode</p>
                      <p className="text-sm text-amber-700">
                        This is a demo. No real payment will be processed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit"
                className="w-full py-6 text-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Complete Booking - ${totalPrice.toLocaleString()}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => {
                    const trip = tripsMap[item.trip_id];
                    if (!trip) return null;
                    return (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={trip.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=100'}
                          alt={trip.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 text-sm line-clamp-1">
                            {trip.title}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {item.travelers_count || 1} travelers
                          </p>
                          <p className="font-semibold text-sm">
                            ${((item.unit_price || 0) * (item.travelers_count || 1)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Taxes & Fees</span>
                    <span>Included</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}