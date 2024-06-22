// document.addEventListener('DOMContentLoaded', function () {
//   // Define una función para actualizar el gráfico
//   function updatePlot(region, provincia) {
//     const x = 'Activo';
//     const y = 'Patrimonio';

//     fetch('/plot', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ x: x, y: y, provincia: provincia, region: region }),
//     })
//       .then(response => response.json())
//       .then(data => {
//         const plotDiv = document.getElementById('plot');
//         Plotly.react(plotDiv, data.data, data.layout, {
//           mode: 'animate',
//           transition: {
//             easing: 'ease-in-out'
//           }
//         });
//       });
//   }

//   // Inicializa el gráfico con valores predeterminados
//   updatePlot('reset', 'reset');

//   // Añadir event listener al select de provincias
//   const provinciaSelect = document.getElementById('provincias-select');
//   provinciaSelect.addEventListener('change', function () {
//     console.log('Cambio en el select: ', provinciaSelect.value);
//     const provincia = provinciaSelect.value;
//     const region = document.getElementById('regiones-select').value;
//     updatePlot(region, provincia);
//   });

//   const regionSelect = document.getElementById('regiones-select');
//   regionSelect.addEventListener('change', function () {
//     const region = regionSelect.value;
//     updatePlot(region, 'reset');
//   });

//   // Observar cambios en el select usando MutationObserver
//   const observer = new MutationObserver(function () {
//     const provincia = provinciaSelect.value;
//     const region = document.getElementById('regiones-select').value;
//     updatePlot(region, provincia);
//   });

//   // Observar cambios en el select
//   observer.observe(provinciaSelect, { attributes: true, childList: true, subtree: true });
// });


document.addEventListener('DOMContentLoaded', function () {
  // Define una función para actualizar el gráfico
  function updatePlot(region, provincia) {
    const x = 'Activo';
    const y = 'Patrimonio';

    fetch('/plot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ x: x, y: y, provincia: provincia, region: region }),
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

  // Inicializa el gráfico con valores predeterminados
  updatePlot('reset', 'reset');

  // Añadir event listener al select de provincias
  const provinciaSelect = document.getElementById('provincias-select');
  provinciaSelect.addEventListener('change', function () {
    const provincia = provinciaSelect.value;
    const region = document.getElementById('regiones-select').value;
    if (provincia === 'reset') {
      updatePlot(region, 'reset');
    } else {
      updatePlot(region, provincia);
    }
  });

  const regionSelect = document.getElementById('regiones-select');
  regionSelect.addEventListener('change', function () {
    const region = regionSelect.value;
    const provincia = document.getElementById('provincias-select').value;
    if (provincia === 'reset') {
      updatePlot(region, 'reset');
    } else {
      updatePlot(region, provincia);
    }
  });

  // Observar cambios en el select usando MutationObserver
  const observer = new MutationObserver(function () {
    const provincia = provinciaSelect.value;
    const region = document.getElementById('regiones-select').value;
    if (provincia === 'reset') {
      updatePlot(region, 'reset');
    } else {
      updatePlot(region, provincia);
    }
  });

  // Observar cambios en el select
  observer.observe(provinciaSelect, { attributes: true, childList: true, subtree: true });
});
