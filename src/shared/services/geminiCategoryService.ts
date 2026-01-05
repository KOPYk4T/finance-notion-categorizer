import { categories } from "../constants/categories";
import type {
  BatchCategoryItem,
  BatchCategoryResult,
} from "./groqCategoryService";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const CATEGORY_EXAMPLES_EXPENSES = `Ejemplos específicos de transacciones bancarias chilenas:

SUPERMERCADO: UNIMARC, FOOD MARKET, PRONTO COPEC, ISIDORA.COPEC, TUU MARKET, ALMACEN, LIDER, JUMBO, TOTTUS, SANTA ISABEL
TRANSPORTE: PAYU UBER TRIP, PAYU *UBER, RECORRIDO, BIPAYTEMUCO, LATAM.COM, TUU TRANSPORTES, COPEC (combustible), SKY AIRLINE
DELIVERY: PAYU UBER EATS, RAPPI, PEDIDOSYA, CORNERSHOP
RESTAURANT: NIU SUSHI, DELI A VARAS, CERVECERA, CERVECERIA, RATIO COFFEE, WONDERLAND CAFE, CAFETERIA, UDON, STARBUCKS, JUAN VALDEZ
STREAMING: MUBI, GOOGLE YOUTUBE, DL GOOGLE YOUTUBE, GOOGLE PLAY YOUTUBE, NEXTORY, NETFLIX, SPOTIFY, HBO MAX, AMAZON PRIME, CRUNCHYROLL, DRUMSCRIBE
TRABAJO: FIGMA, DIGITALOCEAN, CLAUDE.AI, OBSIDIAN, GITHUB, NOTION, AWS, GOOGLE CLOUD
GASTOS BÁSICOS: PAGO CGE, PAGO WOM, WOMPAY, luz, agua, gas, internet, teléfono
JUEGOS: PLAYSTATION NETWORK, PLAYSTATION, PSN, PS4, PS5, STEAM, NINTENDO, SWITCH, XBOX, DISCORD, EPIC GAMES, cualquier transacción relacionada con videojuegos, compras de juegos, suscripciones de juegos
CINE: CINEPLANET, CINES MOVILAND, CINEMARK, CINEPOLIS
SALUD: SALCOBRAND, CRUZ VERDE, C. VERDE, AHUMADA, farmacias
LIBROS: DIGITAL PUBLICATION, KINDLE, BUSCALIBRE, ANTARTICA
DECORACIÓN: CASAIDEAS, IKEA, HOMY, SODIMAC (decoración), muebles
VESTIMENTA: RIPLEY, FALABELLA, ZARA, H&M, PARIS, ropa
INVERSIONES: binance.com, BUDA, crypto, acciones
DEPORTE: Club Esgrima, Araucania Fen, gimnasio, GYM, SMARTFIT, Cualquier cosa relacionada a esgrima.
ARRIENDO: AIRBNB, TRANSF. PARA MIGUEL ARTURO
ESTÉTICA: peluquería, barbería, spa, manicure
LAVANDERÍA: lavandería, tintorería
CONCIERTOS: PUNTOTICKET, TICKETMASTER, eventos en vivo

CASOS AMBIGUOS → "Otros":
- APPLE.COM BILL
- MERCADOPAGO sin contexto
- Transferencias a personas sin contexto`;

/**
 * Categoriza múltiples transacciones en batch usando Google Gemini API
 */
export async function categorizeBatchWithGemini(
  items: BatchCategoryItem[]
): Promise<BatchCategoryResult[]> {
  if (!GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY no está configurada");
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

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de Gemini API:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0]
    ) {
      console.error("Respuesta inesperada de Gemini:", data);
      throw new Error("Formato de respuesta inesperado de Gemini");
    }

    const content = data.candidates[0].content.parts[0].text?.trim();

    if (!content) {
      throw new Error("Respuesta vacía de Gemini");
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
  } catch (error) {
    console.error("Error al categorizar con Gemini:", error);
    throw error;
  }
}

/**
 * Verifica si la API key de Gemini está configurada
 */
export function isGeminiAvailable(): boolean {
  return !!GEMINI_API_KEY;
}
