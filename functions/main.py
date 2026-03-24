from firebase_functions import https_fn
from firebase_admin import initialize_app, auth
import json
import os
import google.generativeai as genai
import requests

# Initialize the Firebase App
initialize_app()

# 🔑 Configure Gemini
api_key = os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

@https_fn.on_request()
def docs(req: https_fn.Request) -> https_fn.Response:
    """Serves the Swagger UI for IME project"""
    swagger_html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>IME API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: 'https://raw.githubusercontent.com/juana/gateway-api/feat/juan/swagger.json',
            dom_id: '#swagger-ui',
          });
        };
      </script>
    </body>
    </html>
    """
    return https_fn.Response(swagger_html, status=200, headers={"Content-Type": "text/html"})

@https_fn.on_request()
def gateway_api(req: https_fn.Request) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response(status=204, headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
        })

    try:
        data = req.get_json()
        user_prompt = data.get("prompt", "Please analyze this input.")
        response = model.generate_content(user_prompt)
        
        return https_fn.Response(
            json.dumps({"answer": response.text}),
            status=200,
            headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}
        )
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})

@https_fn.on_request()
def signup(req: https_fn.Request) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response(status=204, headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
        })

    try:
        data = req.get_json()
        email, password = data.get("email"), data.get("password")
        if not email or not password:
            return https_fn.Response(json.dumps({"error": "Email and password are required"}), status=400, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})

        user = auth.create_user(email=email, password=password)
        return https_fn.Response(json.dumps({"message": "User created successfully", "uid": user.uid, "email": user.email}), status=201, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})

@https_fn.on_request()
def login(req: https_fn.Request) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response(status=204, headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
        })

    try:
        data = req.get_json()
        email, password = data.get("email"), data.get("password")
        if not email or not password:
            return https_fn.Response(json.dumps({"error": "Email and password are required"}), status=400, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})

        api_key = os.environ.get("FIREBASE_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
        payload = {"email": email, "password": password, "returnSecureToken": True}
        
        response = requests.post(url, json=payload)
        response_data = response.json()
        
        if "error" in response_data:
            return https_fn.Response(json.dumps({"error": response_data["error"]["message"]}), status=401, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})

        return https_fn.Response(json.dumps({"message": "Login successful", "idToken": response_data["idToken"], "uid": response_data["localId"], "email": response_data["email"]}), status=200, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})
    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})