import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Users, Search, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
};

const paymentConfig = {
  pending: 'bg-orange-100 text-orange-800',
  paid: 'bg-emerald-100 text-emerald-800',
  refunded: 'bg-gray-100 text-gray-800'
};

export default function AdminReservations() {
  const [search, setSearch] = useState('');

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['adminReservations'],
    queryFn: () => base44.entities.Reservation.list('-created_date'),
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list(),
  });

  const tripsMap = trips.reduce((acc, t) => { acc[t.id] = t; return acc; }, {});

  const filtered = reservations.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    const trip = tripsMap[r.trip_id];
    return (
      r.booking_reference?.toLowerCase().includes(q) ||
      r.travelers_info?.[0]?.full_name?.toLowerCase().includes(q) ||
      r.travelers_info?.[0]?.email?.toLowerCase().includes(q) ||
      trip?.title?.toLowerCase().includes(q)
    );
  });

  const totalRevenue = reservations
    .filter(r => r.payment_status === 'paid')
    .reduce((sum, r) => sum + (r.total_price || 0), 0);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Total Reservaciones</p>
            <p className="text-3xl font-bold text-slate-900">{reservations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Pagadas</p>
            <p className="text-3xl font-bold text-emerald-600">
              {reservations.filter(r => r.payment_status === 'paid').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Ingresos Totales</p>
            <p className="text-3xl font-bold text-amber-600">${totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar por nombre, email, referencia o tour..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-slate-500">
            No hay reservaciones que coincidan
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const trip = tripsMap[r.trip_id];
            const traveler = r.travelers_info?.[0];
            const StatusIcon = statusConfig[r.status]?.icon || Clock;

            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Trip image */}
                    <img
                      src={trip?.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200'}
                      alt={trip?.title}
                      className="w-full md:w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{trip?.title || 'Tour desconocido'}</h3>
                        <Badge className={statusConfig[r.status]?.color || 'bg-gray-100'}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {r.status}
                        </Badge>
                        <Badge className={paymentConfig[r.payment_status] || 'bg-gray-100'}>
                          {r.payment_status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        {traveler && (
                          <span className="font-medium text-slate-800">{traveler.full_name}</span>
                        )}
                        {traveler?.email && (
                          <span className="text-slate-500">{traveler.email}</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          {r.departure_date ? format(new Date(r.departure_date), 'MMM d, yyyy') : 'Sin fecha'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-amber-500" />
                          {r.travelers_count} viajeros
                        </span>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                          {r.booking_reference}
                        </span>
                      </div>
                    </div>

                    {/* Price + Action */}
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                      <p className="text-xl font-bold text-slate-900">
                        ${r.total_price?.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        {r.created_date ? format(new Date(r.created_date), 'dd/MM/yyyy') : ''}
                      </p>
                      <Link to={`${createPageUrl('MyReservations')}?ref=${r.booking_reference}`} target="_blank">
                        <Button size="sm" variant="outline" className="text-amber-600 border-amber-300 hover:bg-amber-50">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          Ver reserva
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}