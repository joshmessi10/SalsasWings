import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Conexión a MongoDB Atlas
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error conectando a MongoDB:", err));

// ✅ Esquema y modelo de pedido
const pedidoSchema = new mongoose.Schema({
  numero: String,
  cantidad: String,
  tipo: String,
  salsa: String,
  bebida: String,
  direccion: String,
  fecha: { type: Date, default: Date.now }
});
const Pedido = mongoose.model("Pedido", pedidoSchema);

// ✅ Sesiones en memoria
const sessions = {};

// Webhook de verificación
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// ✅ Webhook de mensajes entrantes
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = (message.text?.body || "").trim();
    if (!sessions[from]) sessions[from] = { step: 1 };

    const session = sessions[from];
    let reply = "";

    // === FLUJO CON VALIDACIONES ===
    switch (session.step) {
      case 1:
        reply = "🍗 ¡Hola! Bienvenido a *Alitas Express*.\n¿Cuántas alitas quieres?";
        session.step = 2;
        break;

      case 2:
        if (!/^\d+$/.test(text)) {
          reply = "Por favor, escribe solo un número (ejemplo: 12)";
          break;
        }
        session.cantidad = text;
        session.step = 3;
        reply = "¿Las deseas *apanadas* o *fritas*?";
        break;

      case 3:
        if (!["apanadas", "fritas"].includes(text.toLowerCase())) {
          reply = "Opción no válida. Escribe *apanadas* o *fritas* 🍗";
          break;
        }
        session.tipo = text;
        session.step = 4;
        reply = "Perfecto 😋 ¿Qué salsa prefieres? (BBQ / Picante / Mango / Miel)";
        break;

      case 4:
        if (!["bbq", "picante", "mango", "miel"].includes(text.toLowerCase())) {
          reply = "Por favor elige una salsa válida: *BBQ*, *Picante*, *Mango* o *Miel* 🌶️";
          break;
        }
        session.salsa = text;
        session.step = 5;
        reply = "¿Qué bebida deseas? (Coca-Cola o Corona) 🥤🍺";
        break;

      case 5:
        if (!["coca-cola", "cocacola", "corona"].includes(text.toLowerCase())) {
          reply = "Solo tenemos *Coca-Cola* o *Corona*. Escribe una de ellas 😄";
          break;
        }
        session.bebida = text;
        session.step = 6;
        reply = "Por favor envía tu dirección completa para la entrega 📍";
        break;

      case 6:
        if (text.length < 5) {
          reply = "Tu dirección parece incompleta. Por favor envíala completa 🏠";
          break;
        }
        session.direccion = text;

        // ✅ Guardar en MongoDB
        await Pedido.create({
          numero: from,
          cantidad: session.cantidad,
          tipo: session.tipo,
          salsa: session.salsa,
          bebida: session.bebida,
          direccion: session.direccion
        });

        reply = `✅ Pedido recibido:
- ${session.cantidad} alitas
- ${session.tipo}
- Salsa: ${session.salsa}
- Bebida: ${session.bebida}
- Dirección: ${session.direccion}

¡Gracias! En breve confirmamos tu pedido 🍗`;

        delete sessions[from];
        break;

      default:
        reply = "Envía *hola* para iniciar un nuevo pedido 🍗";
        delete sessions[from];
        break;
    }

    // ✅ Enviar respuesta al usuario
    if (reply) {
      await axios.post(
        `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply }
        },
        { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
      );
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err?.response?.data || err.message);
    return res.sendStatus(500);
  }
});

// Ruta base
app.get("/", (req, res) => res.send("Alitas bot running ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
