// src/app/api/generar-anuncios/route.ts
import { NextResponse } from "next/server";
import { load } from "cheerio";
import { buildPrompt } from "@/lib/prompts/headlinePrompt";

// Evita que Next intente precalcularla en el build
export const runtime  = "nodejs";
export const dynamic  = "force-dynamic";

/* ------------------------------------------------------ */
/* 1. Helper: extraer Open Graph                           */
/* ------------------------------------------------------ */
async function fetchOG(url: string) {
  try {
    const res  = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const $    = load(html);
    return {
      title: $('meta[property="og:title"]').attr("content")       || "",
      desc : $('meta[property="og:description"]').attr("content")|| "",
    };
  } catch {
    return { title: "", desc: "" };
  }
}

/* ------------------------------------------------------ */
/* 2. Handler POST                                         */
/* ------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    /* ----------- datos del body ----------- */
    const vars = await req.json();
    if (vars.competitorUrl) {
      vars.competitorMeta = await fetchOG(vars.competitorUrl);
    }

    /* ----------- instanciamos OpenAI dentro ----------- */
    const { OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = buildPrompt(vars);

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      max_tokens: 300,
      messages: [
        { role: "system", content: "Eres un copywriter experto." },
        { role: "user",    content: prompt },
      ],
    });

    /* ------------- intentamos parsear JSON ------------- */
    let raw = chat.choices[0].message.content || "[]";
    const match = raw.match(/\[([\s\S]*?)\]/);
    if (match) raw = match[0];

    let headlines: any[] = [];
    try { headlines = JSON.parse(raw); } catch {/* se completa abajo */ }

    /* rellena hasta 3 resultados */
    while (headlines.length < 3) {
      headlines.push({
        headline: "Titular de respaldo",
        sub:      "Subtítulo de respaldo",
        tecnica:  vars.tecnica,
        figura:   "Aliteración",
      });
    }

    return NextResponse.json({ headlines: headlines.slice(0, 3) });

  } catch (err) {
    console.error("API error:", err);

    /* Fallback si todo falla */
    const fallback = [
      {
        headline: "Descubre el poder de tu dinero",
        sub:      "Ahorra desde hoy sin complicarte.",
        tecnica:  "pregunta-si",
        figura:   "Rima",
      },
      {
        headline: "¿Listo para controlar tus gastos?",
        sub:      "Domina tu bolsillo sin estrés.",
        tecnica:  "pregunta-si",
        figura:   "Asonancia",
      },
      {
        headline: "Si gestionas 10 minutos, duplicas ahorros",
        sub:      "Método rápido para resultados reales.",
        tecnica:  "si-entonces",
        figura:   "Paralelismo",
      },
    ];
    return NextResponse.json({ headlines: fallback });
  }
}
