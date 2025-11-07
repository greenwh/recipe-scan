import React, { useState, useEffect } from 'react';
import { getAllRecipes, bulkImportRecipes } from '../db';
import { AI_PROVIDERS, DEFAULT_MODELS } from '../aiProviders';

function Settings({ onBack }) {
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [aiProvider, setAiProvider] = useState('google');

  useEffect(() => {
    // Load stored values
    const storedKey = localStorage.getItem('aiApiKey') || localStorage.getItem('geminiApiKey') || '';
    const storedProvider = localStorage.getItem('aiProvider') || 'google';
    const storedModel = localStorage.getItem('aiModelName') || localStorage.getItem('geminiModelName') || '';

    setApiKey(storedKey);
    setAiProvider(storedProvider);
    setModelName(storedModel || DEFAULT_MODELS[storedProvider]);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('aiApiKey', apiKey);
    localStorage.setItem('aiProvider', aiProvider);
    localStorage.setItem('aiModelName', modelName);
    // Keep old keys for backwards compatibility
    localStorage.setItem('geminiApiKey', apiKey);
    localStorage.setItem('geminiModelName', modelName);
    alert('Settings saved!');
  };

  const handleProviderChange = (e) => {
    const newProvider = e.target.value;
    setAiProvider(newProvider);
    // Auto-fill default model for the selected provider
    setModelName(DEFAULT_MODELS[newProvider]);
  };

  const handleExport = async () => {
    try {
      const recipes = await getAllRecipes();
      
      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        recipes: recipes,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recipes-export.json';
      document.body.appendChild(a); // Required for Firefox
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export recipes:', error);
      alert('Error: Could not export recipes.');
    }
  };

  const handleImport = (e, mode) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        // Support both new versioned format and old flat array format
        const recipes = data.recipes || data; 
        
        if (!Array.isArray(recipes)) {
            throw new Error("Invalid JSON format. Expected an array of recipes.");
        }
        const { addedCount, skippedCount } = await bulkImportRecipes(recipes, mode);
        alert(`Import complete!\nAdded: ${addedCount}\nSkipped (duplicates): ${skippedCount}`);
        // Reset file input
        e.target.value = null; 
      } catch (error) {
        console.error('Failed to import recipes:', error);
        alert(`Error: Could not import recipes. ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Settings</h5>
        
        <div className="mb-4">
          <h6>AI Configuration</h6>
          <p><small>Your API key is stored securely in your browser's local storage and is never shared.</small></p>

          <div className="mb-3">
            <label htmlFor="aiProvider" className="form-label">AI Provider</label>
            <select
              id="aiProvider"
              className="form-select"
              value={aiProvider}
              onChange={handleProviderChange}
            >
              {Object.entries(AI_PROVIDERS).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="apiKey" className="form-label">API Key</label>
            <input
              id="apiKey"
              type="password"
              className="form-control"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${AI_PROVIDERS[aiProvider]} API Key`}
            />
            <small className="form-text text-muted">
              {aiProvider === 'google' && 'Get your API key from: https://aistudio.google.com/app/apikey'}
              {aiProvider === 'openai' && 'Get your API key from: https://platform.openai.com/api-keys'}
              {aiProvider === 'claude' && 'Get your API key from: https://console.anthropic.com/'}
              {aiProvider === 'grok' && 'Get your API key from: https://console.x.ai/'}
            </small>
          </div>

          <div className="mb-3">
            <label htmlFor="modelName" className="form-label">Model Name</label>
            <input
              id="modelName"
              type="text"
              className="form-control"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder={`e.g., ${DEFAULT_MODELS[aiProvider]}`}
            />
            <small className="form-text text-muted">
              Leave default or specify a different model version
            </small>
          </div>

          <button className="btn btn-primary" onClick={handleSaveSettings}>Save Settings</button>
        </div>

        <div className="mb-4">
            <h6>Data Management</h6>
            <button className="btn btn-success me-2" onClick={handleExport}>
                Export Recipes to JSON
            </button>
        </div>

        <div className="mb-4">
            <h6>Import from JSON</h6>
            <div className="mb-2">
                <label htmlFor="importAdd" className="form-label">
                    <strong>Add to Existing Recipes</strong> (skips duplicates)
                </label>
                <input 
                    type="file" 
                    className="form-control" 
                    id="importAdd"
                    accept=".json"
                    onChange={(e) => handleImport(e, 'add')} 
                />
            </div>
            <div className="mb-2">
                <label htmlFor="importOverwrite" className="form-label">
                    <strong>Overwrite All Recipes</strong> (deletes existing recipes first)
                </label>
                <input 
                    type="file" 
                    className="form-control" 
                    id="importOverwrite"
                    accept=".json"
                    onChange={(e) => handleImport(e, 'overwrite')} 
                />
            </div>
        </div>

        <hr />
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Recipe List
        </button>
      </div>
    </div>
  );
}

export default Settings;
