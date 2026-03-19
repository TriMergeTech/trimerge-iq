import os
from datetime import datetime
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flasgger import Swagger # 1. Import Swagger

app = Flask(__name__)
swagger = Swagger(app) # 2. Initialize Swagger

# ---------------------------------------------------------
# GET /api/search
# ---------------------------------------------------------
@app.route('/api/search', methods=['GET'])
def search():
    """
    AI Search Endpoint
    ---
    parameters:
      - name: query
        in: query
        type: string
        required: false
        default: 'general'
    responses:
      200:
        description: Returns mock AI search results
    """
    query = request.args.get('query', '')
    print(f"[AI Engine] Search requested for: '{query}'")
    mock_result = f"Here is the AI knowledge base result for your query: {query}"
    return jsonify({"result": mock_result}), 200

# ---------------------------------------------------------
# POST /api/chat
# ---------------------------------------------------------
@app.route('/api/chat', methods=['POST'])
def chat():
    """
    AI Chat Endpoint
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            prompt:
              type: string
              example: "Hello AI"
    responses:
      200:
        description: Returns a mock AI reply
    """
    data = request.get_json() or {}
    prompt = data.get('prompt', '')
    print(f"[AI Engine] Chat prompt received: '{prompt}'")
    mock_reply = f"I am a Mock AI. You said: '{prompt}'"
    return jsonify({"reply": mock_reply}), 200

# ---------------------------------------------------------
# POST /api/upload
# ---------------------------------------------------------
@app.route('/api/upload', methods=['POST'])
def upload():
    """
    File Upload Endpoint
    ---
    parameters:
      - name: file
        in: formData
        type: file
        required: true
    responses:
      200:
        description: File received successfully
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0) 
    print(f"[AI Engine] Successfully received file: {secure_filename(file.filename)} ({file_size} bytes)")
    return jsonify({"message": "File processed successfully", "filename": file.filename, "size": file_size}), 200

# ---------------------------------------------------------
# GET /api/engine-check 
# ---------------------------------------------------------
@app.route('/api/engine-check', methods=['GET'])
def engine_check():
    """
    System Health Check
    ---
    responses:
      200:
        description: System is online
    """
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[AI Engine] System health check performed at {now}")
    return jsonify({
        "status": "online",
        "service": "AI-Engine-Brain",
        "last_ping": now,
        "message": "Neural circuits are fully operational."
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)