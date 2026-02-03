// ==========================================================
// RECIPE DATA MODULE (Lógica Compartida entre todas las páginas)
// ==========================================================
const RecipeDataModule = (() => {
    
    // --- Utilidades de Datos (LocalStorage) ---
    function loadRecipes() {
        const recipesJson = localStorage.getItem('charcuterie_recipes');
        return recipesJson ? JSON.parse(recipesJson) : [];
    }

    function saveRecipes(recipes) {
        localStorage.setItem('charcuterie_recipes', JSON.stringify(recipes));
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // --- Lógica Principal de Cálculo ---
    function calculateBatchAmounts(recipe, targetMeatWeight) {
        
        if (!recipe || isNaN(targetMeatWeight) || targetMeatWeight <= 0) {
            return { results: [], grandTotalAmount: 0 };
        }
        
        // --- 1. Determinar el Peso Total del Lote (T) ---
        // Fórmula: T = MeatWeight / MeatRatio
        // Este valor es la base para TODOS los ingredientes no cárnicos.
        const targetTotalWeight = targetMeatWeight / recipe.meatRatio; 
        
        const meatAmount = targetMeatWeight; // El input del usuario es Target Meat Weight (M)
        
        let results = [];
        let grandTotalAmount = 0;
        

        results.push({ 
            name: `${recipe.name} (Meat Base)`, 
            ratio: recipe.meatRatio * 100, 
            amount: meatAmount 
        });

        grandTotalAmount += meatAmount;

        // 3. MIX BASE CALCULATIONS (Sal/Cura - Ratio basado en Peso Total T)
        recipe.mixBase.forEach(ing => {
            // Salt Amount = T * Salt Ratio
            const amount = targetTotalWeight * ing.ratio; 
            results.push({ name: ing.name, ratio: ing.ratio * 100, amount: amount });
            grandTotalAmount += amount;
        });
       

        return { results, grandTotalAmount };
    }

    return {
        loadRecipes,
        saveRecipes,
        generateId,
        calculateBatchAmounts
    };

})();
