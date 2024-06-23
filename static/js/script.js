document.addEventListener('DOMContentLoaded', function () {
  var map = L.map('map', {
    center: [-1.8312, -78.1834],
    zoom: 6,
    maxBounds: [
      [-6, -90],
      [3, -75]
    ],
    maxBoundsViscosity: 1.0,
    dragging: false,
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    inertia: false
  });

  var selectedLayer = null;
  var layers = [];

  function defaultStyle() {
    return {
      color: 'blue',
      weight: 1,
      fillColor: 'lightblue',
      fillOpacity: 0.5
    };
  }

  function highlightStyle() {
    return {
      color: 'blue',
      weight: 2,
      fillColor: 'lightblue',
      fillOpacity: 0.7
    };
  }

  function selectStyle() {
    return {
      color: 'red',
      weight: 3,
      fillColor: 'orange',
      fillOpacity: 0.7,
    };
  }

  function regionStyle() {
    return {
      color: 'green',
      weight: 2,
      fillColor: 'lightgreen',
      fillOpacity: 0.5
    };
  }

  function isRegionStyle(layer) {
    var currentStyle = layer.options;
    return currentStyle.color === 'green' && currentStyle.fillColor === 'lightgreen';
  }

  fetch('/static/data/ecuador.geojson')
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        style: defaultStyle,
        onEachFeature: function (feature, layer) {
          layer.bindTooltip(feature.properties.nombre, {
            permanent: true,
            direction: 'center',
            className: 'label-tooltip'
          });

          layer.on('mouseover', function (e) {
            if (!isRegionStyle(layer) && selectedLayer !== layer) {
              layer.setStyle(highlightStyle());
            }
          });

          layer.on('mouseout', function (e) {
            if (!isRegionStyle(layer) && selectedLayer !== layer) {
              layer.setStyle(defaultStyle());
            }
          });;

          layer.on('click', function (e) {
            if (selectedLayer === layer) {
              resetSelection();
            } else {
              selectProvince(feature.properties.nombre, layer);
            }
          });

          layers.push(layer);  // Guardamos la referencia a cada layer
        }
      }).addTo(map);
    });

  function selectProvince(provincia, layer) {
    if (selectedLayer) {
      selectedLayer.setStyle(defaultStyle());
      selectedLayer.getTooltip().getElement().classList.remove('label-tooltip-selected');
    }

    selectedLayer = layer;
    layer.setStyle(selectStyle());
    layer.getTooltip().getElement().classList.add('label-tooltip-selected');

    map.fitBounds(layer.getBounds(), {
      padding: [50, 50],
      maxZoom: 10,
      animate: true,
      duration: 1
    });

    var select = document.getElementById('provincias-select');
    var option = select.querySelector('option[value="' + provincia + '"]');
    if (option) {
      select.value = provincia;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    fetch('/select_province', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'province=' + encodeURIComponent(provincia)
    });
  }

  function resetSelection() {
    if (selectedLayer) {
      map.setView([-1.8312, -78.1834], 6);
      selectedLayer.setStyle(defaultStyle());
      selectedLayer.getTooltip().getElement().classList.remove('label-tooltip-selected');
      selectedLayer = null;

      // Restablecer el select y disparar el evento change
      var select = document.getElementById('provincias-select');
      console.log('reset' + select.value);
      select.selectedIndex = 0; // Establece el índice del select a la opción por defecto
      var event = new Event('change', { bubbles: true });
      select.dispatchEvent(event); // Disparar el evento change manualmente


      var regionSelect = document.getElementById('regiones-select');
      console.log('reset' + regionSelect.value);
      regionSelect.selectedIndex = 0;
      var event2 = new Event('change', { bubbles: true });
      regionSelect.dispatchEvent(event2);
    }

    layers.forEach(layer => {
      layer.setStyle(defaultStyle());
    });
  }

  document.getElementById('provincias-select').addEventListener('change', function () {
    var provincia = this.value;
    if (provincia === 'reset') {
      resetSelection();
    } else {
      layers.forEach(layer => {
        if (layer.feature && layer.feature.properties.nombre === provincia) {
          selectProvince(provincia, layer);
        }
      });
    }
  });

  document.getElementById('reset-btn').addEventListener('click', function () {
    resetSelection();
  });

  document.getElementById('regiones-select').addEventListener('change', function () {
    var region = this.value;
    resetSelection();
    if (region === 'reset') {
      resetSelection();
    } else {
      fetch('/select_region', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'region=' + encodeURIComponent(region)
      })
        .then(response => response.json())
        .then(data => {
          var provinciasSelect = document.getElementById('provincias-select');
          provinciasSelect.innerHTML = '<option value="reset">Seleccionar provincia...</option>';
          data.provincias.forEach(function (provincia) {
            var option = document.createElement('option');
            option.value = provincia;
            option.text = provincia;
            provinciasSelect.add(option);

            console.log(provincia);
          });

          // console.log(data.provincias);
          // console.log(layers);
          layers.forEach(layer => {
            if (data.provincias.includes(layer.feature.properties.nombre)) {
              layer.setStyle(regionStyle());
            } else {
              // console.log(layer.feature);
              // console.log(layer.feature.properties.region);
              layer.setStyle(defaultStyle());
            }
          });
        });
    }
  });
});
