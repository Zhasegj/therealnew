import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import CartIcon from '@/components/cart/CartIcon';

import { Menu, X, Compass } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const getGuestId = () => {
    let id = localStorage.getItem('guest_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('guest_id', id);
    }
    return id;
  };

  const guestId = getGuestId();

  const { data: cartItems } = useQuery({
    queryKey: ['cartItems', guestId],
    queryFn: () => base44.entities.CartItem.filter({ user_email: guestId }),
    initialData: []
  });

  const cartCount = cartItems?.length || 0;

  

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/' || location.pathname === '/Home';
  const isAdminLoggedIn = !!sessionStorage.getItem('adminLoggedIn');

  const navLinks = [
    { name: 'Home', page: 'Home' },
    { name: 'Trips', page: 'Trips' },
    { name: 'My Reservations', page: 'MyReservations' },
    ...(isAdminLoggedIn ? [{ name: 'Dashboard', page: 'AdminDashboard' }] : []),
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isHomePage
            ? 'bg-white/95 backdrop-blur-md shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link 
              to={createPageUrl('Home')} 
              className="flex items-center gap-2"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                scrolled || !isHomePage ? 'bg-amber-500' : 'bg-transparent'
              }`}>
                <Compass className={`w-6 h-6 transition-colors ${
                  scrolled || !isHomePage ? 'text-slate-900' : 'text-transparent'
                }`} />
              </div>
              <span className={`text-xl font-bold transition-colors ${
                scrolled || !isHomePage ? 'text-slate-900' : 'text-transparent'
              }`}>
                TravelEase
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className={`font-medium transition-colors ${
                    scrolled || !isHomePage
                      ? 'text-slate-600 hover:text-slate-900' 
                      : 'text-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Cart Icon - only shown when there are items */}
              {cartCount > 0 && (scrolled || !isHomePage) && (
                <CartIcon itemCount={cartCount} />
              )}
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg ${
                  scrolled || !isHomePage ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                }`}
              >
                {mobileMenuOpen ? (
                  <X className={`w-6 h-6 ${scrolled || !isHomePage ? 'text-slate-900' : 'text-white'}`} />
                ) : (
                  <Menu className={`w-6 h-6 ${scrolled || !isHomePage ? 'text-slate-900' : 'text-white'}`} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-900 font-medium"
                >
                  {link.name}
                </Link>
              ))}
              
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={isHomePage ? '' : 'pt-20'}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Compass className="w-6 h-6 text-slate-900" />
                </div>
                <span className="text-xl font-bold">TravelEase</span>
              </div>
              <p className="text-slate-400">
                Crafting unforgettable travel experiences since 2020. Your journey starts here.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to={createPageUrl('Trips')} className="hover:text-white transition-colors">All Trips</Link></li>
                
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-slate-400">
                <li><span className="hover:text-white transition-colors cursor-pointer">Adventure</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Beach</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Cultural</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Cruise</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400">
                <li>support@travelease.com</li>
                <li>+1 (555) 123-4567</li>
                <li>Mon-Fri 9am-6pm EST</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} TravelEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}