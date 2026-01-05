import { categories } from "../constants/categories";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const CATEGORY_EXAMPLES_EXPENSES = `Eres un experto en transacciones bancarias CHILENAS, específicamente de la región de La Araucanía (Temuco).

CONTEXTO IMPORTANTE:
- Las transacciones son de Chile, principalmente Temuco y Santiago
- Los nombres de comercios son chilenos y pueden ser ambiguos
- Debes inferir por contexto cuando no conozcas el comercio

REGLAS DE INFERENCIA:
- Nombres con "RULOS", "PELOS", "HAIR", "SALON" → Estética (peluquerías)
- Nombres con "COPEC", "SHELL", "PETROBRAS" → Supermercado (tiendas de conveniencia) o Transporte (combustible)
- "MERPAGO*" o "MERCADOPAGO*" seguido de nombre → inferir por el nombre que sigue
- Transferencias a personas sin contexto → Otros
- Nombres de ciudades al final (TEMUCO, SANTIAGO, VALDIVIA) son solo ubicación, ignorar

EJEMPLOS POR CATEGORÍA:

SUPERMERCADO: UNIMARC, FOOD MARKET, LIDER, JUMBO, TOTTUS, SANTA ISABEL, tiendas de conveniencia COPEC/PRONTO
TRANSPORTE: UBER TRIP, RECORRIDO, BIPAY, LATAM, SKY, WHOOSH (scooters), buses
DELIVERY: UBER EATS, RAPPI, PEDIDOSYA, CORNERSHOP
RESTAURANT: restaurantes, cafeterías, bares, cervecerías - si parece nombre de local de comida, es Restaurant
STREAMING: MUBI, YOUTUBE, NETFLIX, SPOTIFY, HBO, AMAZON PRIME, CRUNCHYROLL, NEXTORY, DRUMSCRIBE
TRABAJO: FIGMA, DIGITALOCEAN, CLAUDE.AI, OBSIDIAN, GITHUB, herramientas de software
GASTOS BÁSICOS: CGE (luz), WOM (teléfono), VTR, MOVISTAR, MUNDO PACIFICO (internet), SERVIPAG, cuentas de servicios
JUEGOS: PLAYSTATION, PSN, STEAM, NINTENDO, XBOX, DISCORD, EPIC GAMES
CINE: CINEPLANET, CINEMARK, MOVILAND
SALUD: SALCOBRAND, CRUZ VERDE, AHUMADA, farmacias, clínicas
LIBROS: DIGITAL PUBLICATION, KINDLE, BUSCALIBRE, LIBRERIA
DECORACIÓN: CASAIDEAS, IKEA, HOMY, SODIMAC, muebles
VESTIMENTA: RIPLEY, FALABELLA, ZARA, H&M, PARIS, tiendas de ropa
INVERSIONES: BINANCE, BUDA, crypto
DEPORTE: GYM, GIMNASIO, SMARTFIT, clubes deportivos, ESGRIMA
ARRIENDO: AIRBNB, pagos mensuales de arriendo a personas específicas
ESTÉTICA: peluquerías, barberías, spa, manicure, tratamientos de belleza - nombres como "RULOS", "SALON", "BEAUTY"
LAVANDERÍA: lavanderías, tintorerías
CONCIERTOS: PUNTOTICKET, TICKETMASTER, eventos
SUELDO: Remuneraciones, sueldos, bonos, aguinaldos, gratificaciones

IMPORTANTE: Si el nombre suena a local comercial pero no lo conoces, infiere por el tipo de palabra:
- Palabras de comida/bebida → Restaurant
- Palabras de belleza/pelo → Estética
- Palabras de ropa/moda → Vestimenta
- Si realmente no puedes inferir → Otros`;
/**
 * Categoriza múltiples transacciones en batch usando Groq AI
 */
export interface BatchCategoryItem {
  description: string;
  transactionType: "cargo" | "abono";
  batchIndex: number;
  originalIndex: number;
}

export interface BatchCategoryResult {
  batchIndex: number;
  category: string;
}

