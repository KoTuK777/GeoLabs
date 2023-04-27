from flask import Flask, jsonify
import json

app = Flask(__name__)
	
@app.route('/')
def hello():
  return 'Hello, World!'

@app.route('/get_json/<string:filename>', methods=['GET'])
def get_json(filename):
  try:
    with open(filename + '.json', 'r') as file:
      json_data = file.read()
      return jsonify(json_data)
  except FileNotFoundError:
    return jsonify({'error': 'File not found'})

@app.route('/field/<string:field_name>', methods=['GET'])
def get_field(field_name):
  json_data = json.loads(get_json('..\Lab_06\datasets\output_dataset').get_json())

  if ('error' in json_data):
    return json_data
  
  found_object = next((obj for obj in json_data if obj["properties"]["name"] == field_name), None)
  
  if (not found_object):
    return jsonify({'message': 'Field not found.'})
  
  return found_object

if __name__ == '__main__':
  app.run(debug=True)
