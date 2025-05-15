// src/lib/prompts/headlinePrompt.ts

export interface PromptVars {
  producto: string
  plataforma: string
  tecnica: string
  puntosDolor: string
  problema: string
  sexoAvatar: string
  edadAvatar: string
  extraIfThen?: string
  extraYesQuestion?: string
  competitorMeta?: { title: string; desc: string }
}

const figuras = [
  "Aliteración",
  "Asonancia",
  "Rima",
  "Paralelismo",
  "Onomatopeya"
]

const tecnicaTexto: Record<string, string> = {
  "pregunta-si": "pregunta «sí»",
  "si-entonces": "condicional «si-entonces»",
  "resultado-ridiculo": "resultado ridículo",
  "llamado-etiqueta": "llamado / etiqueta"
}

export function buildPrompt(v: PromptVars): string {
  // Inspiración de competidor si existe
  const insp = v.competitorMeta && (v.competitorMeta.title || v.competitorMeta.desc)
    ? `Ejemplo de competidor:
• Título: "${v.competitorMeta.title}"
• Descripción: "${v.competitorMeta.desc}"\n\n`
    : ""

  // Selección aleatoria de 3 figuras distintas
  const figurasAleatorias = figuras
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)

  return `
Eres un copywriter experto para el mercado mexicano.
Datos de contexto:
- Producto o servicio: ${v.producto}
- Plataforma: ${v.plataforma}
- Técnica persuasiva: ${tecnicaTexto[v.tecnica] ?? v.tecnica}
  ${v.extraIfThen ? `(If-Then): "${v.extraIfThen}"` : ""}
  ${v.extraYesQuestion ? `(Pregunta): "${v.extraYesQuestion}"` : ""}
- Avatar de cliente:
  • Sexo: ${v.sexoAvatar}
  • Rango de edad: ${v.edadAvatar}
- Puntos de dolor: ${v.puntosDolor}
- Problema a resolver: ${v.problema}

${insp}Instrucciones:
1. Genera exactamente **3** pares de Titular y Subtítulo en español.
2. Cada Titular debe tener como máximo 12 palabras.
3. Cada Subtítulo debe tener como máximo 18 palabras.
4. Asigna a cada par una de estas figuras retóricas (una por par):
   • ${figurasAleatorias[0]}
   • ${figurasAleatorias[1]}
   • ${figurasAleatorias[2]}
5. Al final de cada par, incluye hashtags con la técnica y la figura, por ejemplo: \`#pregunta-si #Rima\`.
6. Devuelve **solo** un JSON válido con esta estructura:

[
  {
    "headline": "Titular aquí",
    "sub": "Subtítulo aquí",
    "tecnica": "${v.tecnica}",
    "figura": "${figurasAleatorias[0]}"
  },
  {
    "headline": "Titular aquí",
    "sub": "Subtítulo aquí",
    "tecnica": "${v.tecnica}",
    "figura": "${figurasAleatorias[1]}"
  },
  {
    "headline": "Titular aquí",
    "sub": "Subtítulo aquí",
    "tecnica": "${v.tecnica}",
    "figura": "${figurasAleatorias[2]}"
  }
]`.trim()
}
