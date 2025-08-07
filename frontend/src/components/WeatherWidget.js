import PropTypes from 'prop-types';

const WeatherWidget = ({ weatherData, onRetry }) => {
  const isValidData = weatherData && typeof weatherData.temperature === 'number';

  return (
    <div className="widget card weather-widget">
      <div className="widget-header">
        <h3>Live Weather</h3>
        <div className="widget-status">
          <span className="widget-icon">🌡️</span>
          <span className="update-indicator" />
        </div>
      </div>

      {isValidData ? (
        <div className="weather-info">
          <div className="weather-main">
            <span className="weather-temp">
              {Math.round(weatherData.temperature)}°C
            </span>
            <div className="weather-details">
              <div className="weather-location">Current Location</div>
              <div className="weather-time">
                Updated: {weatherData.last_update}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading weather data...</p>
          <button className="btn btn--sm btn--outline" onClick={onRetry}>
            Retry Connection
          </button>
        </div>
      )}
    </div>
  );
};

WeatherWidget.propTypes = {
  weatherData: PropTypes.shape({
    temperature: PropTypes.number,
    last_update: PropTypes.string
  }),
  onRetry: PropTypes.func.isRequired
};

export default WeatherWidget;
