import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Headphones, CreditCard, Award } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'Your payments and personal data are protected with enterprise-grade security.'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our travel experts are available around the clock to assist you.'
  },
  {
    icon: CreditCard,
    title: 'Flexible Payment',
    description: 'Pay in installments or full. Free cancellation up to 48 hours before.'
  },
  {
    icon: Award,
    title: 'Best Price Guarantee',
    description: 'Found a lower price? We\'ll match it and give you 10% off.'
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-amber-600 font-medium">Why Travel With Us</span>
          <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">
            The TravelEase Difference
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            We're committed to making your travel experience seamless, safe, and unforgettable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300"
              >
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}