from firebase_functions import https_fn
from firebase_admin import initialize_app, auth
import json
import os
import google.generativeai as genai
import requests

# Initialize the Firebase App
initialize_app()

# 🔑 Configure Gemini using the Environment Variable we set in Google Cloud
api_key = os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

@https_fn.on_request()
def gateway_api(req: https_fn.Request) -> https_fn.Response:
    # Handle CORS (Essential for your React Dashboard to connect)
    if req.method == "OPTIONS":
        return https_fn.Response(status=204, headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
        })

    try:
        # Get data from your Dashboard
        data = req.get_json()
        user_prompt = data.get("prompt", "Please analyze this input.")
        
        # Call Gemini AI
        response = model.generate_content(user_prompt)
        
        return https_fn.Response(
            json.dumps({"answer": response.text}),
            status=200,
            headers={
                "Content-Type": "application/json", 
                "Access-Control-Allow-Origin": "*"
            }
        )

@https_fn.on_request()
def signup(req: https_fn.Request) -> https_fn.Response:
    # Handle CORS
    if req.method == "OPTIONS":
        return https_fn.Response(status=204, headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
        })

    try:
        data = req.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return https_fn.Response(
                json.dumps({"error": "Email and password are required"}),
                status=400,
                headers={
                    "Content-Type": "application/json", 
                    "Access-Control-Allow-Origin": "*"
                }
            )

        # Create user in Firebase Auth
        user = auth.create_user(email=email, password=password)

        return https_fn.Response(
            json.dumps({
                "message": "User created successfully", 
                "uid": user.uid, 
                "email": user.email
            }),
            status=201,
            headers={
                "Content-Type": "application/json", 
                "Access-Control-Allow-Origin": "*"
            }
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers={
                "Content-Type": "application/json", 
                "Access-Control-Allow-Origin": "*"
            }
        )

@https_fn.on_request()
def login(req: https_fn.Request) -> https_fn.Response:
    # Handle CORS
    if req.method == "OPTIONS":
        return https_fn.Response(status=204, headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
        })

    try:
        data = req.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return https_fn.Response(
                json.dumps({"error": "Email and password are required"}),
                status=400,
                headers={
                    "Content-Type": "application/json", 
                    "Access-Control-Allow-Origin": "*"
                }
            )

        # Use Identity Toolkit REST API for login
        # Fallback to GOOGLE_API_KEY if FIREBASE_API_KEY isn't specifically set
        api_key = os.environ.get("FIREBASE_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
        
        payload = {
            "email": email, 
            "password": password, 
            "returnSecureToken": True
        }
        
        response = requests.post(url, json=payload)
        response_data = response.json()
        
        if "error" in response_data:
            return https_fn.Response(
                json.dumps({"error": response_data["error"]["message"]}),
                status=401,
                headers={
                    "Content-Type": "application/json", 
                    "Access-Control-Allow-Origin": "*"
                }
            )

        return https_fn.Response(
            json.dumps({
                "message": "Login successful", 
                "idToken": response_data["idToken"], 
                "uid": response_data["localId"],
                "email": response_data["email"]
            }),
            status=200,
            headers={
                "Content-Type": "application/json", 
                "Access-Control-Allow-Origin": "*"
            }
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers={
                "Content-Type": "application/json", 
                "Access-Control-Allow-Origin": "*"
            }
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers={
                "Content-Type": "application/json", 
                "Access-Control-Allow-Origin": "*"
            }
        )