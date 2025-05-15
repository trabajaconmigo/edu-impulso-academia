import { NextResponse } from "next/server";
import OpenAI from "openai";
import { load } from "cheerio";
import { buildPrompt } from "@/lib/prompts/headlinePrompt";

export const runtime = "nodejs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function fetchOG(url: string) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const $ = load(html);
    return {
      title: $('meta[property="og:title"]').attr("content") || "",
      desc: $('meta[property="og:description"]').attr("content") || "",
    };
  } catch {
    return { title: "", desc: "" };
  }
}

export async function POST(req: Request) {
  try {
    const vars = await req.json();
    if (vars.competitorUrl) {
      vars.competitorMeta = await fetchOG(vars.competitorUrl);
    }

    const prompt = buildPrompt(vars);
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      max_tokens: 300,
      messages: [
        { role: "system", content: "Eres un copywriter experto." },
        { role: "user", content: prompt },
      ],
    });

    /** ----------------------------------------------------------------
     * Parseamos el JSON aunque venga rodeado de texto
     * ---------------------------------------------------------------- */
    let raw = chat.choices[0].message.content || "[]";
    const match = raw.match(/\[([\s\S]*?)\]/);
    if (match) raw = match[0];

    let headlines: any[] = [];
    try {
      headlines = JSON.parse(raw);
    } catch {
      /* se ignora: rellenamos abajo */
    }

    /* Si vienen menos de 3, completamos con textos de respaldo */
    while (headlines.length < 3) {
      headlines.push({
        headline: "Titular de respaldo",
        sub: "Subtítulo de respaldo",
        tecnica: vars.tecnica,
        figura: "Aliteración",
      });
    }

    return NextResponse.json({ headlines: headlines.slice(0, 3) });
  } catch (err) {
    console.error("API error:", err);

    /* Fallback si TODO falla */
    const fallback = [
      {
        headline: "Descubre el poder de tu dinero",
        sub: "Método simple para ahorrar desde hoy mismo.",
        tecnica: "yes-question",
        figura: "Rima",
      },
      {
        headline: "¿Listo para controlar tus gastos?",
        sub: "Aprende a dominar tu bolsillo sin estrés.",
        tecnica: "yes-question",
        figura: "Asonancia",
      },
      {
        headline: "Si gestionas 10 minutos, duplicas tus ahorros",
        sub: "Paso a paso para resultados rápidos.",
        tecnica: "if-then",
        figura: "Paralelismo",
      },
    ];
    return NextResponse.json({ headlines: fallback });
  }
}
