'''----------------------------------------------------------
 * ppmpredict.py
 *
 * Date: 21-Nov-2023
 * Authors:
 *           A01799387 Renato Garcia Moran
 *           A01798048 Maximilisno De La Cruz Lima
 *           A01798199 Fidel Alexander Bonilla Montalvo
 *----------------------------------------------------------'''
import tensorflow as tf
import pandas as pd
import json
import mysql.connector
from datetime import timedelta
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

with open('eventData.json', 'r') as file:
    data = json.load(file)

df = pd.DataFrame(data)

df['time'] = pd.to_datetime(df['time'], unit='s')
df.sort_values(by='time', inplace=True)

df['ppm_next_day'] = df['ppm'].shift(-1)
df.dropna(subset=['ppm_next_day'], inplace=True)

X = df[["Temperatura corporal", "Humedad", "Temperatura ambiental"]]
y = df["ppm_next_day"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(1)
])

model.compile(optimizer='adam', loss='mean_squared_error')
model.fit(X_train, y_train, epochs=1000, batch_size=32, validation_split=0.2)

df['new_time'] = df['time'] + timedelta(days=4)
scaled_new_data = scaler.transform(df[["Temperatura corporal", "Humedad", "Temperatura ambiental"]].values)
predicciones = model.predict(scaled_new_data)

db_connection = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='retofinal'
)
cursor = db_connection.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS PrediccionPpm (
        idPredictRitmo INT AUTO_INCREMENT PRIMARY KEY,
        fecha_hora DATETIME,
        nuevoPPM INT,
        idRitmo INT,
        FOREIGN KEY (idRitmo) REFERENCES ritmocardiaco(idRitmo)
    )
''')

df['idRitmo'] = range(1, len(df) + 1)

for fecha_hora, ppm, id_ritmo in zip(df['new_time'], predicciones, df['idRitmo']):
    cursor.execute('INSERT INTO PrediccionPpm (fecha_hora, nuevoPPM, idRitmo) VALUES (%s, %s, %s)',
                   (fecha_hora.to_pydatetime(), round(ppm[0]), id_ritmo))

db_connection.commit()
cursor.close()
db_connection.close()
