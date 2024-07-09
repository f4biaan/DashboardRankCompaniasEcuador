from flask import Flask, render_template, request, jsonify
import pandas as pd
import plotly.express as px

app = Flask(__name__)

dfData = pd.read_csv('./static/data/DataCompaniesClean.csv')
# print(dfData['Region'].unique())

provincias = dfData["Provincia"].unique().tolist()
regiones = dfData["Region"].unique().tolist()
tipos_compania = dfData["Tipo_Compania"].unique().tolist()
tamanos = dfData["Tamaño"].unique().tolist()
sectores = dfData["Sector"].unique().tolist()

# print(provincias)

# latest_year = dfData['Año_Actual'].max()
# top_companies = dfData[dfData['Año_Actual'] == latest_year].nsmallest(5, 'Posicion_Actual')[['Nombre', 'Posicion_Actual']]
# top_companies_list = top_companies.to_dict(orient='records')

# latest_year = dfData['Año_Actual'].max()

latest_year = dfData['Año_Actual'].max()
latest_year = int(latest_year)  # Convertir a entero nativo de Python

top_companies = dfData[dfData['Año_Actual'] == latest_year].nlargest(5, 'Ingreso_por_ventas')[['Nombre', 'Ingreso_por_ventas']]
top_companies_list = top_companies.to_dict(orient='records')


@app.route('/')
def index():
    return render_template(
        'index.html', 
        provincias=provincias,
        regiones=regiones,
        tipos_compania=tipos_compania,
        tamanos=tamanos,
        sectores=sectores,
        top_companies=top_companies_list,
        latest_year=latest_year
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
        
    fig = px.scatter(filtered_df, x=x, y=y)
    graphJSON = fig.to_json()
    return graphJSON

@app.route('/update_top', methods=['POST'])
def update_top():
    data = request.json
    provincia = data.get('provincia', 'reset')
    region = data.get('region', 'reset')
    tipo_compania = data.get('tipo_compania', 'all')
    tamano = data.get('tamano', 'all')
    sector = data.get('sector', 'all')
    
    print(f'Provincia: {provincia}, Region: {region}, Tipo Compania: {tipo_compania}, Tamaño: {tamano}, Sector: {sector}')

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

    latest_year = filtered_df['Año_Actual'].max()
    if pd.notna(latest_year):
        latest_year = int(latest_year)  # Convertir a entero nativo de Python
    else:
        # Manejar el caso donde no hay datos en 'Año_Actual'
        latest_year = 2023

    # Verificar y convertir el tipo de dato de la columna 'Ingreso_por_ventas' a numérico
    # filtered_df['Ingreso_por_ventas'] = pd.to_numeric(filtered_df['Ingreso_por_ventas'], errors='coerce')
    filtered_df.loc[:, 'Ingreso_por_ventas'] = pd.to_numeric(filtered_df['Ingreso_por_ventas'], errors='coerce')


    top_companies = filtered_df[filtered_df['Año_Actual'] == latest_year].nlargest(5, 'Ingreso_por_ventas')[['Nombre', 'Ingreso_por_ventas', 'Provincia', 'Region', 'Tipo_Compania', 'Tamaño', 'Sector', 'Ciudad', 'Ingreso_Total', 'Posicion_Actual']]
    top_companies_list = top_companies.to_dict(orient='records')
    
    # print(top_companies_list)
    
    return jsonify({'top_companies': top_companies_list, 'latest_year': latest_year})

@app.route('/aggregate_data', methods=['POST'])
def aggregate_data():
    data = request.json
    provincia = data.get('provincia', 'reset')
    region = data.get('region', 'reset')
    tipo_compania = data.get('tipo_compania', 'all')
    tamano = data.get('tamano', 'all')
    sector = data.get('sector', 'all')

    filtered_df = dfData

    if provincia != 'reset' and region != 'reset':
        filtered_df = filtered_df[(filtered_df['Provincia'] == provincia) & (filtered_df['Region'] == region)]
    elif provincia != 'reset':
        filtered_df = filtered_df[filtered_df['Provincia'] == provincia]
    elif region != 'reset':
        filtered_df = filtered_df[filtered_df['Region'] == region]

    if tipo_compania != 'all':
        filtered_df = filtered_df[filtered_df['Tipo_Compania'] == tipo_compania]
    if tamano != 'all':
        filtered_df = filtered_df[filtered_df['Tamaño'] == tamano]
    if sector != 'all':
        filtered_df = filtered_df[filtered_df['Sector'] == sector]

     # Verificar DataFrame filtrado
    # print("Columnas en filtered_df:", filtered_df.columns)
    print("Primeras filas de filtered_df:", filtered_df.head())
        
    # Cálculos agregados
    total_companies = filtered_df['Nombre'].unique().shape[0]
    # print("Total de empresas:", total_companies)
    total_revenue = filtered_df['Ingreso_por_ventas'].sum()
    total_equity = filtered_df['Patrimonio'].sum()
    active = filtered_df['Activo'].sum()

    result = {
        'total_companies': total_companies,
        'total_revenue': total_revenue,
        'total_equity': total_equity,
        'active': active
    }

    return jsonify(result)


@app.route('/line_plot', methods=['POST'])
def line_plot():
    data = request.json
    provincia = data.get('provincia', 'reset')
    region = data.get('region', 'reset')
    tipo_compania = data.get('tipo_compania', 'all')
    tamano = data.get('tamano', 'all')
    sector = data.get('sector', 'all')

    filtered_df = dfData

    if provincia != 'reset':
        filtered_df = filtered_df[filtered_df['Provincia'] == provincia]
    if region != 'reset':
        filtered_df = filtered_df[filtered_df['Region'] == region]
    if tipo_compania != 'all':
        filtered_df = filtered_df[filtered_df['Tipo_Compania'] == tipo_compania]
    if tamano != 'all':
        filtered_df = filtered_df[filtered_df['Tamaño'] == tamano]
    if sector != 'all':
        filtered_df = filtered_df[filtered_df['Sector'] == sector]

    fig = px.line(filtered_df, x='Año_Actual', y='Ingreso_por_ventas', color='Nombre', title='Ingreso por Ventas a lo Largo del Tiempo')
    graphJSON = fig.to_json()
    return graphJSON

if __name__ == '__main__':
    app.run(debug=True)
    # app.run(host='0.0.0.0', port=5000, debug=True)
