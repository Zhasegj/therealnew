import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TripCard from '../trips/TripCard';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeaturedTrips({ trips, isLoading }) {
  const featuredTrips = trips?.filter(t => t.is_featured)?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-amber-600 font-medium">Curated for You</span>
          <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">
            Featured Adventures
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Our most popular and highly-rated travel experiences, handpicked by our expert travel designers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTrips.map((trip, index) => (
            <TripCard key={trip.id} trip={trip} index={index} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to={createPageUrl('Trips')}>
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-full px-8 border-slate-300 hover:bg-slate-100"
            >
              View All Trips
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}