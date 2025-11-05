import React, { useState, useEffect } from 'react';
import { getRecipeById } from '../db';

function RecipeDetail({ recipeId, onBack, onEdit }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareError, setShareError] = useState(null);

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

  const handleShare = async () => {
    if (!recipe) return;

    const shareText = `${recipe.title}\n\nIngredients:\n${recipe.ingredients?.join('\n') || 'None'}\n\nInstructions:\n${recipe.instructions || 'None'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: shareText
        });
        setShareError(null);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          setShareError('Failed to share recipe');
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Recipe copied to clipboard!');
        setShareError(null);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        setShareError('Sharing not supported on this device');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h3 className="card-title mb-0">{recipe.title}</h3>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-success btn-sm" onClick={handleShare} title="Share Recipe">
              <i className="bi bi-share"></i> Share
            </button>
            <button className="btn btn-outline-info btn-sm" onClick={handlePrint} title="Print Recipe">
              <i className="bi bi-printer"></i> Print
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => onEdit(recipe.id)}>
              <i className="bi bi-pencil"></i> Edit
            </button>
          </div>
        </div>

        {shareError && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            {shareError}
            <button type="button" className="btn-close" onClick={() => setShareError(null)}></button>
          </div>
        )}
        
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
