import React, { useState, useEffect } from 'react';
import { getAllRecipes } from '../db';

function RecipeList({ onScanClick, onSettingsClick, onRecipeSelect, onGenerateList, onManualAddClick, onDelete }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const allRecipes = await getAllRecipes();
        setRecipes(allRecipes);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipes();
  }, []);

  const handleSelectToggle = (recipeId) => {
    const newSelection = new Set(selectedRecipes);
    if (newSelection.has(recipeId)) {
      newSelection.delete(recipeId);
    } else {
      newSelection.add(recipeId);
    }
    setSelectedRecipes(newSelection);
  };

  const handleGenerateClick = () => {
    onGenerateList(Array.from(selectedRecipes));
  };

  // Filter recipes based on search term (name and ingredients)
  const filteredRecipes = recipes.filter(recipe => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = recipe.title.toLowerCase().includes(searchLower);
    const ingredientsMatch = recipe.ingredients?.some(ingredient =>
      ingredient.toLowerCase().includes(searchLower)
    );
    return titleMatch || ingredientsMatch;
  });

  if (loading) {
    return <p>Loading recipes...</p>;
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search recipes by name or ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end mb-3">
        {selectionMode && (
          <button
            className="btn btn-success me-auto"
            onClick={handleGenerateClick}
            disabled={selectedRecipes.size === 0}
          >
            Generate Shopping List ({selectedRecipes.size})
          </button>
        )}
        <button className="btn btn-info me-2" onClick={() => setSelectionMode(!selectionMode)}>
          {selectionMode ? 'Cancel' : 'Select Recipes'}
        </button>
        <button className="btn btn-secondary me-2" onClick={onSettingsClick}>
          Settings
        </button>
        <button className="btn btn-success me-2" onClick={onManualAddClick}>
          Add Manually
        </button>
        <button className="btn btn-primary" onClick={onScanClick}>
          Scan New Recipe
        </button>
      </div>
      {recipes.length > 0 ? (
        filteredRecipes.length > 0 ? (
          <div className="list-group">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div className="flex-grow-1" onClick={() => !selectionMode && onRecipeSelect(recipe.id)} style={{ cursor: selectionMode ? 'default' : 'pointer' }}>
                  <h5 className="mb-1">{recipe.title}</h5>
                </div>
                {selectionMode ? (
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedRecipes.has(recipe.id)}
                    onChange={() => handleSelectToggle(recipe.id)}
                    style={{ transform: 'scale(1.5)' }}
                  />
                ) : (
                  <button
                    className="btn-close"
                    aria-label="Delete"
                    onClick={() => onDelete(recipe.id)}
                  ></button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>No recipes match your search.</p>
          </div>
        )
      ) : (
        <div className="text-center">
          <p>No recipes found. Scan your first recipe card to get started!</p>
        </div>
      )}
    </div>
  );
}

export default RecipeList;
