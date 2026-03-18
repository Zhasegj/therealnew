import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ShoppingBag } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function CartIcon({ itemCount = 0 }) {
  return (
    <Link 
      to={createPageUrl('Cart')}
      className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
    >
      <ShoppingBag className="w-6 h-6 text-slate-700" />
      {itemCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-500 hover:bg-amber-500 text-white text-xs border-2 border-white"
        >
          {itemCount}
        </Badge>
      )}
    </Link>
  );
}