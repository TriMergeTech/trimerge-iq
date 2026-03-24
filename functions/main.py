import json
import os
import requests
from firebase_admin import auth, firestore, initialize_app
from firebase_functions import https_fn
from google import genai

# Move initialization into a simple check to prevent deployment timeouts
try:
    initialize_app()
except Exception:
    pass

@https_fn.on_request()
def docs(req: https_fn.Request) -> https_fn.Response:
    """Serves the updated Swagger UI for IME project"""
    swagger_spec = {
        "openapi": "3.0.0",
        "info": {
            "title": "API Gateway",
            "version": "1.1.0",
            "description": "API for Gemini AI, User Signup, and Login"
        },
        "servers": [
            {"url": "https://signup-37bjhplwta-uc.a.run.app", "description": "Production Signup"},
            {"url": "https://login-37bjhplwta-uc.a.run.app", "description": "Production Login"},
            {"url": "https://gateway-api-37bjhplwta-uc.a.run.app", "description": "Production AI Gateway"},
            {"url": "https://forgot-password-37bjhplwta-uc.a.run.app", "description": "Production Password Reset"}
        ],
        "paths": {
            "/gateway_api": {
                "post": {
                    "summary": "Gemini AI Prompt",
                    "requestBody": {
                        "content": { "application/json": { "schema": { "type": "object", "properties": { "prompt": { "type": "string" } } } } }
                    },
                    "responses": { "200": { "description": "Success" } }
                }
            },
            "/signup": {
                "post": {
                    "summary": "User Signup (Create Account)",
                    "requestBody": {
                        "content": { "application/json": { "schema": { "type": "object", "properties": { 
                            "fullName": { "type": "string" },
                            "email": { "type": "string" }, 
                            "password": { "type": "string" },
                            "confirmPassword": { "type": "string" }
                        } } } }
                    },
                    "responses": {"201": {"description": "Created"}}
                }
            },
            "/login": {
                "post": {
                    "summary": "User Login",
                    "requestBody": {
                        "content": { "application/json": { "schema": { "type": "object", "properties": { "email": { "type": "string" }, "password": { "type": "string" } } } } }
                    },
                    "responses": {"200": {"description": "OK"}}
                }
            },
            "/forgot_password": {
                "post": {
                    "summary": "Forgot Password (Reset Email)",
                    "requestBody": {
                        "content": { "application/json": { "schema": { "type": "object", "properties": { "email": { "type": "string" } } } } }
                    },
                    "responses": {"200": {"description": "OK"}}
                }
            }
        }
    }

    swagger_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>API Gateway Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {{
          window.ui = SwaggerUIBundle({{
            spec: {json.dumps(swagger_spec)},
            dom_id: '#swagger-ui',
            deepLinking: true
          }});
        }};
      </script>
    </body>
    </html>
    """
    return https_fn.Response(swagger_html, status=200, headers={"Content-Type": "text/html", "Access-Control-Allow-Origin": "*"})

@https_fn.on_request()
def gateway_api(req: https_fn.Request) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response(status=204, headers={"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type"})
    try:
        data = req.get_json()
        user_prompt = data.get("prompt", "Please analyze this input.")
        
        gemini_api_key = os.environ.get("GEMINI_API_KEY")
        client = genai.Client(api_key=gemini_api_key)
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=user_prompt
        )
        return https_fn.Response(json.dumps({"answer": response.text}), status=200, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})

@https_fn.on_request()
def signup(req: https_fn.Request) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response(status=204, headers={"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type"})
    try:
        # Initialize the DB client locally so it doesn't hang the deployment
        db = firestore.client()
        
        data = req.get_json()
        full_name = data.get("fullName")
        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirmPassword")

        if not all([full_name, email, password, confirm_password]):
            return https_fn.Response(json.dumps({"error": "fullName, email, password, and confirmPassword are required"}), status=400, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})
        
        if password != confirm_password:
            return https_fn.Response(json.dumps({"error": "Passwords do not match"}), status=400, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})

        # 1. Create User in Firebase Auth
        user_record = auth.create_user(email=email, password=password, display_name=full_name)
        
        # 2. Create User Profile in Firestore
        user_data = {
            "uid": user_record.uid,
            "fullName": full_name,
            "email": email,
            "createdAt": firestore.SERVER_TIMESTAMP,
            "role": "user" # Default role
        }
        db.collection("users").document(user_record.uid).set(user_data)

        return https_fn.Response(json.dumps({"message": "User created successfully", "uid": user_record.uid, "email": user_record.email}), status=201, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})

@https_fn.on_request()
def login(req: https_fn.Request) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response(status=204, headers={"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type"})
    try:
        firebase_config = {
            "apiKey": "REPLACED_BY_ENV_VAR",
            "authDomain": "trimerge-app.firebaseapp.com",
            "projectId": "trimerge-app",
            "storageBucket": "trimerge-app.appspot.com",
        }
        data = req.get_json()
        email, password = data.get("email"), data.get("password")
        api_key = firebase_config["apiKey"]
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
        payload = {"email": email, "password": password, "returnSecureToken": True}
        response = requests.post(url, json=payload)
        res_data = response.json()
        if "error" in res_data:
            return https_fn.Response(json.dumps({"error": res_data["error"]["message"]}), status=401, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})
        return https_fn.Response(json.dumps({"idToken": res_data["idToken"], "uid": res_data["localId"], "email": res_data["email"]}), status=200, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})

@https_fn.on_request()
def forgot_password(req: https_fn.Request) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response(status=204, headers={"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type"})
    try:
        firebase_config = {
            "apiKey": "REPLACED_BY_ENV_VAR",
            "authDomain": "trimerge-app.firebaseapp.com",
            "projectId": "trimerge-app",
            "storageBucket": "trimerge-app.appspot.com",
        }
        data = req.get_json()
        email = data.get("email")
        api_key = firebase_config["apiKey"]
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={api_key}"
        payload = {"requestType": "PASSWORD_RESET", "email": email}
        response = requests.post(url, json=payload)
        res_data = response.json()
        if "error" in res_data:
            return https_fn.Response(json.dumps({"error": res_data["error"]["message"]}), status=401, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})
        return https_fn.Response(json.dumps({"message": "Password reset email sent"}), status=200, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})