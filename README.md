# Geckstia

Mobile meal planning app that transforms the weekly cooking chaos into a simple, organized process. Named after one of my baby's favorite word geckolo and hestia, the godess of home and hearth. This was built as CS50 final project by An Sophie from Munich, Germany.

## The Problem

Every week, the same struggle: figuring out what to cook, manually calculating ingredients for multiple meals, and creating scattered shopping lists. Whether it's four dinners plus two batches of birthday muffins for kindergarten, the math gets messy and time-consuming.

## The Solution

**Geckstia** streamlines meal planning with three core features:

### 📱 Recipe Management
- Save recipes from anywhere: food blogs, old family recipes (offline), online sources
- Centralized recipe collection by category (eg. Baking, Main Course) - always accessible
- Clean, organized interface and search functionality by name, type of food and tags

### 🗓️ Meal Planning
- Built-in weekly planner for scheduling meals
- Flexible serving size adjustments
- Visual meal organization

### 🛒 Smart Shopping Lists
- One-tap shopping list generation from planned meals
- Automatic ingredient calculations across multiple recipes, eg 24 servings birthday cake, 4 servings dinner
- Excludes basic ingredients from recipes, as water, salt, flour
- Export shopping list with quick generation or email

## Technology Stack

- **Backend**: Flask + Python for recipe storage, calculations, setting shopping list
- **Mobile App**: Expo Go + React Native with a tab structure to store 4 different screens (cookbook, planner, index, search)
- **Database**: Supabase to store the recipes
- **Platform**: iOS/Android/Web

The React Native app is organized around a tab structure with four primary tabs: Cookbook, Planner, Index, and Search. In addition to these, there are dedicated screens for viewing a single recipe, adding new recipes, and displaying the generated shopping list.
On the backend, several JSON-based routes handle data exchange. One key route processes selected recipes, applying serving-size multipliers to generate a consolidated shopping list. To ensure consistency, all ingredients are normalized to standard units, allowing quantities from multiple recipes to be aggregated. For better readability, a rounding mechanism is applied to integer quantities greater than one, and common base ingredients such as flour, salt, pepper, and water are automatically excluded from the generated list.
The Single Recipe screen interacts with three endpoints:
•	POST for creating new recipes,
•	GET for retrieving recipe details, and
•	PUT for updating existing recipes.
In the Planner view, users can select a specific date for adding meals. Once a date is chosen, the app navigates to the Cookbook, passing the selected date as context. From there, a recipe can be chosen, servings adjusted, and, upon pressing Add to Planner, the app sends the recipe ID, servings, and date back to the Planner, where it is stored under the correct day.




## Features

✅ Cross-platform mobile app (web, android, apple) 
✅ Recipe addition, modification and storage  
✅ Weekly meal planning interface  
✅ Automatic shopping list generation 
✅ Serving size calculations  
✅ Email functionality to send shopping lists
✅ Clean, intuitive user interface  

## Video Demo

Watch here:  https://youtu.be/5lZDy6l1xaE?si=FheHNMgWZ36FxbcB

