document.addEventListener('DOMContentLoaded', function () {
  // var map = L.map('map').setView([-1.8312, -78.1834], 7);
  var map = L.map('map', {
    center: [-1.8312, -78.1834],
    zoom: 6,
    maxBounds: [
      [-6, -90], // suroeste
      [3, -75]   // noreste
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


  /* L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map); */
  /* var blankTileLayer = L.tileLayer('', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map); */

  var selectedLayer = null;

  // Estilo por defecto
  function defaultStyle() {
    return {
      color: 'blue', // color de los bordes
      weight: 1, // grosor de los bordes
      fillColor: 'lightblue', // color de relleno
      fillOpacity: 0.5 // opacidad del relleno
    };
  }

  // Estilo al pasar el ratón
  function highlightStyle() {
    return {
      color: 'blue',
      weight: 2,
      fillColor: 'lightblue',
      fillOpacity: 0.7
    };
  }

  // Estilo al seleccionar
  function selectStyle() {
    return {
      color: 'red',
      weight: 3,
      fillColor: 'orange',
      fillOpacity: 0.7,
    };
  }


  // Cargar el archivo GeoJSON de las provincias de Ecuador
  fetch('/static/data/ecuador.geojson')
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        style: defaultStyle,
        onEachFeature: function (feature, layer) {
          // Agregar la etiqueta con el nombre de la provincia
          layer.bindTooltip(feature.properties.nombre, {
            permanent: true,
            direction: 'center',
            className: 'label-tooltip'
          });

          layer.on('mouseover', function (e) {
            if (selectedLayer !== layer) {
              layer.setStyle(highlightStyle());
            }
          })

          layer.on('mouseout', function (e) {
            if (selectedLayer !== layer) {
              layer.setStyle(defaultStyle());
            }
          });

          // Manejar eventos de clic en las provincias
          layer.on('click', function (e) {
            if (selectedLayer === layer) {
              // Si la capa seleccionada es la misma, deseleccionarla
              resetSelection();
            } else {
              selectProvince(feature.properties.nombre, layer);
            }
          });
        }
      }).addTo(map);
    });

  // Función para manejar la selección de provincia desde el select
  function selectProvince(provincia, layer) {
    // Desseleccionar la capa anterior
    if (selectedLayer) {
      selectedLayer.setStyle(defaultStyle());
      selectedLayer.getTooltip().getElement().classList.remove('label-tooltip-selected');
    }

    // Seleccionar la nueva capa
    selectedLayer = layer;
    layer.setStyle(selectStyle());
    layer.getTooltip().getElement().classList.add('label-tooltip-selected');

    // Hacer zoom en la provincia seleccionada
    map.fitBounds(layer.getBounds(), {
      padding: [50, 50],
      maxZoom: 10,
      animate: true,
      duration: 1
    });

    // Actualizar el select con la provincia seleccionada
    var select = document.getElementById('provincias-select');
    // console.log(select, provincia);
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === provincia) {
        select.selectedIndex = i;
        break;
      }
    }

    // Enviar selección al servidor
    fetch('/select_province', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'province=' + encodeURIComponent(provincia)
    });
  }

  // Función para resetear la selección
  function resetSelection() {
    if (selectedLayer) {
      selectedLayer.setStyle(defaultStyle());
      selectedLayer.getTooltip().getElement().classList.remove('label-tooltip-selected');
      selectedLayer = null;
      map.setView([-1.8312, -78.1834], 6); // Restablecer el zoom
      document.getElementById('provincias-select').selectedIndex = 0; // Restablecer el select
    }
  }

  // Manejar el cambio en el select de provincias
  document.getElementById('provincias-select').addEventListener('change', function () {
    var provincia = this.value;
    // console.log(provincia);
    if (provincia === 'reset') {
      resetSelection();
    } else if (provincia === 'todas') {
      map.fitBounds(dataLayer.getBounds(), {
        padding: [50, 50],
        maxZoom: 10,
        animate: true,
        duration: 1
      });
    } else {
      // Encontrar la capa de la provincia seleccionada
      // console.log(layer);
      map.eachLayer(function (layer) {
        if (layer.feature && layer.feature.properties.nombre === provincia) {
          selectProvince(provincia, layer);
        }
      });
    }
  });

  // Manejar el botón de reset
  document.getElementById('reset-btn').addEventListener('click', function () {
    resetSelection();
  });
});
