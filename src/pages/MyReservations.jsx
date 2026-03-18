import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Ticket, Calendar, Users, MapPin, 
  Clock, Download, Loader2, CheckCircle,
  XCircle, AlertCircle, Trash2, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
};

const paymentStatusConfig = {
  pending: { color: 'bg-orange-100 text-orange-800' },
  paid: { color: 'bg-emerald-100 text-emerald-800' },
  refunded: { color: 'bg-gray-100 text-gray-800' }
};

export default function MyReservations() {
  const queryClient = useQueryClient();
  const initialRef = new URLSearchParams(window.location.search).get('ref') || '';
  const [bookingRef, setBookingRef] = useState(initialRef);
  const [searchedRef, setSearchedRef] = useState(initialRef);

  const getGuestId = () => {
    let id = localStorage.getItem('guest_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('guest_id', id);
    }
    return id;
  };

  const guestId = getGuestId();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: guestReservations, isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations', guestId],
    queryFn: () => base44.entities.Reservation.filter({ user_email: guestId }, '-created_date'),
    initialData: []
  });

  const { data: refReservations = [], isFetching: refFetching } = useQuery({
    queryKey: ['reservationByRef', searchedRef],
    queryFn: () => base44.entities.Reservation.filter({ booking_reference: searchedRef.toUpperCase() }),
    enabled: !!searchedRef,
  });

  // Merge: guest reservations + any found by ref (avoid duplicates)
  const reservations = searchedRef
    ? refReservations
    : guestReservations;

  const { data: trips } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list(),
    initialData: []
  });

  const tripsMap = trips.reduce((acc, trip) => {
    acc[trip.id] = trip;
    return acc;
  }, {});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.Reservation.update(id, { 
      status: 'cancelled',
      payment_status: 'refunded'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', guestId] });
      queryClient.invalidateQueries({ queryKey: ['reservationByRef', searchedRef] });
      toast.success('Reservation cancelled');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Reservation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', guestId] });
      queryClient.invalidateQueries({ queryKey: ['reservationByRef', searchedRef] });
      toast.success('Reservation deleted');
    }
  });

  if (reservationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Reservations</h1>
              <p className="text-slate-600 mt-1">Manage your upcoming and past trips</p>
            </div>
            <Link to={createPageUrl('Trips')}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                Book New Trip
              </Button>
            </Link>
          </div>

          {/* Booking reference search */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border">
            <p className="text-sm font-medium text-slate-700 mb-3">Find a reservation by booking reference</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono uppercase"
                  placeholder="e.g. TRVMMUXEFQVVYF"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && setSearchedRef(bookingRef)}
                />
              </div>
              <Button
                onClick={() => setSearchedRef(bookingRef)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                disabled={!bookingRef}
              >
                Search
              </Button>
              {searchedRef && (
                <Button variant="outline" onClick={() => { setSearchedRef(''); setBookingRef(''); }}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {reservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No reservations yet</h2>
            <p className="text-slate-600 mb-8">Book your first adventure today!</p>
            <Link to={createPageUrl('Trips')}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                Explore Trips
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation, index) => {
              const trip = tripsMap[reservation.trip_id];
              const StatusIcon = statusConfig[reservation.status]?.icon || AlertCircle;

              return (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                          <img
                            src={trip?.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400'}
                            alt={trip?.title || 'Trip'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={statusConfig[reservation.status]?.color || 'bg-gray-100'}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {reservation.status}
                                </Badge>
                                <Badge className={paymentStatusConfig[reservation.payment_status]?.color || 'bg-gray-100'}>
                                  {reservation.payment_status}
                                </Badge>
                              </div>
                              <h3 className="text-xl font-bold text-slate-900">
                                {trip?.title || 'Trip'}
                              </h3>
                              {trip && (
                                <div className="flex items-center gap-1 text-slate-600 text-sm mt-1">
                                  <MapPin className="w-4 h-4" />
                                  {trip.destination}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-slate-500">Booking Reference</p>
                              <p className="font-mono font-bold text-slate-900">
                                {reservation.booking_reference}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-6 text-sm text-slate-600 mb-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-amber-500" />
                              <span>
                                {reservation.departure_date 
                                  ? format(new Date(reservation.departure_date), 'MMM d, yyyy')
                                  : 'Date TBD'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-amber-500" />
                              <span>{reservation.travelers_count || 1} travelers</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-500" />
                              <span>{trip?.duration_days || '?'} days</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                            <div>
                              <span className="text-sm text-slate-500">Total Paid</span>
                              <p className="text-2xl font-bold text-slate-900">
                                ${reservation.total_price?.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => cancelMutation.mutate(reservation.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => deleteMutation.mutate(reservation.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              {trip && (
                                <Link to={createPageUrl(`TripDetails?id=${trip.id}`)}>
                                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                                    View Trip
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}