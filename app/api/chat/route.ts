import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('=== GROQ REQUEST ===');
    console.log('GROQ KEY exists:', !!process.env.GROQ_API_KEY);
    console.log('GROQ KEY starts with:', process.env.GROQ_API_KEY?.substring(0, 8));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          ...(body.system ? [{ role: 'system', content: body.system }] : []),
          ...body.messages,
        ],
      }),
    });

    const data = await response.json();

    console.log('=== GROQ RESPONSE ===');
    console.log('STATUS:', response.status);
    console.log('DATA:', JSON.stringify(data));

    const converted = {
      content: [{ type: 'text', text: data.choices?.[0]?.message?.content || "Je n'ai pas pu répondre." }]
    };

    return NextResponse.json(converted, { status: response.status });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}