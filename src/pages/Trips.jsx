import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import TripCard from '../components/trips/TripCard';
import CategoryFilter from '../components/trips/CategoryFilter';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Trips() {
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.filter({ status: 'active' }),
    initialData: []
  });

  const filteredTrips = useMemo(() => {
    let result = [...trips];

    // Filter by category
    if (category !== 'all') {
      result = result.filter(trip => trip.category === category);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trip =>
        trip.title?.toLowerCase().includes(query) ||
        trip.destination?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'duration':
        result.sort((a, b) => (a.duration_days || 0) - (b.duration_days || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return result;
  }, [trips, category, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div 
        className="relative h-80 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/90" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Explore All Trips
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-300 text-lg max-w-2xl"
          >
            Find your perfect adventure from our curated collection of extraordinary travel experiences
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-8 space-y-6">
          <CategoryFilter selected={category} onSelect={setCategory} />
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 rounded-xl border-slate-200 focus:ring-amber-500"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <SlidersHorizontal className="w-5 h-5 text-slate-400" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredTrips.length}</span> trips
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrips.map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No trips found</h3>
            <p className="text-slate-600">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}