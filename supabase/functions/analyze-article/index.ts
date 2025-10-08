import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleText, articleUrl } = await req.json();
    
    if (!articleText && !articleUrl) {
      return new Response(
        JSON.stringify({ error: 'Either articleText or articleUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = articleText || `Analyze this article from: ${articleUrl}`;
    
    const systemPrompt = `You are an expert fact-checker and misinformation analyst helping students identify fake news.

Your task is to analyze news articles and provide:
1. A credibility score (0-100) where:
   - 0-30: Likely fake/unreliable
   - 31-60: Questionable/mixed credibility
   - 61-100: Likely credible

2. A determination: "credible", "questionable", or "fake"

3. A concise summary (2-3 sentences) of what the article claims

4. An educational explanation listing specific red flags or credibility indicators found in the article

Consider these factors:
- Sensational or clickbait language
- Lack of sources or citations
- Emotional manipulation tactics
- Verifiable facts vs opinions
- Author credibility and publication source
- Consistency with known facts
- Use of logical fallacies

Be educational and help students understand WHY something is unreliable.`;

    console.log('Calling Lovable AI for article analysis...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_analysis",
              description: "Return the fake news analysis results",
              parameters: {
                type: "object",
                properties: {
                  credibilityScore: {
                    type: "number",
                    description: "Score from 0-100 indicating credibility"
                  },
                  determination: {
                    type: "string",
                    enum: ["credible", "questionable", "fake"],
                    description: "Overall determination of article credibility"
                  },
                  summary: {
                    type: "string",
                    description: "Brief 2-3 sentence summary of the article"
                  },
                  explanation: {
                    type: "string",
                    description: "Educational explanation of red flags or credibility indicators"
                  }
                },
                required: ["credibilityScore", "determination", "summary", "explanation"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_analysis" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to analyze article' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI Response received');
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error('No tool call in response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    
    console.log('Analysis complete:', analysis.determination);
    
    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-article function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
