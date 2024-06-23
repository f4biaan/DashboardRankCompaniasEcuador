document.addEventListener('DOMContentLoaded', function() {
  const provinciasSelect = document.getElementById('provincias-select');
  const regionesSelect = document.getElementById('regiones-select');
  const tipoCompaniaSelect = document.getElementById('tipo-compania-select');
  const tamanoSelect = document.getElementById('tamano-select');
  const sectorSelect = document.getElementById('sector-select');
  const resetBtn = document.getElementById('reset-btn');

  // Variables para mantener el estado actual de los filtros
  let selectedProvincia = 'reset';
  let selectedRegion = 'reset';

  function updatePlot() {
      const selectedTipoCompania = tipoCompaniaSelect.value;
      const selectedTamano = tamanoSelect.value;
      const selectedSector = sectorSelect.value;

      console.log(selectedProvincia, selectedRegion, selectedTipoCompania, selectedTamano, selectedSector);

      fetch('/plot', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              x: 'Activo', // Cambia esto al nombre de tu columna x
              y: 'Patrimonio', // Cambia esto al nombre de tu columna y
              provincia: selectedProvincia,
              region: selectedRegion,
              tipo_compania: selectedTipoCompania,
              tamano: selectedTamano,
              sector: selectedSector
          })
      })
      .then(response => response.json())
      .then(data => {
          const plotDiv = document.getElementById('plot');
          Plotly.react(plotDiv, data.data, data.layout, {
              mode: 'animate',
              transition: {
                  easing: 'ease-in-out'
              }
          });
      });
  }

  // Actualizar las variables de provincia y región cuando se seleccionan
  provinciasSelect.addEventListener('change', function(event) {
      selectedProvincia = event.target.value;
      updatePlot();
  });

  regionesSelect.addEventListener('change', function(event) {
      selectedRegion = event.target.value;
      updatePlot();
  });

  tipoCompaniaSelect.addEventListener('change', updatePlot);
  tamanoSelect.addEventListener('change', updatePlot);
  sectorSelect.addEventListener('change', updatePlot);

  resetBtn.addEventListener('click', function() {
      provinciasSelect.value = 'reset';
      regionesSelect.value = 'reset';
      tipoCompaniaSelect.value = 'varias';
      tamanoSelect.value = 'varias';
      sectorSelect.value = 'varias';

      selectedProvincia = 'reset';
      selectedRegion = 'reset';

      updatePlot();
  });

  // Inicializar el gráfico al cargar la página
  updatePlot();
});
