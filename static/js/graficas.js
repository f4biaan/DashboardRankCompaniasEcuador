document.addEventListener('DOMContentLoaded', function () {
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

    fetch('/plot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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

    updateTopCompanies(selectedProvincia, selectedRegion, selectedTipoCompania, selectedTamano, selectedSector);
    updateAggregateData(selectedRegion, selectedProvincia, selectedTipoCompania, selectedTamano, selectedSector);

  }

  function updateTopCompanies(proviceS, regioS, tipoCompaniaS, tamanoS, sectorS) {
    // console.log(regioS, proviceS, tipoCompaniaS, tamanoS, sectorS);
    console.log('provincia: ' + proviceS + ' region: ' + regioS + ' tipo_compania: ' + tipoCompaniaS + ' tamano: ' + tamanoS + ' sector: ' + sectorS + '');
    fetch('/update_top', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provincia: proviceS,
        region: regioS,
        tipo_compania: tipoCompaniaS,
        tamano: tamanoS,
        sector: sectorS
      })
    })
      .then(response => response.json())
      .then(data => {
        const topCompanies = data.top_companies;
        const latestYear = data.latest_year;

        console.log(data);

        const topCompaniesList = document.getElementById('top_companies_list');
        topCompaniesList.innerHTML = '';

        // Función para formatear los números como moneda
        const formatCurrency = (value) => {
          return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
        };

        topCompanies.forEach((company, index) => {
          topCompaniesList.innerHTML += `
            <div class="company-card" onmouseover="showBubbleChat(event, ${JSON.stringify(company)})" onmouseout="hideBubbleChat()">
            <span class="index">${index + 1}</span>
            <div class="company-info">
              <h3>${company.Nombre}</h3>
              <p>Ingresos: ${formatCurrency(company.Ingreso_por_ventas)}</p>
            </div>
          </div>`;
        });

        document.getElementById('latest_year').innerText = latestYear;
      });
  }


  function updateAggregateData(regioS, proviceS, tipoCompaniaS, tamanoS, sectorS) {
    fetch('/aggregate_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provincia: proviceS,
        region: regioS,
        tipo_compania: tipoCompaniaS,
        tamano: tamanoS,
        sector: sectorS
      })
    })
      .then(response => response.json())
      .then(data => {
        const aggregateDataCards = document.getElementById('aggregate_data_cards');

        const totalCompanies = data.total_companies;
        const totalRevenue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.total_revenue / totalCompanies);
        const totalEquity = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.total_equity / totalCompanies);
        const active = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.active / totalCompanies);

        aggregateDataCards.innerHTML = `
          <div class="card">
            <h2>Total de Compañías</h2>
            <p>${totalCompanies}</p>
          </div>
          <div class="card">
            <h2>Ingresos por Ventas Promedio</h2>
            <p>${totalRevenue}</p>
          </div>
          <div class="card">
            <h2>Patrimonio Promedio</h2>
            <p>${totalEquity}</p>
          </div>
          <div class="card">
            <h2>Activo Promedio</h2>
            <p>${active}</p>
          </div>
        `;
      });
  }



  // Actualizar las variables de provincia y región cuando se seleccionan
  provinciasSelect.addEventListener('change', function (event) {
    selectedProvincia = event.target.value;
    updateTopCompanies(provinciasSelect.value, regionesSelect.value, tipoCompaniaSelect.value, tamanoSelect.value, sectorSelect.value);
    updateAggregateData(regionesSelect.value, provinciasSelect.value, tipoCompaniaSelect.value, tamanoSelect.value, sectorSelect.value);
    updatePlot();
  });

  regionesSelect.addEventListener('change', function (event) {
    selectedRegion = event.target.value;
    updateTopCompanies(provinciasSelect.value, regionesSelect.value, tipoCompaniaSelect.value, tamanoSelect.value, sectorSelect.value);
    updateAggregateData(regionesSelect.value, provinciasSelect.value, tipoCompaniaSelect.value, tamanoSelect.value, sectorSelect.value);
    updatePlot();
  });

  // tipoCompaniaSelect.addEventListener('change', updatePlot);
  // tamanoSelect.addEventListener('change', updatePlot);
  // sectorSelect.addEventListener('change', updatePlot);

  // tipoCompaniaSelect.addEventListener('change', updateLinePlot);
  // tamanoSelect.addEventListener('change', updateLinePlot);
  // sectorSelect.addEventListener('change', updateLinePlot);

  tipoCompaniaSelect.addEventListener('change', function () {
    updatePlot();
    updateTopCompanies(provinciasSelect.value, regionesSelect.value, tipoCompaniaSelect.value, tamanoSelect.value, sectorSelect.value);
    updateAggregateData(regionesSelect.value, provinciasSelect.value, tipoCompaniaSelect.value, tamanoSelect.value, sectorSelect.value);
  });

  tamanoSelect.addEventListener('change', function () {
    updatePlot();
    updateTopCompanies(provinciasSelect.value, regionesSelect.value, tipoCompaniaSelect.value, tamanoSelect.value, sectorSelect.value);
    updateAggregateData(regionesSelect.value, provinciasSelect.value, tipoCompaniaSelect.value, tamanoSelect.value, sectorSelect.value);
  });

  sectorSelect.addEventListener('change', function () {
    updatePlot();
    updateTopCompanies(provinciasSelect.value, regionesSelect.value, tipoCompaniaSelect.value, tamanoSelect.value, sectorSelect.value);
    updateAggregateData(regionesSelect.value, provinciasSelect.value, tipoCompaniaSelect.value, tamanoSelect.value, sectorSelect.value);
  });


  resetBtn.addEventListener('click', function () {
    provinciasSelect.value = 'reset';
    regionesSelect.value = 'reset';
    tipoCompaniaSelect.value = 'all';
    tamanoSelect.value = 'all';
    sectorSelect.value = 'all';

    selectedProvincia = 'reset';
    selectedRegion = 'reset';

    updatePlot();


    updateTopCompanies('reset', 'reset', 'all', 'all', 'all');
    updateAggregateData('reset', 'reset', 'all', 'all', 'all');
  });

  // Inicializar el gráfico al cargar la página
  updatePlot();
  updateTopCompanies('reset', 'reset', 'all', 'all', 'all');
  updateAggregateData('reset', 'reset', 'all', 'all', 'all');
});
