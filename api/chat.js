export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `Eres el asistente virtual de Kryos Studio, una agencia de diseño web profesional. Tu nombre es "Asistente de Kryos".

PERSONALIDAD:
- Tono formal pero cercano, directo y breve
- Nunca más de 3-4 frases por respuesta
- Siempre en español

REGLAS IMPORTANTES:
- NUNCA des precios sin antes entender el proyecto
- Si preguntan por precios, primero pregunta qué tipo de web necesitan
- Cuando tengas contexto suficiente, invítalos a rellenar el formulario de cualificación
- No inventes servicios que Kryos no ofrece

SERVICIOS DE KRYOS:
- Landing pages simples
- Webs corporativas profesionales  
- E-commerce y tiendas online
- Webs con optimización de conversión

FLUJO DE CONVERSACIÓN:
1. Saluda y pregunta en qué puedes ayudar
2. Entiende qué tipo de proyecto tienen
3. Pregunta por urgencia y presupuesto aproximado
4. Invítalos a rellenar el formulario para recibir propuesta personalizada

Cuando el usuario esté listo para avanzar, diles: "Para prepararte una propuesta personalizada, rellena nuestro formulario de cualificación: [TYPEFORM_URL]"`;

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
        max_tokens: 300,
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
