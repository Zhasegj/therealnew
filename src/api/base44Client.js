// src/api/base44Client.js
export const base44 = {
  entities: {
    AdminUser: {
      async filter({ username, password }) {
        const res = await fetch(`/api/admin-users?username=${username}&password=${password}`);
        if (!res.ok) throw new Error("Error fetching admin user");
        return res.json();
      }
    },
    Trip: {
      async filter({ status, id }) {
        if (id) {
          const res = await fetch(`/api/trips/${id}`);
          if (!res.ok) throw new Error("Error fetching trip by ID");
          const trip = await res.json();
          // Convertir is_featured a boolean
          return [{ ...trip, is_featured: !!trip.is_featured }];
        }
        const res = await fetch(`/api/trips?status=${status}`);
        if (!res.ok) throw new Error("Error fetching trips");
        const trips = await res.json();
        return trips.map(t => ({
          ...t,
          is_featured: !!t.is_featured
        }));
      },

      async list(orderBy = "-created_date") {
        const res = await fetch(`/api/trips?orderBy=${orderBy}`);
        if (!res.ok) throw new Error("Error listing trips");
        const trips = await res.json();
        // Convertir is_featured a boolean
        return trips.map(t => ({
          ...t,
          is_featured: !!t.is_featured
        }));
      },

      async delete(id) {
        const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error deleting trip");
        return res.json();
      },

      async update(id, data) {
        // Obtener el tour actual
        const currentRes = await fetch(`/api/trips/${id}`);
        if (!currentRes.ok) throw new Error("Error fetching current trip");
        const currentTrip = await currentRes.json();

        // Fusionar datos: mantener lo existente y sobrescribir con lo nuevo
        const updatedTrip = { ...currentTrip, ...data };

        // Enviar el objeto completo con PUT
        const res = await fetch(`/api/trips/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTrip),
        });
        if (!res.ok) throw new Error("Error updating trip");
        return res.json();
      },

      async create(data) {
        const res = await fetch(`/api/trips`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Error creating trip");
        return res.json();
      }
    },

    CartItem: {
      async filter({ user_email }) {
        const res = await fetch(`/api/cart-items?user_email=${user_email}`);
        if (!res.ok) throw new Error("Error fetching cart items");
        return res.json();
      },
      async create(data) {
        const res = await fetch(`/api/cart-items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Error creating cart item");
        return res.json();
      },
      async delete(id) {
        const res = await fetch(`/api/cart-items/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error deleting cart item");
        return res.json();
      }
    },
    Reservation: {
      async create(data) {
        const res = await fetch(`/api/reservations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Error creating reservation");
        return res.json();
      },
      async list({ user_email, booking_reference } = {}) {
        let url = "/api/reservations";
        if (user_email) {
          url += `?user_email=${encodeURIComponent(user_email)}`;
        } else if (booking_reference) {
          url += `?booking_reference=${encodeURIComponent(booking_reference)}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error fetching reservations");
        return res.json();
      },
      async get(id) {
        const res = await fetch(`/api/reservations/${id}`);
        if (!res.ok) throw new Error("Error fetching reservation");
        return res.json();
      },
      async filter({ user_email, booking_reference }) {
        let url = "/api/reservations";
        if (user_email) {
          url += `?user_email=${encodeURIComponent(user_email)}`;
        } else if (booking_reference) {
          url += `?booking_reference=${encodeURIComponent(booking_reference)}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error filtering reservations");
        return res.json();
      },
      async update(id, data) {
        const res = await fetch(`/api/reservations/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Error updating reservation");
        return res.json();
      },
      async delete(id) {
        const res = await fetch(`/api/reservations/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error deleting reservation");
        return res.json();
      }
    }
  },
  auth: {
    async me() {
      return { email: "guest@example.com", name: "Guest User" };
    },
    redirectToLogin(returnUrl) {
      console.log("Simulated login redirect, ignoring. Return URL:", returnUrl);
      window.location.href = '/Checkout';
    }
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        if (!res.ok) throw new Error("Error uploading file");
        const data = await res.json();

        // Devuelve en el formato que espera TripFormModal
        return { file_url: data.url };
      }
    }
  },
  ui: {
    dialog: {
      // Clases responsivas que imitan la librería original
      contentClass:
        "w-full max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2",
      overlayClass:
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out",
    },
  },

};