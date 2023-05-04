from flask import Flask, jsonify, request
import numpy as np
import rasterio
import geopandas as gpd
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


file_path = '.\soil_moisture.tif'
with rasterio.open(file_path) as src:
  bbox = src.bounds

@app.route('/get_image_bbox')
@cross_origin()
def get_image_bbox():
  return jsonify({
      'lat_max': bbox.top,
      'lat_min': bbox.bottom,
      'lon_max': bbox.right,
      'lon_min': bbox.left
  })

@app.route('/get_moisture_value', methods=['GET'])
@cross_origin()
def get_moisture_value():
  lat = request.args.get('lat', type=float)
  lon = request.args.get('lon', type=float)

  if (
    lat < bbox.bottom or 
    lat > bbox.top or 
    lon < bbox.left or 
    lon > bbox.right):
    return jsonify({'moisture': 'no data'})

  with rasterio.open(file_path) as src:
    row, col = src.index(lon, lat)
    moisture = src.read(1)[row, col]
    
  return jsonify({'moisture': int(moisture)})

if __name__ == '__main__':
  app.run(debug=True)
