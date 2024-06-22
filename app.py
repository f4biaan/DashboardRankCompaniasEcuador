from flask import Flask, render_template, request, jsonify
import pandas as pd
import plotly.express as px

app = Flask(__name__)

dfData = pd.read_csv('./static/data/ranking_consolidado.csv')
print(dfData['Provincia'].unique())

# provincias = ["AZUAY", "BOLIVAR", "CAÑAR", "CARCHI", "CHIMBORAZO", "COTOPAXI", "EL ORO", "ESMERALDAS", "GALAPAGOS", "GUAYAS", "IMBABURA", "LOJA", "LOS RIOS", "MANABI", "MORONA SANTIAGO", "NAPO", "ORELLANA", "PASTAZA", "PICHINCHA", "SANTA ELENA", "SANTO DOMINGO DE LOS TSACHILAS", "SUCUMBIOS", "TUNGURAHUA", "ZAMORA CHINCHIPE"]
provincias = dfData["Provincia"].unique().tolist()


@app.route('/')
def index():
    return render_template('index.html', provincias=provincias)

@app.route('/select_province', methods=['POST'])
def select_province():
    selected_province = request.form['province']
    print(f'Provincia seleccionada: {selected_province}')
    return jsonify({'province': selected_province})

@app.route('/data')
def get_data():
    return dfData.to_json(orient='split')

@app.route('/plot', methods=['POST'])
def plot():
    data = request.json
    x = data['x']
    y = data['y']
    provincia = data.get('provincia', None)

    if provincia and provincia != 'reset':
        filtered_df = dfData[dfData['Provincia'] == provincia]
    else:
        filtered_df = dfData
        
    fig = px.scatter(filtered_df, x=x, y=y)
    graphJSON = fig.to_json()
    return graphJSON

if __name__ == '__main__':
    # app.run(debug=True)
    app.run(host='0.0.0.0', port=5000, debug=True)