from flask import Flask, jsonify, send_from_directory
from src.simulation import Simulazione

app = Flask(__name__, static_folder='static')
simulazione = Simulazione()

@app.route('/api/stato', methods=['GET'])
def get_stato():
    return jsonify(simulazione.get_stato())

@app.route('/api/avanza_turno', methods=['POST'])
def avanza_turno():
    simulazione.avanza_turno()
    return jsonify(simulazione.get_stato())

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
