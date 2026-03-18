import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)

# ---------------------------------------------------------
# GET /api/search
# ---------------------------------------------------------
@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('query', '')
    print(f"[AI Engine] Search requested for: '{query}'")
    
    # Mock AI Logic (Replace with actual RAG or DB query later)
    mock_result = f"Here is the AI knowledge base result for your query: {query}"
    
    return jsonify({"result": mock_result}), 200

# ---------------------------------------------------------
# POST /api/chat
# ---------------------------------------------------------
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    prompt = data.get('prompt', '')
    print(f"[AI Engine] Chat prompt received: '{prompt}'")
    
    # Mock AI Logic (Replace with OpenAI API call later)
    mock_reply = f"I am a Mock AI. You said: '{prompt}'"
    
    return jsonify({"reply": mock_reply}), 200

# ---------------------------------------------------------
# POST /api/upload
# ---------------------------------------------------------
@app.route('/api/upload', methods=['POST'])
def upload():
    # Check if the post request has the file part
    if 'file' not in request.files:
        print("[AI Engine Error] No file part in request")
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
        
    # Read the file to determine its size in bytes
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0) # Reset file pointer in case you want to read or save it later
    
    # CRUCIAL: Print file name and size to console
    print(f"[AI Engine] Successfully received file: {secure_filename(file.filename)} ({file_size} bytes)")
    
    return jsonify({"message": "File processed successfully", "filename": file.filename, "size": file_size}), 200

if __name__ == '__main__':
    # Run on port 5000 to match the Node.js Gateway proxy config
    app.run(host='0.0.0.0', port=5000, debug=True)