export async function categorizeBatchWithGroq(
  items: BatchCategoryItem[]
): Promise<BatchCategoryResult[]> {
  if (!GROQ_API_KEY) {
    throw new Error("VITE_GROQ_API_KEY no está configurada");
  }

  if (items.length === 0) {
    return [];
  }

  const incomeCategories = ["Sueldo"];
  const allCategories = categories;

  const itemsList = items
    .map((item, idx) => {
      const isIncome = item.transactionType === "abono";
      const availableCategories = isIncome
        ? allCategories.filter(
            (cat) => incomeCategories.includes(cat) || cat === "Otros"
          )
        : allCategories.filter(
            (cat) => !incomeCategories.includes(cat) || cat === "Otros"
          );

      return `${idx}. Tipo: ${
        isIncome ? "Ingreso (Abono)" : "Gasto (Cargo)"
      } | Descripción: "${
        item.description
      }" | Categorías disponibles: ${availableCategories.join(", ")}`;
    })
    .join("\n\n");

  const prompt = `Eres un asistente experto en categorización de transacciones bancarias chilenas utilizando sus nombres, palabras clave y montos como herramientas de deducción.

Necesito que categorices ${items.length} transacciones bancarias.

${CATEGORY_EXAMPLES_EXPENSES}

Transacciones a categorizar:
${itemsList}

Categorías válidas (debes usar EXACTAMENTE una de estas):
${allCategories.map((cat, idx) => `  ${idx + 1}. ${cat}`).join("\n")}

INSTRUCCIONES:
1. Analiza cada descripción cuidadosamente, palabra por palabra
2. Identifica palabras clave que indiquen el tipo de transacción - busca coincidencias parciales (ej: "PLAYSTATION" dentro de "PLAYSTATION NETWORK SAN MAT")
3. Selecciona la categoría MÁS ESPECÍFICA que coincida según los ejemplos proporcionados
4. EVITA usar "Otros" a toda costa - haz un esfuerzo adicional para encontrar una categoría específica que encaje para cada transacción utilizando ejemplos y categorías disponibles
5. Si ves palabras clave de los ejemplos (ej: PLAYSTATION, STEAM, NINTENDO para JUEGOS), usa esa categoría inmediatamente
6. Solo usa "Otros" como ÚLTIMO RECURSO si realmente es imposible determinar una categoría específica después de analizar todos los ejemplos y categorías disponibles
7. Prioriza categorías más generales pero específicas (como "Transporte", "Salud", "Trabajo", "Gastos Básicos", "Juegos", "Streaming") antes que "Otros"
8. Para ingresos (Abono), prioriza "Sueldo" y solo usa "Otros" si definitivamente no es un sueldo
9. IMPORTANTE: Busca coincidencias parciales - "PLAYSTATION NETWORK" debe categorizarse como "Juegos", incluso si hay texto adicional como "SAN MAT"

EJEMPLOS DE ANÁLISIS:
- "PLAYSTATION NETWORK SAN MAT" → contiene "PLAYSTATION" → categoría: "Juegos"
- "PAYU UBER TRIP" → contiene "UBER" → categoría: "Transporte"
- "NETFLIX.COM" → contiene "NETFLIX" → categoría: "Streaming"

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "categories": [
    {"index": 0, "category": "nombre_exacto_de_la_categoria"},
    {"index": 1, "category": "nombre_exacto_de_la_categoria"},
    ...
  ]
}

CRÍTICO: 
- Cada categoría DEBE coincidir EXACTAMENTE con una de las categorías listadas arriba
- El índice corresponde a la posición en la lista de transacciones (0-based)
- EVITA "Otros" siempre que sea posible - es preferible elegir una categoría específica aunque no sea perfecta
- No agregues texto adicional, solo el JSON`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente especializado en categorización de transacciones bancarias. Siempre respondes con JSON válido y estructurado.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error en la API de Groq: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Respuesta vacía de Groq");
  }

  let parsedResponse: {
    categories: Array<{ index: number; category: string }>;
  };
  try {
    parsedResponse = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedResponse = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("No se pudo parsear la respuesta como JSON");
    }
  }

  const results: BatchCategoryResult[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const aiResult = parsedResponse.categories?.find((c) => c.index === i);
    if (aiResult) {
      const aiCategory = aiResult.category?.trim();
      const isIncome = item.transactionType === "abono";
      const availableCategories = isIncome
        ? allCategories.filter(
            (cat) => incomeCategories.includes(cat) || cat === "Otros"
          )
        : allCategories.filter(
            (cat) => !incomeCategories.includes(cat) || cat === "Otros"
          );

      if (availableCategories.includes(aiCategory)) {
        results.push({
          batchIndex: item.batchIndex,
          category: aiCategory,
        });
      } else {
        results.push({
          batchIndex: item.batchIndex,
          category: "Otros",
        });
      }
    } else {
      results.push({
        batchIndex: item.batchIndex,
        category: "Otros",
      });
    }
  }

  return results;
}

/**
 * Verifica si la API key de Groq está configurada
 */
export function isGroqAvailable(): boolean {
  return !!GROQ_API_KEY;
}
