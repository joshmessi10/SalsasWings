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
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch(err => console.error("Error conectando a MongoDB:", err));

// squemas
const comboSchema = new mongoose.Schema({
  tipoAlitas: String,
  papas: String,
  vegetales: Boolean,
  salsas: [String],
  bebida: String,
});

const pedidoSchema = new mongoose.Schema({
  numero: String,
  combos: [comboSchema],
  direccion: String,
  apartamento: String,
  horaEntrega: String,
  observaciones: String,
  metodoPago: String,
  total: Number,
  fecha: { type: Date, default: Date.now }
});
const Pedido = mongoose.model("Pedido", pedidoSchema);

// Sesiones en memoria
const sessions = {};

// Función para enviar botones
async function sendButtons(to, text, buttons) {
  await axios.post(
    `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text },
        action: {
          buttons: buttons.map((label, index) => ({
            type: "reply",
            reply: { id: `btn_${index}`, title: label }
          }))
        }
      }
    },
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
  );
}

// Función para enviar texto
async function sendMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: text }
    },
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
  );
}

//  Webhook de verificación
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

//  Webhook de mensajes
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = (message.text?.body || message.button?.text || "").trim();

    if (!sessions[from]) {
      sessions[from] = { step: 1 };
      await sendButtons(
        from,
        "🍗 ¡Bienvenido a *Salsas Wings*! Horario: *Viernes y Sábado de 5pm a 10pm*.\n\n¿Deseas hacer un pedido?",
        ["Sí", "No"]
      );
      return res.sendStatus(200);
    }

    const session = sessions[from];

    switch (session.step) {

      case 1:
        if (!/si|sí/i.test(text)) {
          await sendMessage(from,"¿Cuántos combos deseas pedir? Ej: 1, 2, 3...");
          delete sessions[from];
          break;
        }
        session.step = 2;
        break;

      case 2:
        const cantidad = parseInt(text);
        if (!cantidad || cantidad <= 0) {
          await sendMessage(from, "Escribe un número válido.");
          break;
        }
        session.total_combos = cantidad;
        session.combo_index = 1;
        session.combos = [];
        await sendButtons(from, `Combo ${session.combo_index}: ¿Cómo deseas las alitas?`, ["Apanadas", "Naturales", "Mixtas"]);
        session.step = 3;
        break;

      case 3:
        session.current_combo = { tipoAlitas: text };
        await sendButtons(from, "¿Qué acompañamiento deseas?", ["Papas Francesas", "Papas Criollas", "Sin papas"]);
        session.step = 4;
        break;

      case 4:
        session.current_combo.papas = text;
        await sendButtons(from, "¿Deseas vegetales?", ["Sí", "No"]);
        session.step = 5;
        break;

      case 5:
        session.current_combo.vegetales = /sí|si/i.test(text);
        session.current_combo.salsas = [];
        await sendMessage(from, "Elige 3 salsas (una por mensaje):\nBúfalo, BBQ Piña, BBQ Café, Pimentón Ahumado, Ajo, Miel Mostaza, Tártara, Mora Silvestre, Mango Habanero");
        session.step = 6;
        break;

      case 6:
        session.current_combo.salsas.push(text);
        if (session.current_combo.salsas.length < 3) {
          await sendMessage(from, `Perfecto, ahora la siguiente salsa (${session.current_combo.salsas.length + 1}/3):`);
        } else {
          await sendButtons(from, "¿Deseas bebida?", ["Coca-Cola", "Corona", "Sin bebida"]);
          session.step = 7;
        }
        break;

      case 7:
        session.current_combo.bebida = text;
        session.combos.push(session.current_combo);

        if (session.combo_index < session.total_combos) {
          session.combo_index++;
          await sendButtons(from, `Combo ${session.combo_index}: ¿Cómo deseas las alitas?`, ["Apanadas", "Naturales", "Mixtas"]);
          session.step = 3;
          break;
        }

        await sendMessage(from, "📍 Envíame la *dirección*:");
        session.step = 8;
        break;

      case 8:
        session.direccion = text;
        await sendMessage(from, "Número de apartamento o casa:");
        session.step = 9;
        break;

      case 9:
        session.apartamento = text;
        await sendButtons(from, "Hora de entrega:", ["Ya mismo", "8pm", "9pm"]);
        session.step = 10;
        break;

      case 10:
        session.horaEntrega = text;
        await sendMessage(from, "Observaciones (opcional):");
        session.step = 11;
        break;

      case 11:
        session.observaciones = text;
        await sendButtons(from, "Método de pago:", ["Efectivo", "Nequi", "Daviplata"]);
        session.step = 12;
        break;

      case 12:
        session.metodoPago = text;
        session.total = session.combos.reduce((acc, c) => acc + (c.bebida === "Sin bebida" ? 25000 : 28000), 0);

        await Pedido.create(session);

        await sendMessage(from,
`✅ *Pedido Confirmado*

Total: *$${session.total}*
Entrega: ${session.horaEntrega}
Pago: ${session.metodoPago}

Gracias 🧡 Tus alitas van en camino 🍗🔥`);

        delete sessions[from];
        break;
    }

    res.sendStatus(200);

  } catch (err) {
    console.error(err?.response?.data || err);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => res.send("Alitas bot ✅"));
app.listen(3000, () => console.log("🚀 Server listo en puerto 3000"));
