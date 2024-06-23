from flask import Flask, render_template, request, jsonify
import pandas as pd
import plotly.express as px

app = Flask(__name__)

dfData = pd.read_csv('./static/data/ranking_consolidado.csv')
print(dfData['Provincia'].unique())

provincias = dfData["Provincia"].unique().tolist()
regiones = dfData["Region"].unique().tolist()
tipos_compania = dfData["Tipo_Compania"].unique().tolist()
tamanos = dfData["Tamaño"].unique().tolist()
sectores = dfData["Sector"].unique().tolist()

@app.route('/')
def index():
    return render_template(
        'index.html', 
        provincias=provincias,
        regiones=regiones,
        tipos_compania=tipos_compania,
        tamanos=tamanos,
        sectores=sectores
        )
    
@app.route('/select_region', methods=['POST'])
def select_region():
    selected_region = request.form['region']
    filtered_provincias = dfData[dfData['Region'] == selected_region]["Provincia"].unique().tolist()
    return jsonify({'provincias': filtered_provincias})

@app.route('/select_province', methods=['POST'])
def select_province():
    selected_province = request.form['province']
    print(f'Provincia seleccionada: {selected_province}')
    return jsonify({'province': selected_province})

@app.route('/data')
def get_data():
    return dfData.to_json(orient='split')

# this data is for a flot with two variables // but change this to return more variable necesary for the 
@app.route('/plot', methods=['POST'])
def plot():
    data = request.json
    x = data['x']
    y = data['y']
    # add more variables to use in the plot
    provincia = data.get('provincia', 'reset')
    region = data.get('region', 'reset')
    tipo_compania = data.get('tipo_compania', 'all')
    tamano = data.get('tamano', 'all')
    sector = data.get('sector', 'all')

    filtered_df = dfData

    if provincia != 'reset' and region != 'reset':
        filtered_df = dfData[(dfData['Provincia'] == provincia) & (dfData['Region'] == region)]
    elif provincia != 'reset':
        filtered_df = dfData[dfData['Provincia'] == provincia]
    elif region != 'reset':
        filtered_df = dfData[dfData['Region'] == region]
        
    if tipo_compania != 'all':
        filtered_df = filtered_df[filtered_df['Tipo_Compania'] == tipo_compania]
    if tamano != 'all':
        filtered_df = filtered_df[filtered_df['Tamaño'] == tamano]
    if sector != 'all':
        filtered_df = filtered_df[filtered_df['Sector'] == sector]
        
    print(f'number rows: {filtered_df.shape}')
    fig = px.scatter(filtered_df, x=x, y=y)
    graphJSON = fig.to_json()
    return graphJSON

# 
# addd more funtions to create more plots
# 


if __name__ == '__main__':
    app.run(debug=True)
    # app.run(host='0.0.0.0', port=5000, debug=True)
