from flask import Flask, jsonify, request, abort
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

#load environment variables
load_dotenv()
GMAIL_USER = os.getenv('GMAIL_USER')
GMAIL_APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD')
API_KEY = os.getenv('API_KEY')

app = Flask(__name__)
#CORS(app, resources={
#    r"/*": {
#        "origins": [
#            "http://localhost:8081",
#            "https://psychic-zebra-wrx69q556656fgq7-5000.app.github.dev"
#        ]
#    }
#})
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)


# Connect to supabase URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres.zhmhlgmjvhmtdquaqpoh:pm3ncFkTCdZ2HOK9@aws-0-eu-central-1.pooler.supabase.com:5432/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define a recipe model to check database connection works
class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100))
    ingredients = db.Column(db.JSON, nullable=False)      # List of {"name": "...", "amount": "...", "unit": "..."}
    instructions = db.Column(db.JSON, nullable=False)     # List of step strings
    cooking_time = db.Column(db.Integer)                   # minutes
    preparation_time = db.Column(db.Integer)               # minutes
    tags = db.Column(db.JSON)                              # List of tags
    servings = db.Column(db.Integer)
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create database tables
with app.app_context():
    db.create_all() 

# Define email function
def send_email_to_user(to_email, shopping_list):
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    smtp_user = GMAIL_USER  # using environmental vars!
    smtp_password = GMAIL_APP_PASSWORD # e.g. App Password for Gmail

    msg = MIMEMultipart('alternative')
    msg['Subject'] = "Your Shopping List"
    msg['From'] = smtp_user
    msg['To'] = to_email

    # Format shopping list as HTML
    html = "<h2>Your Shopping List</h2><ul>"
    for item in shopping_list:
        html += f"<li>{item['amount']} {item['unit']} {item['name']}</li>"
    html += "</ul><p>Happy cooking!</p>"

    part = MIMEText(html, 'html')
    msg.attach(part)

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())
        server.quit()
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise e

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Recipe API!"})   

@app.route('/recipes/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    try:
        recipe = Recipe.qu
        ery.get(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        db.session.delete(recipe)
        db.session.commit()
        print(f"Deleted recipe with ID: {recipe_id}")
        return jsonify({"message": f"Recipe {recipe_id} deleted"}), 200

    except Exception as e:
        print(f"Error deleting recipe: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to delete recipe"}), 500


@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong"})

@app.before_request
def log_request_info():
    print(f"Request: {request.method} {request.path} Headers: {dict(request.headers)}")

@app.route('/recipes', methods=['POST'])
def create_recipe():
    
    try:
        # Get JSON data from request
        data = request.get_json()

        if not data or 'name' not in data or 'ingredients' not in data or 'instructions' not in data:
            return jsonify({"error": "Recipe incomplete"}), 400

        new_recipe = Recipe(
            name=data['name'],
            category=data.get('category'),
            ingredients=data.get('ingredients'),  # This will store [{"name": "...", "amount": "...", "unit": "..."}]
            cooking_time=data.get('cooking_time'),
            preparation_time=data.get('preparation_time'),
            instructions=data.get('instructions'),
            tags=data.get('tags', []),  # Store as list
            image_url=data.get('image_url'),
            servings=data.get('servings', 1),
        )
        
        # Insert recipe into database
        db.session.add(new_recipe)
        db.session.commit()
            
        print(f"Recipe created successfully with ID: {new_recipe.id}")  # Debug log
        return jsonify({
            "message": "Recipe was created!",
            "recipe_id": new_recipe.id
        }), 201
        
    except Exception as e:
        print(f"Error creating recipe: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to create recipe"}), 500


@app.route('/recipes/<int:recipe_id>', methods=['PUT'])
def update_recipe(recipe_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No update data provided"}), 400

        # Fetch the existing recipe
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Update fields if they exist in the request
        recipe.name = data.get('name', recipe.name)
        recipe.category = data.get('category', recipe.category)
        recipe.ingredients = data.get('ingredients', recipe.ingredients)
        recipe.cooking_time = data.get('cooking_time', recipe.cooking_time)
        recipe.preparation_time = data.get('preparation_time', recipe.preparation_time)
        recipe.instructions = data.get('instructions', recipe.instructions)
        recipe.tags = data.get('tags', recipe.tags)
        recipe.image_url = data.get('image_url', recipe.image_url)
        recipe.servings = data.get('servings', recipe.servings)

        db.session.commit()

        print(f"Recipe {recipe_id} updated successfully.")  # Debug log
        return jsonify({"message": "Recipe updated successfully."}), 200

    except Exception as e:
        print(f"Error updating recipe: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to update recipe"}), 500


