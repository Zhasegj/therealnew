import React from 'react';
import { Button } from "@/components/ui/button";
import { Mountain, Palmtree, Building2, Ship, Compass, Sun, Landmark } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Trips', icon: Compass },
  { id: 'adventure', label: 'Adventure', icon: Mountain },
  { id: 'beach', label: 'Beach', icon: Palmtree },
  { id: 'city', label: 'City', icon: Building2 },
  { id: 'cruise', label: 'Cruise', icon: Ship },
  { id: 'cultural', label: 'Cultural', icon: Landmark },
  { id: 'relaxation', label: 'Relaxation', icon: Sun },
  { id: 'mountain', label: 'Mountain', icon: Mountain },
];

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = selected === cat.id;
        return (
          <Button
            key={cat.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(cat.id)}
            className={`
              rounded-full px-4 transition-all duration-300
              ${isActive 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'bg-white hover:bg-slate-50 border-slate-200'
              }
            `}
          >
            <Icon className="w-4 h-4 mr-2" />
            {cat.label}
          </Button>
        );
      })}
    </div>
  );
}