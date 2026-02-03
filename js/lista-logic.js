// Lógica para lista.html (My Recipes & Batch Calculator) - VERSIÓN FINAL

const BatchCalculator = (() => {
    let activeRecipe = null;
    
    function showSection(sectionId) {
        document.getElementById('recipe-list').classList.add('hidden');
        document.getElementById('batch-calculator').classList.add('hidden');
        document.getElementById(sectionId).classList.remove('hidden');

        const backLink = document.getElementById('back-link-dynamic');
        
        if (sectionId === 'batch-calculator') {
            // Cuando estamos en la calculadora, el link vuelve a la lista de recetas
            backLink.href = "#"; 
            backLink.innerHTML = "<span>&lsaquo;</span> Recipes";
            backLink.onclick = (e) => {
                e.preventDefault();
                showSection('recipe-list');
            };
        } else {
            // Cuando estamos en la lista, el link vuelve al menú principal (raíz)
            backLink.href = "../index.html"; 
            backLink.innerHTML = "<span>&lsaquo;</span> Menu";
            backLink.onclick = null;
        }
    }

    function renderRecipeList() {
        const container = document.getElementById('recipes-container');
        if (!container) return;
        
        container.innerHTML = '';
        const recipes = RecipeDataModule.loadRecipes();

        if (recipes.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #f0f0f0; margin-top: 20px;">No recipes added yet :(</p>';
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            
            // Al tocar la tarjeta, abrimos la calculadora
            card.onclick = () => BatchCalculator.setupBatchCalculator(recipe.id);

            card.innerHTML = `
                <div class="recipe-info">
                    <h4>${recipe.name}</h4>
                    <small style="color: #bdc3c7; font-style: italic;">Tap to calculate</small>
                </div>
                <div class="recipe-actions">
                    <a href="editor.html?id=${recipe.id}" class="action-button edit-btn" 
                       style="text-decoration: none;" onclick="event.stopPropagation();">
                        Edit
                    </a>
                    <button class="action-button delete-btn" 
                            onclick="event.stopPropagation(); BatchCalculator.deleteRecipe('${recipe.id}')">
                        Delete
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function deleteRecipe(id) {
        if (confirm("Are you sure you want to delete this recipe?")) {
            let recipes = RecipeDataModule.loadRecipes();
            recipes = recipes.filter(r => r.id !== id);
            RecipeDataModule.saveRecipes(recipes);
            renderRecipeList();
        }
    }

    function setupBatchCalculator(recipeId) {
        const recipes = RecipeDataModule.loadRecipes();
        activeRecipe = recipes.find(r => r.id === recipeId);
        
        if (!activeRecipe) {
            renderRecipeList();
            return;
        }
        
        document.getElementById('calc-recipe-name').textContent = activeRecipe.name;
        document.getElementById('calc-target-weight').value = 1000; 

        calculateBatchAmounts();
        showSection('batch-calculator');
    }

    function calculateBatchAmounts() {
        if (!activeRecipe) return;

        const targetMeatWeight = parseFloat(document.getElementById('calc-target-weight').value) || 0;
        const resultsBody = document.querySelector('#results-table tbody');
        
        if (!resultsBody) return;
        resultsBody.innerHTML = '';
        
        // Llamada al módulo de datos (receta-data.js)
        const { results, grandTotalAmount } = RecipeDataModule.calculateBatchAmounts(activeRecipe, targetMeatWeight);

        if (results.length === 0) {
            resultsBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Enter weight...</td></tr>';
            return;
        }
        
        results.forEach(item => {
            const newRow = resultsBody.insertRow();
            newRow.innerHTML = `
                <td>${item.name}</td>
                <td>${item.ratio.toFixed(2)}%</td>
                <td>${item.amount.toFixed(2)}g</td>
            `;
        });

        // Fila de Total final
        const totalRow = resultsBody.insertRow();
        totalRow.className = 'total-row';
        totalRow.style.fontWeight = "bold";
        totalRow.style.background = "rgba(255,255,255,0.1)";
        totalRow.innerHTML = `
            <td>TOTAL BATCH</td>
            <td>100%</td>
            <td>${grandTotalAmount.toFixed(2)}g</td>
        `;
    }

    return { renderRecipeList, setupBatchCalculator, calculateBatchAmounts, deleteRecipe, showSection };
})();

document.addEventListener('DOMContentLoaded', BatchCalculator.renderRecipeList);

