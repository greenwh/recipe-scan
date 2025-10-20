import React, { useState, useEffect } from 'react';
import { getRecipeById } from '../db';

function RecipeEditor({ rawText, recipeId, onSave, onCancel }) {
  const [recipe, setRecipe] = useState({ title: '', ingredients: [], instructions: '' });
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRecipeForEdit() {
      if (recipeId) {
        setIsLoading(true);
        try {
          const existingRecipe = await getRecipeById(recipeId);
          if (existingRecipe) {
            setRecipe(existingRecipe);
          } else {
            setError('Recipe to edit not found.');
          }
        } catch (err) {
          setError('Failed to load recipe for editing.');
        } finally {
          setIsLoading(false);
        }
      } else if (rawText) {
        const storedApiKey = localStorage.getItem('geminiApiKey');
        if (storedApiKey) {
          setApiKey(storedApiKey);
          processTextWithAI(rawText, storedApiKey);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    loadRecipeForEdit();
  }, [rawText, recipeId]);

  const processTextWithAI = async (text, key) => {
    if (!key) {
      setError('Please enter your Google AI API Key to process the recipe.');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError('');

    const modelName = localStorage.getItem('geminiModelName') || 'gemini-1.5-pro';
    const prompt = `
      You are a recipe parsing expert. Your ONLY output must be a single, valid JSON object. Do not include any other text, markdown, or explanations.
      Analyze the following raw text extracted from a recipe card and format it into this JSON object.
      The JSON object must have three keys: "title" (string), "ingredients" (an array of strings), and "instructions" (a single string with newlines preserved).
      If you cannot determine the content for a field, return an empty string or empty array for that field. If the entire text is unreadable, return a JSON object with empty values for all fields.

      Raw Text:
      """
      ${text}
      """
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`, {
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
      
      const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : rawResponse;
      
      let parsedRecipe;
      try {
        parsedRecipe = JSON.parse(jsonString);
      } catch (parseError) {
        throw new Error("AI returned a non-JSON response. The recipe card may be unclear.");
      }
      
      if (typeof parsedRecipe.ingredients === 'string') {
        parsedRecipe.ingredients = parsedRecipe.ingredients.split('\n').filter(ing => ing.trim() !== '');
      }

      setRecipe(parsedRecipe);
    } catch (err) {
      console.error("AI processing failed:", err);
      setError(`Failed to process the recipe with AI. ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('geminiApiKey', apiKey);
    processTextWithAI(rawText, apiKey);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prev => ({ ...prev, [name]: value }));
  };
  
  const handleIngredientsChange = (e) => {
    setRecipe(prev => ({ ...prev, ingredients: e.target.value.split('\n') }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave(recipe);
  };

  if (isLoading) {
    return <p>Loading Editor...</p>;
  }

  if (!apiKey && rawText) {
    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">API Key Required</h5>
          <p>Please enter your Google AI API Key to structure the recipe.</p>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google AI API Key"
            />
          </div>
          <button className="btn btn-primary" onClick={handleSaveApiKey}>Save Key & Process</button>
          <button className="btn btn-secondary ms-2" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <details className="mb-3">
          <summary>Click to view Raw OCR Text (for debugging)</summary>
          <pre className="alert alert-secondary mt-2" style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
            {rawText || "No raw text received."}
          </pre>
        </details>

        <h5 className="card-title">{recipeId ? 'Edit Recipe' : 'Add Recipe'}</h5>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleFormSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={recipe.title}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="ingredients" className="form-label">Ingredients (one per line)</label>
            <textarea
              className="form-control"
              id="ingredients"
              name="ingredients"
              rows="8"
              value={recipe.ingredients ? recipe.ingredients.join('\n') : ''}
              onChange={handleIngredientsChange}
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="instructions" className="form-label">Instructions</label>
            <textarea
              className="form-control"
              id="instructions"
              name="instructions"
              rows="8"
              value={recipe.instructions}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Save Recipe</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={onCancel}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default RecipeEditor;
