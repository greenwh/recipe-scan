import React, { useState, useEffect, useCallback } from 'react';
import { getRecipeById } from '../db';
import { processRecipeWithAI, AI_PROVIDERS } from '../aiProviders';

function RecipeEditor({ rawText, recipeId, onSave, onCancel }) {
  const [recipe, setRecipe] = useState({ title: '', ingredients: [], instructions: '' });
  const [apiKey, setApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState('google');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const processTextWithAI = useCallback(async (text, key, provider) => {
    if (!key) {
      setError(`Please enter your ${AI_PROVIDERS[provider || 'google']} API Key to process the recipe.`);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    const modelName = localStorage.getItem('aiModelName') || localStorage.getItem('geminiModelName') || '';
    const selectedProvider = provider;

    try {
      const parsedRecipe = await processRecipeWithAI(text, selectedProvider, key, modelName);
      setRecipe(parsedRecipe);
    } catch (err) {
      console.error("AI processing failed:", err);
      setError(`Failed to process the recipe with AI. ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        // Load AI settings (check both new and old keys for backwards compatibility)
        const storedApiKey = localStorage.getItem('aiApiKey') || localStorage.getItem('geminiApiKey');
        const storedProvider = localStorage.getItem('aiProvider') || 'google';
        if (storedApiKey) {
          setApiKey(storedApiKey);
          setAiProvider(storedProvider);
          processTextWithAI(rawText, storedApiKey, storedProvider);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    loadRecipeForEdit();
  }, [rawText, recipeId, processTextWithAI]);

  const handleSaveApiKey = () => {
    localStorage.setItem('aiApiKey', apiKey);
    localStorage.setItem('aiProvider', aiProvider);
    // Keep old keys for backwards compatibility
    localStorage.setItem('geminiApiKey', apiKey);
    processTextWithAI(rawText, apiKey, aiProvider);
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
          <p>Please enter your {AI_PROVIDERS[aiProvider]} API Key to structure the recipe.</p>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${AI_PROVIDERS[aiProvider]} API Key`}
            />
          </div>
          <button className="btn btn-primary" onClick={handleSaveApiKey}>Save Key & Process</button>
          <button className="btn btn-secondary ms-2" onClick={onCancel}>Cancel</button>
          <div className="mt-3">
            <small className="text-muted">
              You can configure the AI provider in Settings. Current: {AI_PROVIDERS[aiProvider]}
            </small>
          </div>
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
