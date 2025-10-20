import React, { useState, useEffect } from 'react';
import { getRecipeById } from '../db';

function ShoppingList({ recipeIds, onBack }) {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generateList() {
      try {
        const allIngredients = new Set();
        for (const id of recipeIds) {
          const recipe = await getRecipeById(id);
          if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach(ing => {
              if (ing.trim()) { // Ensure not adding empty strings
                allIngredients.add(ing.trim());
              }
            });
          }
        }
        setIngredients(Array.from(allIngredients).sort());
      } catch (error) {
        console.error('Failed to generate shopping list:', error);
      } finally {
        setLoading(false);
      }
    }

    if (recipeIds && recipeIds.length > 0) {
      generateList();
    } else {
      setLoading(false);
    }
  }, [recipeIds]);

  if (loading) {
    return <p>Generating shopping list...</p>;
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Shopping List</h5>
        {ingredients.length > 0 ? (
          <ul className="list-group list-group-flush">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="list-group-item">
                <input
                  className="form-check-input me-2"
                  type="checkbox"
                  value=""
                  id={`ingredient-${index}`}
                />
                <label className="form-check-label" htmlFor={`ingredient-${index}`}>
                  {ingredient}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p>No ingredients to show. Select some recipes first!</p>
        )}
        <hr />
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Recipe List
        </button>
      </div>
    </div>
  );
}

export default ShoppingList;
