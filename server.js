import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Static (Vite build) ===
// Serve frontend build (same-origin). Run: npm --prefix frontend run build
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// === ENV ===
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const MONGO_URI = process.env.MONGO_URI;

// === MongoDB ===
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));

// --- Schemas ---
const comboSchema = new mongoose.Schema({
  tipoAlitas: String,       // "Apanadas" | "Naturales" | "Mixtas" | dinámico
  papas: String,            // "Papas Francesas" | "Papas Criollas" | "Sin papas"
  vegetales: Boolean,       // true/false
  salsas: [String],         // 3 salsas (con duplicados permitidos)
  bebida: String,           // "Coca-Cola" | "Corona" | "Sin bebida"
});

const pedidoSchema = new mongoose.Schema({
  numero: String,           // phone
  combos: [comboSchema],
  direccion: String,
  apartamento: String,
  horaEntrega: String,
  observaciones: String,
  metodoPago: String,
  total: Number,
  fecha: { type: Date, default: Date.now },
});

const Pedido = mongoose.model("Pedido", pedidoSchema);

// Config dinámico del menú (editable desde frontend)
const menuConfigSchema = new mongoose.Schema(
  {
    shopId: { type: String, unique: true }, // por si manejas múltiples tiendas
    alitas: [String],    // tipos de alitas
    papas: [String],     // tipos de papas
    salsas: [String],    // lista de salsas
    bebidas: [String],   // bebidas
    precios: {
      comboSinBebida: { type: Number, default: 25000 },
      comboConBebida: { type: Number, default: 28000 },
      salsaExtra: { type: Number, default: 2000 },
    },
    horarios: {
      dias: [String],    // ["Viernes", "Sábado"]
      horaInicio: String, // "17:00"
      horaFin: String,    // "22:00"
      habilitarCheck: { type: Boolean, default: false }, // si quieres forzar validación de horario
    },
  },
  { timestamps: true }
);

const MenuConfig = mongoose.model("MenuConfig", menuConfigSchema);

// Carga o crea config por defecto
async function loadConfig() {
  let cfg = await MenuConfig.findOne({ shopId: "default" });
  if (!cfg) {
    cfg = await MenuConfig.create({
      shopId: "default",
      alitas: ["Apanadas", "Naturales", "Mixtas"],
      papas: ["Papas Francesas", "Papas Criollas", "Sin papas"],
      // Orden de salsas solicitado por ti:
      salsas: [
        "Mango Habanero",
        "Ajo",
        "BBQ Piña",
        "Pimentón Ahumado",
        "Búfalo",
        "Mora Silvestre",
        "Miel Mostaza",
        "Tártara",
      ],
      bebidas: ["Coca-Cola", "Corona", "Sin bebida"],
      precios: {
        comboSinBebida: 25000,
        comboConBebida: 28000,
        salsaExtra: 2000,
      },
      horarios: {
        dias: ["Viernes", "Sábado"],
        horaInicio: "17:00",
        horaFin: "22:00",
        habilitarCheck: false, // puedes activar luego
      },
    });
  }
  return cfg;
}

let CURRENT_CONFIG = await loadConfig();

// === Sesiones en memoria ===
// sessions[from] = {
//   step, total_combos, combo_index, combos[], current_combo, saucePickIndex,
//   direccion, apartamento, horaEntrega, observaciones, metodoPago, total
// }
const sessions = {};

