import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Clock, Star, Users, CalendarDays, Check, X, 
  Heart, Share2, ChevronLeft, ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function TripDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('id');
  
  const [selectedDate, setSelectedDate] = useState('');
  const [travelersCount, setTravelersCount] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateError, setDateError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.filter({ id: tripId });
      return trips[0];
    },
    enabled: !!tripId
  });

  const getGuestId = () => {
    let id = localStorage.getItem('guest_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('guest_id', id);
    }
    return id;
  };

  const handleBookNow = async () => {
    if (!selectedDate) {
      setDateError(true);
      return;
    }
    setDateError(false);
    setIsBooking(true);
    
    const guestId = getGuestId();
    await base44.entities.CartItem.create({
      user_email: guestId,
      trip_id: tripId,
      departure_date: selectedDate,
      travelers_count: travelersCount,
      unit_price: trip.price
    });
    
    window.location.href = createPageUrl('Checkout');
  };

  const allImages = trip ? [trip.image_url, ...(trip.gallery || [])].filter(Boolean) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Trip not found</h2>
          <Link to={createPageUrl('Trips')}>
            <Button>Browse Trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = (trip.price || 0) * travelersCount;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Image Gallery */}
      <div className="relative h-[50vh] md:h-[60vh] bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={allImages[currentImageIndex] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920'}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        
        {allImages.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-6 right-6 flex gap-2">
          <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
            <Heart className="w-5 h-5 text-white" />
          </button>
          <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    {trip.category?.replace('_', ' ')}
                  </Badge>
                  {trip.is_featured && (
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                      Featured
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  {trip.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span>{trip.duration_days} days</span>
                  </div>
                  {trip.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span>{trip.rating} ({trip.reviews_count} reviews)</span>
                    </div>
                  )}
                  {trip.max_travelers && (
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-500" />
                      <span>Max {trip.max_travelers} travelers</span>
                    </div>
                  )}
                </div>

                <p className="text-slate-600 text-lg leading-relaxed">
                  {trip.description}
                </p>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <Tabs defaultValue="itinerary">
                  <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto pb-0">
                    <TabsTrigger 
                      value="itinerary"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent"
                    >
                      Itinerary
                    </TabsTrigger>
                    <TabsTrigger 
                      value="included"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent"
                    >
                      What's Included
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="itinerary" className="mt-6">
                    {trip.itinerary?.length > 0 ? (
                      <div className="space-y-6">
                        {trip.itinerary.map((day, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-amber-700">D{day.day}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-1">{day.title}</h4>
                              <p className="text-slate-600">{day.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">Detailed itinerary coming soon.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="included" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500" />
                          What's Included
                        </h4>
                        <ul className="space-y-3">
                          {(trip.included || ['Accommodation', 'Guided tours', 'Transportation']).map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-slate-600">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <X className="w-5 h-5 text-red-500" />
                          Not Included
                        </h4>
                        <ul className="space-y-3">
                          {(trip.not_included || ['Flights', 'Travel insurance', 'Personal expenses']).map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-slate-600">
                              <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6 pb-6 border-b">
                  <span className="text-sm text-slate-500">From</span>
                  <p className="text-4xl font-bold text-slate-900">
                    ${trip.price?.toLocaleString()}
                  </p>
                  <span className="text-slate-500">per person</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <CalendarDays className="w-4 h-4 inline mr-2" />
                      Departure Date
                    </label>
                    {dateError && (
                      <div className="mb-2 px-3 py-2 rounded-lg border border-red-400 bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2">
                        ⚠️ Debes seleccionar una fecha antes de continuar.
                      </div>
                    )}
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${dateError ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {selectedDate ? format(new Date(selectedDate + 'T12:00:00'), 'MMMM d, yyyy') : 'Select departure date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate ? new Date(selectedDate + 'T12:00:00') : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              setSelectedDate(`${year}-${month}-${day}`);
                              setDateError(false);
                              setCalendarOpen(false);
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (date <= today) return true;
                            return false;
                          }}
                          fromDate={new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Number of Travelers
                    </label>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                        disabled={travelersCount <= 1}
                      >
                        <span className="text-xl font-medium">−</span>
                      </Button>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-slate-900">{travelersCount}</span>
                        <p className="text-xs text-slate-500">{travelersCount === 1 ? 'Traveler' : 'Travelers'}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={() => setTravelersCount(travelersCount + 1)}
                      >
                        <span className="text-xl font-medium">+</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between text-slate-600 mb-2">
                    <span>${trip.price?.toLocaleString()} × {travelersCount}</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-slate-900 pt-2 border-t">
                    <span>Total</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  className="w-full py-6 text-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl"
                  onClick={handleBookNow}
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Book Now
                </Button>

                <p className="text-center text-sm text-slate-500 mt-4">
                  Free cancellation up to 48 hours before
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}