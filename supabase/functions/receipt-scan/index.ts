import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    })
  }

  console.log('=== Receipt Scan Function Started ===')
  console.log('Request method:', req.method)
  console.log('Request URL:', req.url)

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }}
      )
    }

    const { ocrText } = await req.json()

    console.log('OCR text received:', ocrText ? `${ocrText.substring(0, 100)}...` : 'missing')

    if (!ocrText || typeof ocrText !== 'string') {
      console.error('Invalid ocrText:', typeof ocrText)
      return new Response(
        JSON.stringify({ error: 'ocrText is required' }),
        { status: 400, headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }}
      )
    }

    // Debug: Log all headers
    const allHeaders = Object.fromEntries(req.headers.entries())
    console.log('All received headers:', JSON.stringify(allHeaders, null, 2))

    // Get apikey from request header (for Supabase Edge Functions)
    // Try multiple case variations
    const apikey = req.headers.get('apikey') ||
                  req.headers.get('apikey') ||
                  req.headers.get('x-api-key')

    const authorization = req.headers.get('authorization') ||
                       req.headers.get('Authorization')

    console.log('Extracted headers:', {
      apikey: apikey ? `${apikey.substring(0, 20)}...` : 'missing',
      authorization: authorization ? `${authorization.substring(0, 20)}...` : 'missing'
    })

    // Try apikey first, fallback to authorization header
    const key = apikey || authorization

    if (!key) {
      console.error('No API key found in headers')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header', debug: { headers: Object.fromEntries(req.headers.entries()) } }),
        { status: 401, headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }}
      )
    }

    // Get Gemini API key from environment variable
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

    console.log('GEMINI_API_KEY present:', !!GEMINI_API_KEY)

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }}
      )
    }

    // Call Gemini API - using preview model for better availability
    const MODEL_NAME = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash-preview-05-20'
    console.log('Using model:', MODEL_NAME)

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a receipt parser for Indonesian receipts. Extract structured data from OCR text below.
Return ONLY valid JSON without markdown formatting. Use this exact structure:
{
  "merchant": "store name",
  "total": number (in Rupiah, without decimals),
  "date": "YYYY-MM-DD",
  "time": "HH:MM" (if available),
  "items": [
    {"name": "item name", "quantity": number, "unitPrice": number, "total": number}
  ],
  "category": "groceries|food|transport|shopping|health|entertainment|bills|other"
}

Rules:
- Extract ALL items if available
- Infer category from merchant name and items
- Total must be a number (e.g., 150000)
- If confidence level is low, make best guess
- Return ONLY JSON, no explanations

OCR Text:
${ocrText}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to process receipt', details: errorText }),
        { status: 500, headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }}
      )
    }

    const geminiData = await geminiResponse.json()

    // Extract AI response
    let aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Clean up markdown code blocks if present
    aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    // Parse JSON response
    let parsedData
    try {
      parsedData = JSON.parse(aiText)
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', aiText)
      return new Response(
        JSON.stringify({
          error: 'Failed to parse AI response',
          rawResponse: aiText
        }),
        { status: 500, headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }}
      )
    }

    // Return parsed data
    return new Response(
      JSON.stringify({
        success: true,
        data: parsedData
      }),
      { headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }}
    )

  } catch (error) {
    console.error('Receipt scan error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }}
    )
  }
})
