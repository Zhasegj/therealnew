import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1920)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Discover Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Dream Journey
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Explore handcrafted travel experiences that take you to the world's most 
              breathtaking destinations. From serene beaches to thrilling adventures.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl('Trips')}>
                <Button 
                  size="lg" 
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-6 text-lg rounded-full shadow-lg shadow-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/40"
                >
                  Explore Trips
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 bg-transparent text-white hover:bg-white hover:text-slate-900 px-8 py-6 text-lg rounded-full backdrop-blur-sm transition-all duration-300"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Video
              </Button>
            </div>

            <span className="inline-block px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mt-6">
              ✨ Plan Your Perfect Escape
            </span>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/10"
          >
            {[
              { value: '500+', label: 'Destinations' },
              { value: '50K+', label: 'Happy Travelers' },
              { value: '4.9', label: 'Average Rating' },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}