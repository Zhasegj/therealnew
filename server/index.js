// server/index.js
import express from "express";
import db from "./db.js";
import multer from "multer";

const app = express();
const PORT = 3000;

app.use(express.json());

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Nombre único
  }
});

const upload = multer({ storage });

// Endpoint para subir imágenes
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  // Devolver la URL pública de la imagen
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Servir la carpeta de uploads como estática
app.use("/uploads", express.static("uploads"));

/* ------------------- ADMIN USERS ------------------- */
// Endpoint para login de admin
app.get("/api/admin-users", (req, res) => {
  const { username, password } = req.query;
  const stmt = db.prepare("SELECT * FROM AdminUser WHERE username = ? AND password = ?");
  const user = stmt.get(username, password);

  if (user) {
    res.json([user]); // devuelve un array como espera tu frontend
  } else {
    res.json([]);
  }
});

/* ------------------- TRIPS ------------------- */
// Listar trips
app.get("/api/trips", (req, res) => {
  const { status, orderBy } = req.query;
  let query = "SELECT * FROM Trip";
  let params = [];

  if (status) {
    query += " WHERE status = ?";
    params.push(status);
  }

  const trips = db.prepare(query).all(...params);

  const parsedTrips = trips.map(trip => ({
    ...trip,
    gallery: trip.gallery ? JSON.parse(trip.gallery) : [],
    itinerary: trip.itinerary ? JSON.parse(trip.itinerary) : [],
    included: trip.included ? JSON.parse(trip.included) : [],
    not_included: trip.not_included ? JSON.parse(trip.not_included) : [],
    available_dates: trip.available_dates ? JSON.parse(trip.available_dates) : []
  }));

  res.json(parsedTrips);
});

// Eliminar trip
app.delete("/api/trips/:id", (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM Trip WHERE id = ?").run(id);
  res.json({ success: true });
});

// Actualizar trip
app.put("/api/trips/:id", (req, res) => {
  const { id } = req.params;
  const {
    title,
    destination,
    description,
    short_description,
    price,
    duration_days,
    category,
    image_url,
    gallery,
    itinerary,
    included,
    not_included,
    available_dates,
    max_travelers,
    rating,
    reviews_count,
    is_featured,
    status
  } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE Trip
      SET title = ?, destination = ?, description = ?, short_description = ?, 
          price = ?, duration_days = ?, category = ?, image_url = ?, 
          gallery = ?, itinerary = ?, included = ?, not_included = ?, available_dates = ?, 
          max_travelers = ?, rating = ?, reviews_count = ?, 
          is_featured = ?, status = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      title,
      destination,
      description,
      short_description,
      price,
      duration_days,
      category,
      image_url,
      JSON.stringify(gallery),
      JSON.stringify(itinerary),
      JSON.stringify(included),
      JSON.stringify(not_included),
      JSON.stringify(available_dates),
      max_travelers,
      rating,
      reviews_count,
      is_featured ? 1 : 0,
      status,
      id
    );

    if (result.changes === 0) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    res.json({ success: true, updatedID: id });
  } catch (err) {
    console.error("Error actualizando tour:", err);
    res.status(500).json({ error: err.message });
  }
});

// Crear trip
app.post("/api/trips", (req, res) => {
  const data = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO Trip (
        title, destination, description, short_description,
        price, duration_days, category, image_url,
        gallery, itinerary, included, not_included, available_dates,
        max_travelers, rating, reviews_count, is_featured, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.title,
      data.destination,
      data.description,
      data.short_description,
      data.price,
      data.duration_days,
      data.category,
      data.image_url,
      JSON.stringify(data.gallery || []),
      JSON.stringify(data.itinerary || []),
      JSON.stringify(data.included || []),
      JSON.stringify(data.not_included || []),
      JSON.stringify(data.available_dates || []),
      data.max_travelers,
      data.rating,
      data.reviews_count,
      data.is_featured ? 1 : 0,
      data.status
    );

    res.json({ id: result.lastInsertRowid, ...data });
  } catch (err) {
    console.error("Error creando tour:", err);
    res.status(500).json({ error: "Error creando tour" });
  }
});


// Obtener un trip por ID
app.get("/api/trips/:id", (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare("SELECT * FROM Trip WHERE id = ?");
    const trip = stmt.get(id);

    
    // Agrega este log para depuración
    console.log("GET trip by ID:", id, trip);


    if (!trip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    // Parsear JSON strings a arrays/objetos para el frontend
    trip.gallery = trip.gallery ? JSON.parse(trip.gallery) : [];
    trip.itinerary = trip.itinerary ? JSON.parse(trip.itinerary) : [];
    trip.included = trip.included ? JSON.parse(trip.included) : [];
    trip.not_included = trip.not_included ? JSON.parse(trip.not_included) : [];
    trip.available_dates = trip.available_dates ? JSON.parse(trip.available_dates) : [];

    res.json(trip);
  } catch (err) {
    console.error("Error obteniendo trip:", err);
    res.status(500).json({ error: "Error obteniendo trip" });
  }
});

