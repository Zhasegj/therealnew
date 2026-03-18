import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, LogOut, Compass, MapPin, Clock, DollarSign, 
  Edit, Trash2, Eye, EyeOff
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import TripFormModal from '../components/admin/TripFormModal';
import AdminReservations from '../components/admin/AdminReservations';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('tours');
  const queryClient = useQueryClient();

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      window.location.href = createPageUrl('AdminLogin');
    }
  }, []);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['adminTrips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (tripId) => base44.entities.Trip.delete(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTrips'] });
      toast.success('Tour eliminado correctamente');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Trip.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTrips'] });
      toast.success('Estado actualizado');
    },
  });

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = createPageUrl('AdminLogin');
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setIsModalOpen(true);
  };

  const handleDelete = (trip) => {
    if (window.confirm(`¿Estás seguro de eliminar "${trip.title}"?`)) {
      deleteMutation.mutate(trip.id);
    }
  };

  const handleToggleStatus = (trip) => {
    const newStatus = trip.status === 'active' ? 'draft' : 'active';
    toggleStatusMutation.mutate({ id: trip.id, status: newStatus });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrip(null);
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    draft: 'bg-slate-100 text-slate-700',
    sold_out: 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <Compass className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900">TravelEase Admin</h1>
                <p className="text-xs text-slate-500">Panel de Administración</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          <button
            onClick={() => setActiveTab('tours')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'tours' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Gestión de Tours
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'reservations' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Reservaciones
          </button>
        </div>

        {activeTab === 'reservations' ? (
          <AdminReservations />
        ) : (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500">Total Tours</p>
                  <p className="text-3xl font-bold text-slate-900">{trips.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500">Tours Activos</p>
                  <p className="text-3xl font-bold text-green-600">
                    {trips.filter(t => t.status === 'active').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500">Borradores</p>
                  <p className="text-3xl font-bold text-slate-600">
                    {trips.filter(t => t.status === 'draft').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Gestión de Tours</h2>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Tour
              </Button>
            </div>

            {/* Tours List */}
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : trips.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-slate-500">No hay tours registrados</p>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-900"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear primer tour
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {trips.map((trip) => (
                  <Card key={trip.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={trip.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200'}
                          alt={trip.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 truncate">{trip.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[trip.status] || statusColors.draft}`}>
                              {trip.status === 'active' ? 'Activo' : trip.status === 'sold_out' ? 'Agotado' : 'Borrador'}
                            </span>
                            {trip.is_featured && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                Destacado
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {trip.destination}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {trip.duration_days} días
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${trip.price?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(trip)}
                            title={trip.status === 'active' ? 'Desactivar' : 'Activar'}
                          >
                            {trip.status === 'active' ? (
                              <EyeOff className="w-4 h-4 text-slate-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-500" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(trip)}>
                            <Edit className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(trip)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <TripFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        trip={editingTrip}
      />
    </div>
  );
}