import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  { value: 'adventure', label: 'Aventura' },
  { value: 'relaxation', label: 'Relajación' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'beach', label: 'Playa' },
  { value: 'mountain', label: 'Montaña' },
  { value: 'city', label: 'Ciudad' },
  { value: 'cruise', label: 'Crucero' },
];

const initialFormData = {
  title: '',
  destination: '',
  description: '',
  short_description: '',
  price: '',
  currency: 'USD',
  duration_days: '',
  category: 'adventure',
  image_url: '',
  max_travelers: '',
  rating: '',
  reviews_count: '',
  is_featured: false,
  status: 'active',
  included: '',
  not_included: '',
};

export default function TripFormModal({ isOpen, onClose, trip }) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'file'
  const [uploadingImage, setUploadingImage] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (trip) {
      setFormData({
        title: trip.title || '',
        destination: trip.destination || '',
        description: trip.description || '',
        short_description: trip.short_description || '',
        price: trip.price?.toString() || '',
        currency: trip.currency || 'USD',
        duration_days: trip.duration_days?.toString() || '',
        category: trip.category || 'adventure',
        image_url: trip.image_url || '',
        max_travelers: trip.max_travelers?.toString() || '',
        rating: trip.rating?.toString() || '',
        reviews_count: trip.reviews_count?.toString() || '',
        is_featured: trip.is_featured || false,
        status: trip.status || 'active',
        included: trip.included?.join('\n') || '',
        not_included: trip.not_included?.join('\n') || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [trip, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Trip.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTrips'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Tour creado correctamente');
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Trip.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTrips'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Tour actualizado correctamente');
      onClose();
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      title: formData.title,
      destination: formData.destination,
      description: formData.description,
      short_description: formData.short_description,
      price: parseFloat(formData.price) || 0,
      currency: formData.currency || 'USD',
      duration_days: parseInt(formData.duration_days) || 1,
      category: formData.category,
      image_url: formData.image_url,
      max_travelers: parseInt(formData.max_travelers) || null,
      rating: parseFloat(formData.rating) || 0,
      reviews_count: parseInt(formData.reviews_count) || 0,
      is_featured: formData.is_featured,
      status: formData.status,
      included: formData.included ? formData.included.split('\n').filter(Boolean) : [],
      not_included: formData.not_included ? formData.not_included.split('\n').filter(Boolean) : [],
    };

    if (trip) {
      updateMutation.mutate({ id: trip.id, data });
    } else {
      createMutation.mutate(data);
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    handleChange('image_url', file_url);
    setUploadingImage(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {trip ? 'Editar Tour' : 'Agregar Nuevo Tour'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ej: Aventura en los Alpes"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destino *</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => handleChange('destination', e.target.value)}
                placeholder="Ej: Suiza"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Descripción Corta</Label>
            <Input
              id="short_description"
              value={formData.short_description}
              onChange={(e) => handleChange('short_description', e.target.value)}
              placeholder="Breve resumen para las tarjetas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción Completa</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción detallada del tour..."
              rows={4}
            />
          </div>

          {/* Pricing & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <div className="flex gap-2">
                <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
                  <SelectTrigger className="w-24 flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="1500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_days">Duración (días) *</Label>
              <Input
                id="duration_days"
                type="number"
                value={formData.duration_days}
                onChange={(e) => handleChange('duration_days', e.target.value)}
                placeholder="7"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_travelers">Máx. Viajeros</Label>
              <Input
                id="max_travelers"
                type="number"
                value={formData.max_travelers}
                onChange={(e) => handleChange('max_travelers', e.target.value)}
                placeholder="20"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="sold_out">Agotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label>Imagen del Tour</Label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${imageMode === 'url' ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                URL
              </button>
              <button
                type="button"
                onClick={() => setImageMode('file')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${imageMode === 'file' ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
              >
                <Upload className="w-3.5 h-3.5" />
                Archivo local
              </button>
            </div>

            {imageMode === 'url' ? (
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            ) : (
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-amber-400 transition-colors">
                    {uploadingImage ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Subiendo imagen...
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">
                        <Upload className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                        Haz clic para seleccionar imagen
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                </label>
                {formData.image_url && (
                  <img src={formData.image_url} alt="preview" className="w-16 h-16 object-cover rounded-lg border" />
                )}
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => handleChange('rating', e.target.value)}
                placeholder="4.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviews_count">Número de Reviews</Label>
              <Input
                id="reviews_count"
                type="number"
                value={formData.reviews_count}
                onChange={(e) => handleChange('reviews_count', e.target.value)}
                placeholder="125"
              />
            </div>
          </div>

          {/* Included / Not Included */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="included">Qué Incluye (uno por línea)</Label>
              <Textarea
                id="included"
                value={formData.included}
                onChange={(e) => handleChange('included', e.target.value)}
                placeholder="Alojamiento&#10;Transporte&#10;Guía turístico"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="not_included">No Incluye (uno por línea)</Label>
              <Textarea
                id="not_included"
                value={formData.not_included}
                onChange={(e) => handleChange('not_included', e.target.value)}
                placeholder="Vuelos&#10;Seguro de viaje&#10;Gastos personales"
                rows={4}
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label>Tour Destacado</Label>
              <p className="text-sm text-slate-500">Se mostrará en la página principal</p>
            </div>
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(v) => handleChange('is_featured', v)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-amber-500 hover:bg-amber-600 text-slate-900"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                trip ? 'Actualizar Tour' : 'Crear Tour'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}