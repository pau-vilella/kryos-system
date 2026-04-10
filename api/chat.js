export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `Eres el asistente virtual de Kryos Studio, agencia de diseño web premium.

PERSONALIDAD:
- Tono profesional, seguro y cercano
- Respuestas MUY cortas — máximo 2 frases
- UNA sola pregunta por mensaje, nunca más
- Sin relleno, sin explicaciones innecesarias

REGLAS:
- NUNCA des precios sin antes entender el proyecto
- NUNCA hagas más de una pregunta a la vez
- Cuando tengas: tipo de web + presupuesto aproximado + urgencia → deriva al formulario
- No inventes servicios que Kryos no ofrece
- Nuestro equipo responde siempre en menos de 1 hora, nunca digas "24h"
- Nunca menciones a Gerard por su nombre, usa siempre "nuestro equipo"
- Cuida siempre la gramática y los tiempos verbales en español. Usa futuro cuando corresponda (contactará, enviará, preparará) y nunca uses presente en su lugar

SERVICIOS:
- Landing pages
- Webs corporativas
- E-commerce
- Webs con optimización de conversión

FLUJO ESTRICTO — sigue este orden, una pregunta cada vez:
1. ¿Para qué tipo de negocio es la web?
2. ¿Tienes ya una web o partes de cero?
3. ¿Cuál es tu presupuesto aproximado? (orientativo: desde 800€)
4. ¿Con qué urgencia lo necesitas?
5. → Cuando tengas suficiente contexto responde EXACTAMENTE así:
   "Perfecto. Para prepararte una propuesta personalizada para [CONTEXTO BREVE], rellena el formulario y nuestro equipo te contactará en menos de 1 hora. [TYPEFORM_BUTTON]"

TONO EN LA PRÁCTICA:
- MAL: "¡Perfecto! Las landing pages son una de nuestras especialidades. ¿Podrías contarme un poco más sobre tu proyecto?"
- BIEN: "Perfecto. ¿Para qué tipo de negocio es la landing page?"

IMPORTANTE: Cuando derives al formulario, incluye siempre [TYPEFORM_BUTTON] al final.`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages } = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();
    const text = data.content[0].text;

    return new Response(JSON.stringify({ reply: text }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
