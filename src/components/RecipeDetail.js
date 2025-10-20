import React, { useState, useEffect } from 'react';
import { getRecipeById } from '../db';

function RecipeDetail({ recipeId, onBack, onEdit }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const fetchedRecipe = await getRecipeById(recipeId);
        setRecipe(fetchedRecipe);
      } catch (error) {
        console.error(`Failed to fetch recipe with id ${recipeId}:`, error);
      } finally {
        setLoading(false);
      }
    }

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  if (loading) {
    return <p>Loading recipe...</p>;
  }

  if (!recipe) {
    return (
      <div>
        <p>Recipe not found.</p>
        <button className="btn btn-secondary" onClick={onBack}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <h3 className="card-title mb-0">{recipe.title}</h3>
          <button className="btn btn-outline-primary" onClick={() => onEdit(recipe.id)}>
            Edit
          </button>
        </div>
        
        <div className="mt-4">
          <h5>Ingredients</h5>
          <ul className="list-group list-group-flush">
            {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="list-group-item">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h5>Instructions</h5>
          <p style={{ whiteSpace: 'pre-wrap' }}>{recipe.instructions}</p>
        </div>

        <hr />
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Recipe List
        </button>
      </div>
    </div>
  );
}

export default RecipeDetail;
