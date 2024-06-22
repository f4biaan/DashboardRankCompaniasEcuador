document.addEventListener('DOMContentLoaded', function () {
  fetch('/data')
    .then(response => response.json())
    .then(data => {
      const columns = data.columns;
      const xSelect = document.getElementById('x-axis');
      const ySelect = document.getElementById('y-axis');

      columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.text = col;
        xSelect.appendChild(option);
        ySelect.appendChild(option.cloneNode(true));
      });
    });

    // Añadir event listener al select de provincias
    const provinciaSelect = document.getElementById('provincias-select');
    provinciaSelect.addEventListener('change', updatePlot);
});

function updatePlot() {
  const x = document.getElementById('x-axis').value;
  const y = document.getElementById('y-axis').value;
  const provincia = document.getElementById('provincias-select').value;

  fetch('/plot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ x: x, y: y, provincia: provincia }),
  })
    .then(response => response.json())
    .then(data => {
      const plotDiv = document.getElementById('plot');
      Plotly.react(plotDiv, data.data, data.layout);
    });
}
