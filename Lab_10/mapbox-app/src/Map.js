import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "./Map.css";
import axios from 'axios'
import { fromUrl } from 'geotiff';

mapboxgl.accessToken = 'pk.eyJ1Ijoia290dWs3NzciLCJhIjoiY2xoNnA0ZWhjMDgzZjNnbm9xYzlsNDE2YSJ9.wgVp5GQjgtcmZfRQusjTww';
const tifFile = `${process.env.PUBLIC_URL}/soil_moisture.tif`

const Map = () => {
  const mapContainerRef = useRef(null);
  

  useEffect(() => {
    async function fetchMyAPI() {
    
      let centerLon, centerLat;
      const tiff = await fromUrl(tifFile);
      const image = await tiff.getImage();
      const bbox = image.getBoundingBox();
      const [lonMin, latMin, lonMax, latMax] = bbox;

      centerLon = (lonMin + lonMax) / 2;
      centerLat = (latMin + latMax) / 2;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [centerLon, centerLat],
        zoom: 8,
      });

      const popup = new mapboxgl.Popup();

      const marker = new mapboxgl.Marker()
        .setLngLat([centerLon, centerLat])
        .setPopup(popup)
        .addTo(map);

      const handleClick = async (lng, lat) => {
        marker.setLngLat([lng, lat]);

        try {
          const res = await axios.get(`http://localhost:5000/get_moisture_value?lat=${lat}&lon=${lng}`);

          popup 
            .setText(`Вологість(${lng}, ${lat}): ${res.data.moisture}`)
            .addTo(map);
        } catch (err) {
          console.error(err)
        }
      }
      
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.on('click', async (e) => {
        const lng = e.lngLat.lng.toFixed(4);
        const lat = e.lngLat.lat.toFixed(4);

        await handleClick(lng, lat);
      });
        
      return () => map.remove();
    }

    fetchMyAPI()
  }, []);

  return <div className="map-container" ref={mapContainerRef} />;
};

export default Map;
