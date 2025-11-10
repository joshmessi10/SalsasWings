import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN; // token de Meta (temporal o permanente)
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // phone number id de Meta

// GET /webhook -> verificación inicial desde Meta
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

// In-memory sessions muy simple
const sessions = {};

// POST /webhook -> mensajes entrantes
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200); // eventos no message (status, etc.)
    }

    const from = message.from; // numero del usuario (p. ej. "57300...")
    const text = (message.text?.body || "").trim();

    // Lógica simple de flujo basada en sesiones
    if (!sessions[from]) {
      sessions[from] = { step: 1 };
    }

    const session = sessions[from];
    let reply = "";

    switch (session.step) {
      case 1:
        reply = "🍗 ¡Hola! Bienvenido a Alitas Express.\n¿Cuántas alitas quieres?";
        session.step = 2;
        break;

      case 2:
        // aceptamos cualquier número como cantidad simple
        session.cantidad = text;
        session.step = 3;
        reply = "¿Las deseas *apanadas* o *fritas*?";
        break;

      case 3:
        session.tipo = text;
        session.step = 4;
        reply = "Perfecto 😋 ¿Qué salsa prefieres? (BBQ / Picante / Mango / Miel)";
        break;

      case 4:
        session.salsa = text;
        session.step = 5;
        reply = "¿Bebida? Responde: Coca-Cola o Corona";
        break;

      case 5:
        session.bebida = text;
        session.step = 6;
        reply = "Por favor envía tu dirección completa para la entrega 📍";
        break;

      case 6:
        session.direccion = text;
        // respuesta final con resumen
        reply = `✅ Pedido recibido:\n- ${session.cantidad} alitas\n- ${session.tipo}\n- Salsa: ${session.salsa}\n- Bebida: ${session.bebida}\n- Dirección: ${session.direccion}\n\n¡Gracias! En breve confirmamos.`;
        // limpiar sesión
        delete sessions[from];
        break;

      default:
        reply = "Lo siento, hubo un error. Envía *hola* para empezar de nuevo.";
        delete sessions[from];
        break;
    }

    // enviar respuesta usando WhatsApp Cloud API
    await axios.post(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      },
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    );

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err?.response?.data || err.message);
    return res.sendStatus(500);
  }
});

// ruta base para check
app.get("/", (req, res) => res.send("Alitas bot running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
