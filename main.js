import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
document.getElementById("Switch").addEventListener("click",function(){
    var SwitchOn = document.getElementById("Switch-on");
    var SwitchOff = document.getElementById("Switch-off");
    if (SwitchOn.style.display === "block") {
      SwitchOn.style.display = "none";
      SwitchOff.style.display = "block";
    } else {
      SwitchOn.style.display = "block";
      SwitchOff.style.display = "none";
    }
    var openlayersMapContainer = document.getElementById("map");
    var cesiumContainer = document.getElementById("cesiumContainer");
    if (openlayersMapContainer.style.display === "block") {
      openlayersMapContainer.style.display = "none";
      cesiumContainer.style.display = "block";
    } else {
      openlayersMapContainer.style.display = "block";
      cesiumContainer.style.display = "none";
    }
  
})


const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: 'maroc.geojson',
      }),
    }),
  ],
  view: new View({
    center: ol.proj.fromLonLat([-10, 30]),
    zoom: 5
  })
});
var layersList = document.getElementById("layersList");
var layerIndex = 0;
var activeLayer;

var addLayerButton = document.getElementById("addLayerButton");

addLayerButton.addEventListener("click", function () {
  map.removeInteraction(draw);
  document.getElementById("p").style.display = "none";
  var layerName =
    document.getElementById("layerName").value || "Layer " + ++layerIndex;
  var layer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(255, 255, 255, 0.2)",
      }),
      stroke: new ol.style.Stroke({
        color: "#ffcc33",
        width: 2,
      }),
    }),
  });
  map.addLayer(layer);
  var layerListItem = document.createElement("div");
  var layerRadio = document.createElement("input");
  layerRadio.setAttribute("type", "radio");
  layerRadio.setAttribute("name", "layers");
  layerRadio.setAttribute("value", layerName);
  layerRadio.addEventListener("click", function () {
    map.removeInteraction(draw);
    activeLayer = layer;
  });
  layerListItem.appendChild(layerRadio);
  var layerLabel = document.createElement("label");
  layerLabel.textContent = layerName;
  layerListItem.appendChild(layerLabel);
  var layerCheckbox = document.createElement("input");
  layerCheckbox.setAttribute("type", "checkbox");
  layerCheckbox.checked = true;
  layerCheckbox.addEventListener("change", function () {
    layer.setVisible(this.checked);
  });
  layerListItem.appendChild(layerCheckbox);
  layersList.appendChild(layerListItem);
  activeLayer = layer;
  layerRadio.checked = true;

  const removeLayerButton = document.getElementById("remove-layer-btn");
  removeLayerButton.addEventListener("click", function () {
    activeLayer = layer;
    if (layerRadio.checked === true) {
      const selectedLayerName = layerName;
      map.removeLayer(layersList[selectedLayerName]);
      delete layersList[selectedLayerName];
      layerListItem.remove();
    }
  });
});
// code to remove selected layer //

var draw,modify;
var addPolygonButton = document.getElementById("addPolygonButton");
addPolygonButton.addEventListener("click", function () {
  map.removeInteraction(draw);
  draw = new ol.interaction.Draw({
    source: activeLayer.getSource(),
    type: "Polygon",
  });
  draw.on("drawend", function (event) {
    var feature = event.feature;
    feature.setId(uniqueId++);
    map.on("click", function (event) {
      map.forEachFeatureAtPixel(event.pixel, function (feature) {
        if (selectedFeature) {
          // unselect previously selected feature
          selectedFeature.setStyle(undefined);
        }
        selectedFeature = feature;
        // highlight the selected feature
        feature.setStyle(
          new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: "blue",
              width: 2,
            }),
            fill: new ol.style.Fill({
              color: "rgba(0, 0, 255, 0.1)",
            }),
          })
        );
      });
    });
  });
  map.addInteraction(draw);
});

var modifyPolygonButton = document.getElementById('modifyPolygonButton');
modifyPolygonButton.addEventListener('click', function() {
  map.removeInteraction(draw);
  map.removeInteraction(modify);
  modify = new ol.interaction.Modify({
    source: activeLayer.getSource()
  });
  if (selectedFeature) {
  map.addInteraction(modify);
  }
});
var activeLayer = map.getLayers().item(0);
document.getElementById("stopDrawBtn").addEventListener("click", function () {
  // remove the drawing interaction from the map
  map.removeInteraction(draw);
  map.removeInteraction(modify);
});
var selectedFeature;
var uniqueId = 0;


document.getElementById("removeBtn").addEventListener("click", function () {
  if (selectedFeature) {
    // remove the selected feature from the vector source
    activeLayer.getSource().removeFeature(selectedFeature);
    selectedFeature = null;
  }
});


Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNWQ0NGIwOS1hZTAyLTQ3ZWItOWRkNC03MmM1YjhiNzRlODIiLCJpZCI6MTI4NDg1LCJpYXQiOjE2Nzg3MDE4Mzh9.zJ44atMh1O4bUYwmRm0iK7dNORRYEUNxQRpdFo6Yh_c";

const viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain()
  });
    // Add Cesium OSM Buildings.
const buildingsTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());
    

var geojsonSourceCesium = new Cesium.GeoJsonDataSource();
geojsonSourceCesium.load("maroc.geojson");
viewer.dataSources.add(geojsonSourceCesium);
viewer.zoomTo(geojsonSourceCesium);