import React, { Component } from 'react';
import MaterialTable from 'material-table';
import moment from 'moment';
import request from 'request';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import {
  Map, TileLayer, Marker, Tooltip
} from 'react-leaflet';
import './App.css';

const API_URL = 'https://hal24k-code-test.azurewebsites.net/api/';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      chartData: [],
      selectedSensor: 1,
      mapZoom: 5,
      mapMarkerPosition: {
        lat: 0,
        lng: 0,
      }
    }
  }

  /* Get measures for Sensor */
  getMeasuresForSensor() {
    request(`${API_URL}SensorMeasurements/GetAllBySensor/${this.state.selectedSensor}`, (error, response, body) => {
      if (error) {
        window.alert('Error => ', error);
      }
      let responseData = JSON.parse(body);
      let tableData = responseData.map((item) => {
        return item;
      });
      let dataForChart = responseData.sort((measure1, measure2) => {
        let date1 = new Date(measure1.date).getTime();
        let date2 = new Date(measure2.date).getTime();
        return date1 - date2;
      })
      .map((item) => {
        return {
          date: moment(item.date).format('MM.YYYY'),
          measure: item.value
        }
      });
      this.setState({ data: tableData, chartData: dataForChart });
    })
  }
  /* Get Sensor position */
  getSensorPosition() {
    request(`${API_URL}Sensors/${this.state.selectedSensor}`, (error, response, body) => {
      if (error) {
        window.alert('Error => ', error);
      }
      let responseData = JSON.parse(body);
      const { latitude, longitude } = responseData;
      this.setState({
        mapMarkerPosition: {
          lat: latitude,
          lng: longitude,
        },
        mapZoom: 10,
      });
    });
  }

  componentDidMount() {
    this.getMeasuresForSensor();
    this.getSensorPosition();
  }

  render() {
    const {
      data,
      chartData,
      mapZoom,
      mapMarkerPosition,
    } = this.state;

    return (
      <div className="App">
          <h2>
            HAL24K Code Test app
          </h2>
        <div>
          <MaterialTable
            columns={[
              { title: 'Sensor #', field: 'sensorId' },
              { title: 'Value', field: 'value' },
              { title: 'Date', field: 'date', type: 'date' },
            ]}
            data={data}
            title="List of Sensor data"
          />
        </div>
        <div style={{ marginTop: '20px'}}>This is how chemicals in the air changed in a year</div>
        <div className='chart-container'>
          <LineChart
            data={chartData}
            width={800}
            height={400}
            margin={{
              top: 20, right: 5, left: 5, bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis/>
            <Legend />
            <Line name="Level of measures" type="monotone" dataKey="measure" stroke="#82ca9d" />
          </LineChart>
        </div>
        <div style={{ marginBottom: '20px'}}>Sensor position on a map</div>
        <div className='leaflet-container'>
          <Map center={mapMarkerPosition}
              zoom={mapZoom}
              >
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={mapMarkerPosition}>
            <Tooltip>Sensor position</Tooltip>
          </Marker>
        </Map>
        </div>
      </div>
    );
  }
}

export default App;
