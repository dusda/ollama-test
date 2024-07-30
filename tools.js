export class Tool {
  constructor(name, description, parameters) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
  }
}

class ToolParameter {
  constructor(name, description, type, required) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.required = required;
  }
}

class FunctionParameter {
  constructor(parameterName, parameterValue) {
    this.parameterName = parameterName;
    this.parameterValue = parameterValue;
  }
}

const cityToLatLonTool = new Tool(
  "CityToLatLon",
  "Get the latitude and longitude for a given city",
  [new ToolParameter("city", "The city to get the latitude and longitude for", "string", true)]
);

const weatherFromLatLonTool = new Tool(
  "WeatherFromLatLon",
  "Get the weather for a location",
  [
    new ToolParameter("latitude", "The latitude of the location", "number", true),
    new ToolParameter("longitude", "The longitude of the location", "number", true)
  ]
);

const latlonToCityTool = new Tool(
  "LatLonToCity",
  "Get the city name for a given latitude and longitude",
  [
    new ToolParameter("latitude", "The latitude of the location", "number", true),
    new ToolParameter("longitude", "The longitude of the location", "number", true)
  ]
);

const webSearchTool = new Tool(
  "WebSearch",
  "Search the web for a query",
  [new ToolParameter("query", "The query to search for", "string", true)]
);

const weatherFromLocationTool = new Tool(
  "WeatherFromLocation",
  "Get the weather for a location",
  [new ToolParameter("location", "The location to get the weather for", "string", true)]
);

async function CityToLatLon(city) {
  const output = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${city}&format=json`
  );
  const json = await output.json();
  return [json[0].lat, json[0].lon];
}

async function LatLonToCity(latitude, longitude) {
  const output = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
  );
  const json = await output.json();
  console.log(json.display_name);
}

async function WeatherFromLatLon(latitude, longitude) {
  const output = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=1`
  );
  const json = await output.json();
  console.log(`${json.current.temperature_2m} degrees Fahrenheit`);
}

async function WeatherFromLocation(location) {
  const latlon = await CityToLatLon(location);
  await WeatherFromLatLon(latlon[0], latlon[1]);
}

async function WebSearch(query) {
  const output = await fetch(
    `http://localhost:3333/search?q=${query}&format=json`
  );
  const json = await output.json();
  console.log(`${json.results[0].title}\n${json.results[0].content}\n`);
}

export const toolsString = JSON.stringify(
  {
    tools: [
      weatherFromLocationTool,
      weatherFromLatLonTool,
      latlonToCityTool,
    ]
  },
  null,
  2
);

function getValueOfParameter(parameterName, parameters) {
  return parameters.filter(p => p.parameterName === parameterName)[0].parameterValue;
}

export async function executeFunction(functionName, parameters) {
  switch (functionName) {
    case "WeatherFromLocation":
      return await WeatherFromLocation(getValueOfParameter("location", parameters));
    case "WeatherFromLatLon":
      return await WeatherFromLatLon(
        getValueOfParameter("latitude", parameters),
        getValueOfParameter("longitude", parameters)
      );
    case "WebSearch":
      return await WebSearch(getValueOfParameter("query", parameters));
    case "LatLonToCity":
      return await LatLonToCity(
        getValueOfParameter("latitude", parameters),
        getValueOfParameter("longitude", parameters)
      );
  }
}
