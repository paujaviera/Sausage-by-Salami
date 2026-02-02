const FormulaEditor = (() => {
    
    function addIngredientRow(parentId, target, defaultName = '', defaultValue = 0.5) {
        const parent = document.getElementById(parentId);
        const label = '%'; 
        
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-row';
        
        newRow.innerHTML = `
            <input type="text" value="${defaultName}" placeholder="Ingredient Name">
            <input type="number" value="${defaultValue}" step="0.01" data-ratio-target="${target}" inputmode="decimal" required>
            <span>${label}</span>
            <button type="button" class="remove-btn" onclick="FormulaEditor.removeIngredient(this)">X</button>
        `;
        parent.appendChild(newRow);
    }

    function removeIngredient(button) {
        button.closest('.ingredient-row').remove();
    }

    function setupEditor() {
        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('id');

        if (recipeId && recipeId !== 'new') {
            const recipes = RecipeDataModule.loadRecipes();
            const recipe = recipes.find(r => r.id === recipeId);
            if (!recipe) return;

            document.getElementById('editor-title').textContent = `Edit: ${recipe.name}`;
            document.getElementById('recipe-name-input').value = recipe.name;
            document.getElementById('editing-recipe-id').value = recipe.id;
            document.getElementById('edit-meat-ratio').value = recipe.meatRatio * 100;

            recipe.mixBase.forEach(ing => addIngredientRow('edit-mix-base-inputs', 'total', ing.name, ing.ratio * 100));
            recipe.flavoring.forEach(ing => addIngredientRow('edit-flavoring-inputs', 'total', ing.name, ing.ratio * 100)); 
        } else {
            document.getElementById('editor-title').textContent = "Add Recipe";
            addIngredientRow('edit-mix-base-inputs', 'total', 'Your butt', 1.75);
            addIngredientRow('edit-flavoring-inputs', 'total', 'Your hole', 0.75);
        }
    }

    function saveRecipeFormula() {
        const id = document.getElementById('editing-recipe-id').value;
        const name = document.getElementById('recipe-name-input').value;
        const meatRatioInput = parseFloat(document.getElementById('edit-meat-ratio').value);
        
        if (meatRatioInput < 0 || meatRatioInput > 100) {
            alert("Meat Ratio must be between 0% and 100%.");
            return;
        }
        if (!name.trim()) { alert("Please enter a Recipe Name."); return; }
        
        const getIngredients = (containerId) => {
            const ingredients = [];
            const rows = document.querySelectorAll(`#${containerId} .ingredient-row`);
            rows.forEach(row => {
                const nameInput = row.querySelector('input[type="text"]').value;
                const ratioInput = parseFloat(row.querySelector('input[type="number"]').value);
                if (nameInput && !isNaN(ratioInput)) {
                    ingredients.push({
                        name: nameInput,
                        ratio: ratioInput / 100 
                    });
                }
            });
            return ingredients;
        };

        const newRecipe = {
            id: id || RecipeDataModule.generateId(),
            name: name,
            meatRatio: meatRatioInput / 100,
            mixBase: getIngredients('edit-mix-base-inputs'),
            flavoring: getIngredients('edit-flavoring-inputs')
        };

        let recipes = RecipeDataModule.loadRecipes();
        if (id) {
            const index = recipes.findIndex(r => r.id === id);
            if (index !== -1) { recipes[index] = newRecipe; }
        } else {
            recipes.push(newRecipe);
        }
        
        RecipeDataModule.saveRecipes(recipes);
        window.location.href = `index.html?status=${encodeURIComponent(`Recipe "${name}" saved!`)}`;
    }

    return { setupEditor, saveRecipeFormula, addIngredientRow, removeIngredient };
})();

document.addEventListener('DOMContentLoaded', FormulaEditor.setupEditor);