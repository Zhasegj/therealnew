import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TripCard({ trip, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={createPageUrl(`TripDetails?id=${trip.id}`)}>
        <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
          <div className="relative h-64 overflow-hidden">
            <img
              src={trip.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'}
              alt={trip.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {trip.is_featured && (
              <Badge className="absolute top-4 left-4 bg-amber-500 hover:bg-amber-600 text-white border-0">
                Featured
              </Badge>
            )}
            
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-700">
                {trip.category?.replace('_', ' ')}
              </Badge>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                {trip.title}
              </h3>
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{trip.destination}</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <p className="text-slate-600 text-sm line-clamp-2 mb-4 min-h-[40px]">
              {trip.short_description || trip.description?.substring(0, 100)}
            </p>

            <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{trip.duration_days} days</span>
              </div>
              {trip.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{trip.rating}</span>
                  <span className="text-slate-400">({trip.reviews_count})</span>
                </div>
              )}
              {trip.max_travelers && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Max {trip.max_travelers}</span>
                </div>
              )}
            </div>

            <div className="flex items-end justify-between pt-4 border-t border-slate-100">
              <div>
                <span className="text-sm text-slate-500">From</span>
                <p className="text-2xl font-bold text-slate-900">
                  ${trip.price?.toLocaleString()}
                </p>
                <span className="text-xs text-slate-500">per person</span>
              </div>
              <span className="text-amber-600 font-medium group-hover:translate-x-1 transition-transform duration-300">
                View Details →
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}