@app.route('/recipes', methods=['GET'])
def get_recipes():
    try:
        recipes = Recipe.query.all()

        results = []
        for r in recipes:
            results.append({
                "id": r.id,
                "name": r.name,
                "category": r.category,
                "ingredients": r.ingredients,
                "instructions": r.instructions,
                "cooking_time": r.cooking_time,
                "preparation_time": r.preparation_time,
                "tags": r.tags,
                "servings": r.servings,
                "image_url": r.image_url,
                "created_at": r.created_at.isoformat(),
                "updated_at": r.updated_at.isoformat()
            })

        print(f"Sending {len(results)} recipes")  # Debug log
        return jsonify(results), 200  
    
    except Exception as e:
        print(f"Error fetching recipes: {e}")
        return jsonify({"error": "Failed to fetch recipes"}), 500   

@app.route('/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    try:
        # Get specific recipe using SQLAlchemy
        recipe = Recipe.query.get(recipe_id)
        
        if recipe:
            return jsonify({
                "id": recipe.id,
                "name": recipe.name,
                "category": recipe.category,
                "ingredients": recipe.ingredients,
                "instructions": recipe.instructions,
                "cooking_time": recipe.cooking_time,
                "preparation_time": recipe.preparation_time,
                "tags": recipe.tags,
                "servings": recipe.servings,
                "image_url": recipe.image_url,
                "created_at": recipe.created_at.isoformat(),
                "updated_at": recipe.updated_at.isoformat()
            }), 200
        else:
            return jsonify({"error": "Recipe not found"}), 404
            
    except Exception as e:
        print(f"Error fetching recipe: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500



# create shopping list from selected recipes
@app.route('/shopping', methods=['POST'])
@cross_origin(origins="*", methods=['POST', 'OPTIONS'], supports_credentials=False) 
def generate_shopping_list():
    print("Request data:", request.get_json())  # Debug log
    print("Request content type:", request.content_type)  # Debug log
    #if request.headers.get('x-api-key') != API_KEY:
    #    abort(401)  # Unauthorized
    try:
        data = request.get_json()
        meals = data.get("recipes", [])
        email = data.get("email", None)

        if not meals:
            return jsonify({"error": "No recipes provided"}), 400

        all_ingredients = []

        for meal_info in meals:
            recipe_id = meal_info.get("recipe_id")
            target_persons = meal_info.get("target_persons", 4)
            
            if recipe_id is None:
                continue

            recipe = Recipe.query.get(recipe_id)
            if not recipe:
                print(f"Recipe with ID {recipe_id} not found, skipping")
                continue
            
            #per meal scaling
            multiplier = target_persons / recipe.servings if recipe.servings else 1
            BASIC_INGREDIENTS = {"wasser", "salz", "pfeffer", "gewuerze", "zimt", "vanille"}
            
            for ing in recipe.ingredients:
                name = ing["name"].strip().lower()
                if name in BASIC_INGREDIENTS:
                    continue # skip basic items
            
                adjusted = {
                    "name": ing["name"],
                    "amount": ing["amount"] * multiplier,
                    "unit": ing["unit"]
                }
                all_ingredients.append(adjusted)

        # Group ingredients by name + unit
        summarized = {}
        for ing in all_ingredients:
            key = (ing["name"].lower(), ing["unit"])
            if key not in summarized:
                summarized[key] = {"amount": ing["amount"], "original_name": ing["name"].strip()}
            else:
                summarized[key]["amount"] += ing["amount"]

        # Format list (with omission of basics, rounding to integer/1st decimal)
        shopping_list = []
        
        for (lower_name, unit), item_data in summarized.items():
            amount = item_data["amount"]
            if amount >= 1:
                rounded_amount = int(round(amount))
            else:
                rounded_amount = round(amount, 1)  # Keep 1 decimal for small amounts
            
            shopping_list.append({
                "name": item_data["original_name"], 
                "amount": rounded_amount, 
                "unit": unit
            })

        print(f"Generated shopping list with {len(shopping_list)} items")  # Debug log

        # Optionally send email
        if email:
            send_email_to_user(email, shopping_list)

        return jsonify({"shopping_list": shopping_list}), 200

    except Exception as e:
        print(f"Error generating shopping list: {e}")
        return jsonify({"error": "Server error"}), 500
    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