/* ------------------- RESERVATIONS ------------------- */

// Crear una reserva
app.post("/api/reservations", (req, res) => {
  const data = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO Reservation (
        trip_id, user_email, departure_date, travelers_count, travelers_info,
        total_price, status, payment_status, special_requests, booking_reference
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.trip_id,
      data.user_email,
      data.departure_date,
      data.travelers_count,
      JSON.stringify(data.travelers_info || []),
      data.total_price,
      data.status,
      data.payment_status,
      data.special_requests,
      data.booking_reference
    );

    res.json({ id: result.lastInsertRowid, ...data });
  } catch (err) {
    console.error("Error creando reserva:", err);
    res.status(500).json({ error: "Error creando reserva" });
  }
});

// Listar reservas (filtradas por user_email o booking_reference)
app.get("/api/reservations", (req, res) => {
  try {
    const { user_email, booking_reference } = req.query;

    let reservations;
    if (user_email) {
      reservations = db.prepare("SELECT * FROM Reservation WHERE user_email = ?").all(user_email);
    } else if (booking_reference) {
      reservations = db.prepare("SELECT * FROM Reservation WHERE booking_reference = ?").all(booking_reference);
    } else {
      reservations = db.prepare("SELECT * FROM Reservation").all();
    }

    const parsedReservations = reservations.map(r => ({
      ...r,
      travelers_info: r.travelers_info ? JSON.parse(r.travelers_info) : []
    }));

    res.json(parsedReservations);
  } catch (err) {
    console.error("Error listando reservas:", err);
    res.status(500).json({ error: "Error listando reservas" });
  }
});

// Eliminar una reservación por ID
app.delete("/api/reservations/:id", (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM Reservation WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.json({ success: true, deletedID: id });
  } catch (err) {
    console.error("Error deleting reservation:", err);
    res.status(500).json({ error: "Error deleting reservation" });
  }
});

// Obtener una reserva por ID
app.get("/api/reservations/:id", (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare("SELECT * FROM Reservation WHERE id = ?");
    const reservation = stmt.get(id);

    if (!reservation) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }

    reservation.travelers_info = reservation.travelers_info
      ? JSON.parse(reservation.travelers_info)
      : [];

    res.json(reservation);
  } catch (err) {
    console.error("Error obteniendo reserva:", err);
    res.status(500).json({ error: "Error obteniendo reserva" });
  }
});

// Actualizar una reserva por ID
app.put("/api/reservations/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE Reservation
      SET status = ?, payment_status = ?
      WHERE id = ?
    `);

    const result = stmt.run(data.status, data.payment_status, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.json({ id, ...data });
  } catch (err) {
    console.error("Error updating reservation:", err);
    res.status(500).json({ error: "Error updating reservation" });
  }
});


/* ------------------- CART ITEMS ------------------- */

// Crear ítem en el carrito
app.post("/api/cart-items", (req, res) => {
  const data = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO CartItem (
        user_email, trip_id, departure_date, travelers_count, unit_price
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.user_email,
      data.trip_id,
      data.departure_date,
      data.travelers_count,
      data.unit_price
    );

    res.json({ id: result.lastInsertRowid, ...data });
  } catch (err) {
    console.error("Error creando ítem en carrito:", err);
    res.status(500).json({ error: "Error creando ítem en carrito" });
  }
});

// Listar ítems del carrito por usuario (usando query string)
app.get("/api/cart-items", (req, res) => {
  const { user_email } = req.query;
  if (!user_email) {
    return res.status(400).json({ error: "user_email query param is required" });
  }
  try {
    const stmt = db.prepare("SELECT * FROM CartItem WHERE user_email = ?");
    const items = stmt.all(user_email);
    res.json(items);
  } catch (err) {
    console.error("Error listando ítems del carrito:", err);
    res.status(500).json({ error: "Error listando ítems del carrito" });
  }
});



// Eliminar ítem del carrito por ID
app.delete("/api/cart-items/:id", (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare("DELETE FROM CartItem WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error eliminando ítem del carrito:", err);
    res.status(500).json({ error: "Error eliminando ítem del carrito" });
  }
});

// Vaciar todo el carrito de un usuario
app.delete("/api/cart-items/user/:user_email", (req, res) => {
  const { user_email } = req.params;
  try {
    const stmt = db.prepare("DELETE FROM CartItem WHERE user_email = ?");
    const result = stmt.run(user_email);

    if (result.changes === 0) {
      res.status(404).json({ error: "No cart items found for this user" });
      return;
    }

    res.json({ success: true, deletedItems: result.changes });
  } catch (err) {
    console.error("Error vaciando carrito:", err);
    res.status(500).json({ error: "Error vaciando carrito" });
  }
});

app.get("/api/apps/public/prod/public-settings/by-id/:id", (req, res) => {
  res.json({ id: req.params.id, requiresAuth: false });
});


app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});