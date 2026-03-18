import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '../components/home/HeroSection';
import FeaturedTrips from '../components/home/FeaturedTrips';
import WhyChooseUs from '../components/home/WhyChooseUs';

export default function Home() {
  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.filter({ status: 'active' }),
    initialData: []
  });

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <FeaturedTrips trips={trips} isLoading={isLoading} />
      <WhyChooseUs />
      
      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Get Exclusive Travel Deals
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter and be the first to know about special offers and new destinations.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="button"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-full transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}