class OpenMeteoModule{
    constructor(geoUrl = "https://geocoding-api.open-meteo.com/v1/search?",
                weatherUrl = "https://api.open-meteo.com/v1/forecast?") {
      this.geoUrl = geoUrl;
      this.weatherUrl = weatherUrl;
    };

    getCities(name) {
      return fetch(this.geoUrl+'name='+name)
        .then(res => res.json())
        .then(data => data.results);
    };

    getTemperature(lat,long) {
      return fetch(this.weatherUrl+'latitude='+lat+'&longitude='+long+'&hourly=temperature_2m')
        .then(res => res.json());
    }
};
  
export {OpenMeteoModule};