// === Helpers WhatsApp ===
async function waPost(payload) {
  return axios.post(
    `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
    payload,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
  );
}

async function sendMessage(to, text) {
  return waPost({
    messaging_product: "whatsapp",
    to,
    text: { body: text },
  });
}

async function sendButtons(to, text, buttons) {
  // Máx 3 botones
  const btns = buttons.slice(0, 3).map((label, i) => ({
    type: "reply",
    reply: {
      id: `btn_${label.replace(/\s+/g, "_").toLowerCase()}_${i}`,
      title: label,
    },
  }));

  return waPost({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text },
      action: { buttons: btns },
    },
  });
}

async function sendList(to, headerText, bodyText, footerText, itemsArray, sectionTitle = "Opciones") {
  // Construye lista con items -> cada item debe tener id y title
  const rows = itemsArray.map((title, idx) => ({
    id: `opt_${title.replace(/\s+/g, "_").toLowerCase()}_${idx}`,
    title,
  }));

  return waPost({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: headerText },
      body: { text: bodyText },
      footer: { text: footerText || "" },
      action: {
        button: "Elegir",
        sections: [
          {
            title: sectionTitle,
            rows,
          },
        ],
      },
    },
  });
}

// Parseo de entrada desde webhook (texto / botón / lista)
function parseIncoming(message) {
  const rawText = (message.text?.body || "").trim();
  const interactive = message.interactive;
  if (interactive?.button_reply) {
    return {
      type: "button",
      id: interactive.button_reply.id,
      title: interactive.button_reply.title,
      text: interactive.button_reply.title,
    };
  }
  if (interactive?.list_reply) {
    return {
      type: "list",
      id: interactive.list_reply.id,
      title: interactive.list_reply.title,
      text: interactive.list_reply.title,
    };
  }
  return { type: "text", id: null, title: rawText, text: rawText };
}

// === Webhook de verificación ===
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// === Webhook de mensajes ===
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const input = parseIncoming(message);

    if (!sessions[from]) {
      // Inicia sesión y arranca directo con cantidad de combos (sin pedir "hola")
      sessions[from] = { step: 1 };
    }
    const session = sessions[from];

    // FLUJO
    switch (session.step) {
      case 1: {
        // Bienvenida e ir de una a pedir cantidad de combos
        await sendMessage(
          from,
          "🍗 ¡Bienvenido a *Salsas Wings*! Vamos a armar tu pedido.\n\nCada *combo* incluye:\n• 10 alitas (Apanadas / Naturales / Mixtas)\n• Papas o Vegetales\n• 3 Salsas a elegir\n\n¿Cuántos combos deseas pedir? (Ej: 1, 2, 3...)"
        );
        session.step = 2;
        break;
      }

      case 2: {
        const cantidad = parseInt(input.text, 10);
        if (!cantidad || cantidad <= 0) {
          await sendMessage(from, "Por favor escribe un número válido de combos. Ej: 1, 2, 3...");
          break;
        }
        session.total_combos = cantidad;
        session.combo_index = 1;
        session.combos = [];

        await sendButtons(
          from,
          `Combo ${session.combo_index}: ¿Cómo deseas las alitas?`,
          CURRENT_CONFIG.alitas
        );
        session.step = 3;
        break;
      }

      case 3: {
        // Tipo de alitas
        if (!CURRENT_CONFIG.alitas.includes(input.text)) {
          await sendButtons(
            from,
            `Opción inválida. Combo ${session.combo_index}: elige tipo de alitas:`,
            CURRENT_CONFIG.alitas
          );
          break;
        }
        session.current_combo = {
          tipoAlitas: input.text,
          papas: "",
          vegetales: false,
          salsas: [],
          bebida: "",
        };
        await sendButtons(from, "¿Qué acompañamiento deseas?", CURRENT_CONFIG.papas);
        session.step = 4;
        break;
      }

      case 4: {
        // Papas
        if (!CURRENT_CONFIG.papas.includes(input.text)) {
          await sendButtons(from, "Opción inválida. Elige acompañamiento:", CURRENT_CONFIG.papas);
          break;
        }
        session.current_combo.papas = input.text;

        await sendButtons(from, "¿Deseas vegetales (apio y zanahoria)?", ["Sí", "No"]);
        session.step = 5;
        break;
      }

      case 5: {
        // Vegetales
        if (!/^(sí|si|no)$/i.test(input.text)) {
          await sendButtons(from, "¿Deseas vegetales (apio y zanahoria)?", ["Sí", "No"]);
          break;
        }
        session.current_combo.vegetales = /^sí|si$/i.test(input.text);

        // Bucle de 3 salsas con listas interactivas; permite duplicados
        session.saucePickIndex = 0;
        await sendList(
          from,
          "Elige salsa",
          `Selecciona la salsa ${session.saucePickIndex + 1} de 3`,
          "Puedes repetir salsas si deseas.",
          CURRENT_CONFIG.salsas,
          "Salsas"
        );
        session.step = 6;
        break;
      }

      case 6: {
        // Selección de salsas (3 iteraciones, duplicados permitidos)
        if (!CURRENT_CONFIG.salsas.includes(input.text)) {
          await sendList(
            from,
            "Elige salsa",
            `Opción inválida. Selecciona la salsa ${session.saucePickIndex + 1} de 3`,
            "Puedes repetir salsas si deseas.",
            CURRENT_CONFIG.salsas,
            "Salsas"
          );
          break;
        }
        session.current_combo.salsas.push(input.text);
        session.saucePickIndex += 1;

        if (session.saucePickIndex < 3) {
          await sendList(
            from,
            "Elige salsa",
            `Selecciona la salsa ${session.saucePickIndex + 1} de 3`,
            "Puedes repetir salsas si deseas.",
            CURRENT_CONFIG.salsas,
            "Salsas"
          );
        } else {
          await sendButtons(from, "¿Deseas bebida?", CURRENT_CONFIG.bebidas.slice(0, 3));
          session.step = 7;
        }
        break;
      }

      case 7: {
        // Bebida
        if (!CURRENT_CONFIG.bebidas.includes(input.text)) {
          await sendButtons(from, "Opción inválida. ¿Deseas bebida?", CURRENT_CONFIG.bebidas.slice(0, 3));
          break;
        }
        session.current_combo.bebida = input.text;

        // Cierra combo actual
        session.combos.push(session.current_combo);

        // ¿Hay más combos pendientes?
        if (session.combo_index < session.total_combos) {
          session.combo_index += 1;
          session.current_combo = null;
          session.saucePickIndex = 0;

          await sendButtons(
            from,
            `Combo ${session.combo_index}: ¿Cómo deseas las alitas?`,
            CURRENT_CONFIG.alitas
          );
          session.step = 3; // repetir ciclo para el siguiente combo
        } else {
          // Pasar a datos de entrega
          await sendMessage(from, "📍 Envíame la *dirección* de entrega:");
          session.step = 8;
        }
        break;
      }

      case 8: {
        // Dirección
        if (!input.text || input.text.length < 4) {
          await sendMessage(from, "La dirección parece incompleta. Intenta de nuevo 🏠");
          break;
        }
        session.direccion = input.text;
        await sendMessage(from, "Torre (si aplica) o referencia:");
        session.step = 9;
        break;
      }

      case 9: {
        session.apartamento = input.text || "";
        await sendButtons(from, "Hora de entrega:", ["Ya mismo", "8pm", "9pm"]);
        session.step = 10;
        break;
      }

      case 10: {
        // Hora
        session.horaEntrega = input.text;
        await sendMessage(from, "¿Deseas agregar alguna observación? (ej: más crocantes, sin sal, etc.)");
        session.step = 11;
        break;
      }

      case 11: {
        session.observaciones = input.text || "";
        await sendButtons(from, "Método de pago:", ["Efectivo", "Nequi", "Daviplata"]);
        session.step = 12;
        break;
      }

      case 12: {
        // Pago y confirmación
        if (!["Efectivo", "Nequi", "Daviplata"].includes(input.text)) {
          await sendButtons(from, "Método de pago:", ["Efectivo", "Nequi", "Daviplata"]);
          break;
        }
        session.metodoPago = input.text;

        // Total
        const { comboSinBebida, comboConBebida } = CURRENT_CONFIG.precios;
        session.total = session.combos.reduce((acc, c) => {
          const price = c.bebida && c.bebida !== "Sin bebida" ? comboConBebida : comboSinBebida;
          return acc + price;
        }, 0);

        // Guarda pedido
        await Pedido.create({
          numero: from,
          combos: session.combos,
          direccion: session.direccion,
          apartamento: session.apartamento,
          horaEntrega: session.horaEntrega,
          observaciones: session.observaciones,
          metodoPago: session.metodoPago,
          total: session.total,
        });

        // Resumen
        const resumenCombos = session.combos
          .map(
            (c, i) =>
              `• Combo ${i + 1}: ${c.tipoAlitas}\n  - ${c.papas}${c.vegetales ? " + Vegetales" : ""}\n  - Salsas: ${c.salsas.join(", ")}\n  - Bebida: ${c.bebida}`
          )
          .join("\n\n");

        await sendMessage(
          from,
          `✅ *Pedido Confirmado*\n\n${resumenCombos}\n\n📍 *Dirección*: ${session.direccion}\n🏢 *Apto/Torre*: ${session.apartamento}\n🕒 *Entrega*: ${session.horaEntrega}\n💳 *Pago*: ${session.metodoPago}\n📝 *Obs*: ${session.observaciones || "N/A"}\n\n*Total*: $${session.total.toLocaleString("es-CO")}\n\nGracias 🧡 Tus alitas van en camino 🍗🔥`
        );

        // Cierra sesión
        delete sessions[from];
        break;
      }

      default: {
        await sendMessage(from, "Empecemos de nuevo. ¿Cuántos combos deseas pedir? (Ej: 1, 2, 3...)");
        sessions[from] = { step: 2 };
        break;
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err?.response?.data || err.message);
    return res.sendStatus(500);
  }
});

// === Endpoints para frontend: leer/actualizar configuración dinámica ===

// Obtener configuración actual
app.get("/config", async (req, res) => {
  try {
    const cfg = await MenuConfig.findOne({ shopId: "default" });
    res.json(cfg);
  } catch (e) {
    res.status(500).json({ error: "No se pudo obtener la configuración." });
  }
});

// Actualizar totalmente o parcialmente la configuración
// Body ejemplo:
// {
//   "alitas": ["Apanadas", "Naturales", "Mixtas", "Horneadas"],
//   "papas": ["Papas Francesas","Papas Criollas","Sin papas"],
//   "salsas": ["Mango Habanero","Ajo", ...],
//   "bebidas": ["Coca-Cola","Corona","Sin bebida"],
//   "precios": { "comboSinBebida": 26000, "comboConBebida": 29000, "salsaExtra": 2500 },
//   "horarios": { "dias":["Viernes","Sábado"], "horaInicio":"17:00", "horaFin":"22:00", "habilitarCheck": true }
// }
app.put("/config", async (req, res) => {
  try {
    const update = req.body || {};
    const cfg = await MenuConfig.findOneAndUpdate(
      { shopId: "default" },
      { $set: update },
      { new: true, upsert: true }
    );
    CURRENT_CONFIG = cfg; // refresca cache en memoria
    res.json(cfg);
  } catch (e) {
    res.status(500).json({ error: "No se pudo actualizar la configuración." });
  }
});

// === Endpoints para Pedidos Manuales ===

// Crear pedido manual (desde frontend)
app.post("/pedidos-manuales", async (req, res) => {
  try {
    const {
      numero,
      combos,
      direccion,
      apartamento,
      horaEntrega,
      observaciones,
      metodoPago,
      total,
    } = req.body;

    if (!numero || !Array.isArray(combos) || combos.length === 0) {
      return res.status(400).json({ error: "Faltan datos del pedido o combos inválidos." });
    }

    const nuevoPedido = await Pedido.create({
      numero,
      combos,
      direccion,
      apartamento,
      horaEntrega,
      observaciones,
      metodoPago,
      total,
    });

    res.status(201).json(nuevoPedido);
  } catch (e) {
    console.error("Error creando pedido manual:", e);
    res.status(500).json({ error: "No se pudo crear el pedido manual." });
  }
});

// === Obtener pedidos del día (WhatsApp + Manuales) ===
app.get("/pedidos-dia", async (req, res) => {
  try {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0); // Inicio del día
    const fin = new Date();
    fin.setHours(23, 59, 59, 999); // Fin del día

    const pedidosHoy = await Pedido.find({
      fecha: { $gte: inicio, $lte: fin },
    }).sort({ fecha: -1 });

    res.json(pedidosHoy);
  } catch (err) {
    console.error("Error obteniendo pedidos del día:", err);
    res.status(500).json({ error: "No se pudieron obtener los pedidos del día." });
  }
});

// === Schema y Endpoints para GASTOS ===

// --- Schema ---
const gastoSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
});

const Gasto = mongoose.model("Gasto", gastoSchema);

// --- Obtener todos los gastos ---
app.get("/gastos", async (req, res) => {
  try {
    const gastos = await Gasto.find().sort({ date: -1 });
    res.json(gastos);
  } catch (e) {
    console.error("Error obteniendo gastos:", e);
    res.status(500).json({ error: "No se pudieron obtener los gastos." });
  }
});

// --- Agregar nuevo gasto ---
app.put("/gastos", async (req, res) => {
  try {
    const { description, amount } = req.body;
    if (!description || !amount)
      return res.status(400).json({ error: "Faltan campos obligatorios." });

    const date = new Date().toISOString().split("T")[0];
    const nuevoGasto = await Gasto.create({ description, amount, date });

    res.status(201).json(nuevoGasto);
  } catch (e) {
    console.error("Error creando gasto:", e);
    res.status(500).json({ error: "No se pudo crear el gasto." });
  }
});

// === Ruta base ===
app.get("/", (req, res) => res.send("Alitas bot ✅"));

// === Servidor ===
// === SPA fallback (put this AFTER your API routes) ===
app.get("*", (req, res) => {
  // avoid hijacking webhook verification/other explicit routes with query params if any
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listo en puerto ${PORT}`));
