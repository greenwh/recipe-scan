/**
 * AI Provider utilities for recipe parsing
 * Supports: Google AI (Gemini), OpenAI, Anthropic (Claude), and Grok
 */

const RECIPE_PARSING_PROMPT = `You are a recipe parsing expert. Your ONLY output must be a single, valid JSON object. Do not include any other text, markdown, or explanations.
Analyze the following raw text extracted from a recipe card and format it into this JSON object.
The JSON object must have three keys: "title" (string), "ingredients" (an array of strings), and "instructions" (a single string with newlines preserved).
If you cannot determine the content for a field, return an empty string or empty array for that field. If the entire text is unreadable, return a JSON object with empty values for all fields.

Raw Text:
"""
{{TEXT}}
"""`;

/**
 * Process recipe text using Google AI (Gemini)
 */
async function processWithGoogleAI(text, apiKey, modelName) {
  const prompt = RECIPE_PARSING_PROMPT.replace('{{TEXT}}', text);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API request failed with status ${response.status}: ${errorData.error.message}`);
  }

  const data = await response.json();
  const rawResponse = data.candidates[0].content.parts[0].text;

  return extractJSON(rawResponse);
}

/**
 * Process recipe text using OpenAI
 */
async function processWithOpenAI(text, apiKey, modelName) {
  const prompt = RECIPE_PARSING_PROMPT.replace('{{TEXT}}', text);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName || 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a recipe parsing expert. Output only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API request failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const rawResponse = data.choices[0].message.content;

  return extractJSON(rawResponse);
}

/**
 * Process recipe text using Anthropic Claude
 */
async function processWithClaude(text, apiKey, modelName) {
  const prompt = RECIPE_PARSING_PROMPT.replace('{{TEXT}}', text);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: modelName || 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Claude API request failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const rawResponse = data.content[0].text;

  return extractJSON(rawResponse);
}

/**
 * Process recipe text using Grok (xAI)
 */
async function processWithGrok(text, apiKey, modelName) {
  const prompt = RECIPE_PARSING_PROMPT.replace('{{TEXT}}', text);

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName || 'grok-beta',
      messages: [
        { role: 'system', content: 'You are a recipe parsing expert. Output only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Grok API request failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const rawResponse = data.choices[0].message.content;

  return extractJSON(rawResponse);
}

/**
 * Extract JSON from AI response (handles markdown code blocks)
 */
function extractJSON(rawResponse) {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
  const jsonString = jsonMatch ? jsonMatch[1] : rawResponse.trim();

  let parsedRecipe;
  try {
    parsedRecipe = JSON.parse(jsonString);
  } catch (parseError) {
    throw new Error("AI returned a non-JSON response. The recipe card may be unclear.");
  }

  // Normalize ingredients to array if it's a string
  if (typeof parsedRecipe.ingredients === 'string') {
    parsedRecipe.ingredients = parsedRecipe.ingredients.split('\n').filter(ing => ing.trim() !== '');
  }

  return parsedRecipe;
}

/**
 * Main function to process recipe text with the selected AI provider
 */
export async function processRecipeWithAI(text, aiProvider, apiKey, modelName) {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  switch (aiProvider) {
    case 'google':
      return await processWithGoogleAI(text, apiKey, modelName || 'gemini-1.5-pro');
    case 'openai':
      return await processWithOpenAI(text, apiKey, modelName || 'gpt-4o');
    case 'claude':
      return await processWithClaude(text, apiKey, modelName || 'claude-3-5-sonnet-20241022');
    case 'grok':
      return await processWithGrok(text, apiKey, modelName || 'grok-beta');
    default:
      throw new Error(`Unknown AI provider: ${aiProvider}`);
  }
}

export const AI_PROVIDERS = {
  google: 'Google AI (Gemini)',
  openai: 'OpenAI',
  claude: 'Anthropic (Claude)',
  grok: 'xAI (Grok)'
};

export const DEFAULT_MODELS = {
  google: 'gemini-1.5-pro',
  openai: 'gpt-4o',
  claude: 'claude-3-5-sonnet-20241022',
  grok: 'grok-beta'
};
