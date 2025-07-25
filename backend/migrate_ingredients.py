import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  

from app import app, db, Recipe
import re

# Parse "amountAndUnit" into amount (float) and unit (string)
def parse_amount_unit(s):
    match = re.match(r"([\d.,]+)\s*([a-zA-Z]+)", s)
    if match:
        amount = float(match.group(1).replace(',', '.'))
        unit = match.group(2).lower()
        return amount, unit
    return 0, ""

def migrate_ingredients():
    with app.app_context():
        recipes = Recipe.query.all()
        updated_count = 0

        for recipe in recipes:
            changed = False
            new_ingredients = []

            for ing in recipe.ingredients:
                if "amountAndUnit" in ing:
                    amount, unit = parse_amount_unit(ing["amountAndUnit"])
                    new_ing = {
                        "name": ing["name"],
                        "amount": amount,
                        "unit": unit
                    }
                    new_ingredients.append(new_ing)
                    changed = True
                else:
                    new_ingredients.append(ing)  # already migrated

            if changed:
                recipe.ingredients = new_ingredients
                updated_count += 1

        if updated_count:
            db.session.commit()
            print(f"Migrated {updated_count} recipe(s).")
        else:
            print("No recipes needed migration.")

if __name__ == "__main__":
    migrate_ingredients()
