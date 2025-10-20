import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import RecipeList from './components/RecipeList';
import RecipeScanner from './components/RecipeScanner';
import RecipeEditor from './components/RecipeEditor';
import Settings from './components/Settings';
import RecipeDetail from './components/RecipeDetail';
import ShoppingList from './components/ShoppingList';
import { addRecipe, updateRecipe, deleteRecipe } from './db';

function App() {
  const [view, setView] = useState('list'); // 'list', 'scanner', 'editor', 'detail', 'settings', 'shoppingList'
  const [rawText, setRawText] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState([]);
  const [recipesUpdated, setRecipesUpdated] = useState(false);

  const handleScanClick = () => setView('scanner');
  const handleSettingsClick = () => setView('settings');
  const handleCancel = () => setView('list');

  const handleManualAddClick = () => {
    setRawText(''); // Ensure no old text is carried over
    setView('editor');
  };

  const handleRecipeSelect = (id) => {
    setSelectedRecipeId(id);
    setView('detail');
  };

  const handleEdit = (id) => {
    setEditingRecipeId(id);
    setRawText(''); // Not scanning, so clear raw text
    setView('editor');
  };

  const handleGenerateList = (ids) => {
    setSelectedRecipeIds(ids);
    setView('shoppingList');
  };

  const handleScanComplete = (text) => {
    setRawText(text);
    setEditingRecipeId(null);
    setView('editor');
  };

  const handleDeleteRecipe = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id);
        setRecipesUpdated(prev => !prev); // Trigger re-render
      } catch (error) {
        console.error("Failed to delete recipe:", error);
        alert("Error: Could not delete the recipe.");
      }
    }
  };

  const handleSaveRecipe = async (recipe) => {
    try {
      if (editingRecipeId) {
        await updateRecipe({ ...recipe, id: editingRecipeId });
      } else {
        await addRecipe(recipe);
      }
      setRecipesUpdated(prev => !prev);
      setEditingRecipeId(null);
      setView('list');
    } catch (error) {
      console.error("Failed to save recipe:", error);
      alert("Error: Could not save the recipe. A recipe with this title may already exist.");
    }
  };
  
  const renderView = () => {
    switch (view) {
      case 'scanner':
        return <RecipeScanner onCancel={handleCancel} onScanComplete={handleScanComplete} />;
      case 'editor':
        return <RecipeEditor rawText={rawText} recipeId={editingRecipeId} onSave={handleSaveRecipe} onCancel={handleCancel} />;
      case 'settings':
        return <Settings onBack={handleCancel} />;
      case 'detail':
        return <RecipeDetail recipeId={selectedRecipeId} onBack={handleCancel} onEdit={handleEdit} />;
      case 'shoppingList':
        return <ShoppingList recipeIds={selectedRecipeIds} onBack={handleCancel} />;
      case 'list':
      default:
        return (
          <RecipeList 
            onScanClick={handleScanClick} 
            onSettingsClick={handleSettingsClick} 
            onRecipeSelect={handleRecipeSelect}
            onGenerateList={handleGenerateList}
            onManualAddClick={handleManualAddClick}
            onDelete={handleDeleteRecipe}
            key={recipesUpdated} 
          />
        );
    }
  };

  return (
    <div className="container mt-4">
      <header className="text-center mb-4">
        <h1>RecipeScan</h1>
        <p className="lead">Your Digital Recipe Box</p>
      </header>
      <main>
        {renderView()}
      </main>
    </div>
  );
}

export default App;

