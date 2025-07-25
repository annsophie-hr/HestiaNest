import { create } from 'zustand';

type MinimalRecipeInfo = {
  id: string;
  servings: number;
  date: string; // ISO format
  name: string;
};

// Define the shape of your new MealStore
type MealStore = {
    // stores planned meals per days
    // Each date will have an array of MinimalRecipeInfo
    plannedMeals: { [dateKey: string]: MinimalRecipeInfo[] };

    // Function to add a meal to the planner
    addPlannedMeal: (meal: MinimalRecipeInfo) => void;

    // Function to remove a meal from the planner (optional, but good for completeness)
    removePlannedMeal: (dateKey: string, recipeId: string) => void;

    // Function to clear all planned meals (optional)
    clearAllPlannedMeals: () => void;
};

export const useMealStore = create<MealStore>((set, get) => ({
    plannedMeals: {}, // Initialize as an empty object

    addPlannedMeal: (newMeal) => {
        set((state) => {
            const dateKey = newMeal.date.split('T')[0]; // Use YYYY-MM-DD as the key

            // Get current meals for this date, or an empty array if none exist
            const currentMealsForDate = state.plannedMeals[dateKey] || [];

            // Check if this specific recipe is already planned for this date
            const existingMealIndex = currentMealsForDate.findIndex(
                (meal) => meal.id === newMeal.id
            );

            let updatedMealsForDate;
            if (existingMealIndex > -1) {
                // If it exists, update the existing entry (e.g., servings)
                updatedMealsForDate = [...currentMealsForDate];
                updatedMealsForDate[existingMealIndex] = newMeal; // Overwrite with new data
            } else {
                // If it's a new meal for this date, add it to the array
                updatedMealsForDate = [...currentMealsForDate, newMeal];
            }

            return {
                plannedMeals: {
                    ...state.plannedMeals, // Keep all other dates as they are
                    [dateKey]: updatedMealsForDate, // Update/add meals for this specific date
                },
            };
        });
    },

    removePlannedMeal: (dateKey, recipeId) => {
        set((state) => {
            const currentMealsForDate = state.plannedMeals[dateKey] || [];
            const filteredMeals = currentMealsForDate.filter((meal) => meal.id !== recipeId);

            return {
                plannedMeals: {
                    ...state.plannedMeals,
                    [dateKey]: filteredMeals,
                },
            };
        });
    },

    clearAllPlannedMeals: () => set({ plannedMeals: {} }), // Resets the entire planner
}));