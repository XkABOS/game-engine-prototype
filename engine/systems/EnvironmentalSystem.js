/**
 * ============================================================================
 * GENESIS ENVIRONMENT SYSTEM v0.3.0
 * ============================================================================
 * 
 * CREDIT & ATTRIBUTION:
 * ├─ Design & Direction: XkABOS
 * ├─ Environment & Biome Concepts: XkABOS
 * ├─ Time/Weather System Concept: XkABOS
 * ├─ Implementation: Copilot AI
 * ├─ Architecture: Copilot AI
 * └─ Collaboration: Human-AI Partnership
 * 
 * PURPOSE:
 * This system provides comprehensive environment management including:
 * - Multiple biomes and environments
 * - Dynamic time of day system (24-hour cycle)
 * - Weather conditions with effects
 * - Environmental effects (lighting, visibility, etc.)
 * - Day/night transitions
 * - Environmental audio and ambiance
 * 
 * BIOMES INCLUDED:
 * 0. Open Field - Flat grasslands
 * 1. Hillside - Mountainous terrain
 * 2. Ocean - Open water
 * 3. Shore/Beach - Coastal area
 * 4. Urban City - Modern buildings
 * 5. Futuristic Dystopia - Neon cyberpunk
 * 6. Medieval Kingdom - Fantasy setting
 * 7. Tundra - Ice/snow environment
 * 8. Blank World - Empty canvas (black/white/transparent)
 * 9. Digital Environment - Tech/circuit theme
 * 10. Laboratory - Scientific setting
 * 11. Apocalyptic Wasteland - Post-apocalyptic
 * 12. Desert - Sandy environment
 * 13. Forest - Wooded area
 * 14. Factory - Industrial setting
 * 
 * WEATHER SYSTEMS:
 * - Clear
 * - Rainy
 * - Snowy
 * - Stormy/Thunderstorm
 * - Foggy
 * - Windy
 * - Hail
 * - Sandstorm
 * 
 * TIME OF DAY:
 * - Midnight (00:00)
 * - Sunrise (06:00)
 * - Morning (09:00)
 * - Noon (12:00)
 * - Afternoon (15:00)
 * - Sunset (18:00)
 * - Evening (21:00)
 * - Night (23:00)
 * 
 * ENVIRONMENTAL EFFECTS:
 * - Lighting (brightness, color)
 * - Visibility (fog density)
 * - Temperature
 * - Wind speed/direction
 * - Particle effects
 * - Audio ambiance
 * 
 * ============================================================================
 */

/**
 * ============================================================================
 * TIME OF DAY SYSTEM
 * ============================================================================
 */
class TimeOfDaySystem {
  constructor() {
    this.currentHour = 12; // 0-23 (24-hour format)
    this.currentMinute = 0; // 0-59
    this.dayLength = 300; // Seconds in a game day (5 minutes = 1 day cycle)
    this.elapsedTime = 0;
    this.dayCounter = 0;
    this.isNight = false;
    this.listeners = [];

    this.timeData = {
      midnight: { hour: 0, name: 'Midnight', brightness: 0.1, color: '#001a33' },
      sunrise: { hour: 6, name: 'Sunrise', brightness: 0.5, color: '#ff9933' },
      morning: { hour: 9, name: 'Morning', brightness: 0.8, color: '#ffff99' },
      noon: { hour: 12, name: 'Noon', brightness: 1.0, color: '#ffffff' },
      afternoon: { hour: 15, name: 'Afternoon', brightness: 0.85, color: '#ffdd66' },
      sunset: { hour: 18, name: 'Sunset', brightness: 0.6, color: '#ff6633' },
      evening: { hour: 21, name: 'Evening', brightness: 0.3, color: '#330066' },
      night: { hour: 23, name: 'Night', brightness: 0.15, color: '#1a1a4d' }
    };
  }

  /**
   * Update time
   */
  update(dt) {
    this.elapsedTime += dt;

    // Progress through day cycle
    const dayProgress = (this.elapsedTime / this.dayLength) % 1;
    this.currentHour = Math.floor(dayProgress * 24);
    this.currentMinute = Math.floor((dayProgress * 24 - this.currentHour) * 60);

    // Check if day changed
    if (this.elapsedTime >= this.dayLength * (this.dayCounter + 1)) {
      this.dayCounter++;
      this.emit('dayChanged', { day: this.dayCounter });
    }

    // Update night status
    const wasNight = this.isNight;
    this.isNight = this.currentHour < 6 || this.currentHour >= 20;

    if (wasNight !== this.isNight) {
      this.emit('dayNightToggle', { isNight: this.isNight });
    }
  }

  /**
   * Get current time
   */
  getTime() {
    return {
      hour: this.currentHour,
      minute: this.currentMinute,
      timeString: `${String(this.currentHour).padStart(2, '0')}:${String(this.currentMinute).padStart(2, '0')}`,
      day: this.dayCounter,
      isNight: this.isNight
    };
  }

  /**
   * Get brightness multiplier based on time
   */
  getBrightness() {
    const hour = this.currentHour;

    if (hour >= 12 && hour < 14) return 1.0; // Noon peak
    if (hour >= 14 && hour < 18) return 0.95 - (hour - 14) * 0.075; // Afternoon fade
    if (hour >= 18 && hour < 20) return 0.6 - (hour - 18) * 0.15; // Sunset
    if (hour >= 20 || hour < 6) return 0.1 + Math.sin((hour - 0) / 24 * Math.PI) * 0.05; // Night
    if (hour >= 6 && hour < 9) return 0.1 + (hour - 6) * 0.233; // Sunrise
    if (hour >= 9 && hour < 12) return 0.8 + (hour - 9) * 0.067; // Morning

    return 0.5; // Default
  }

  /**
   * Get color tint based on time
   */
  getColorTint() {
    const hour = this.currentHour;

    const tints = {
      midnight: { r: 0, g: 26, b: 51 },
      sunrise: { r: 255, g: 153, b: 51 },
      morning: { r: 255, g: 255, b: 153 },
      noon: { r: 255, g: 255, b: 255 },
      afternoon: { r: 255, g: 221, b: 102 },
      sunset: { r: 255, g: 102, b: 51 },
      evening: { r: 51, g: 0, b: 102 },
      night: { r: 26, g: 26, b: 77 }
    };

    if (hour >= 0 && hour < 6) return tints.midnight;
    if (hour >= 6 && hour < 9) return tints.sunrise;
    if (hour >= 9 && hour < 12) return tints.morning;
    if (hour >= 12 && hour < 15) return tints.noon;
    if (hour >= 15 && hour < 18) return tints.afternoon;
    if (hour >= 18 && hour < 20) return tints.sunset;
    if (hour >= 20 && hour < 23) return tints.evening;
    if (hour >= 23) return tints.night;

    return tints.noon;
  }

  /**
   * Get time of day name
   */
  getTimeOfDayName() {
    const hour = this.currentHour;
    if (hour >= 0 && hour < 6) return 'Midnight';
    if (hour >= 6 && hour < 9) return 'Sunrise';
    if (hour >= 9 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 15) return 'Noon';
    if (hour >= 15 && hour < 18) return 'Afternoon';
    if (hour >= 18 && hour < 20) return 'Sunset';
    if (hour >= 20 && hour < 23) return 'Evening';
    if (hour >= 23) return 'Night';
    return 'Unknown';
  }

  /**
   * Set specific time
   */
  setTime(hour, minute = 0) {
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      console.error('❌ Invalid time');
      return false;
    }
    this.currentHour = hour;
    this.currentMinute = minute;
    this.elapsedTime = (hour + minute / 60) / 24 * this.dayLength;
    console.log(`🕐 Time set to ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    return true;
  }

  /**
   * Fast forward time
   */
  skipToTime(hour) {
    return this.setTime(hour, 0);
  }

  /**
   * Add listener for time events
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Emit time events
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Get day/night duration
   */
  getDayNightDuration() {
    return {
      dayLength: this.dayLength,
      dayDuration: this.dayLength * 0.5,
      nightDuration: this.dayLength * 0.5
    };
  }
}

/**
 * ============================================================================
 * WEATHER SYSTEM
 * ============================================================================
 */
class WeatherSystem {
  constructor() {
    this.currentWeather = 'CLEAR';
    this.weatherIntensity = 0; // 0-1 (how strong the weather is)
    this.windSpeed = 0;
    this.windDirection = 0; // 0-360 degrees
    this.temperature = 20; // Celsius
    this.visibility = 1.0; // 0-1 (1 = clear, 0 = can't see)
    this.listeners = [];

    this.weatherData = {
      CLEAR: {
        name: 'Clear',
        description: 'Perfect visibility and calm conditions',
        visibility: 1.0,
        windSpeed: 0.5,
        temperature: 20,
        particleIntensity: 0,
        color: '#ffffff'
      },
      RAINY: {
        name: 'Rainy',
        description: 'Rain falling from the sky',
        visibility: 0.7,
        windSpeed: 3,
        temperature: 15,
        particleIntensity: 0.6,
        color: '#6699cc'
      },
      SNOWY: {
        name: 'Snowy',
        description: 'Snow covering the landscape',
        visibility: 0.6,
        windSpeed: 2.5,
        temperature: -5,
        particleIntensity: 0.7,
        color: '#e6f2ff'
      },
      STORMY: {
        name: 'Stormy',
        description: 'Thunderstorm with heavy rain',
        visibility: 0.4,
        windSpeed: 8,
        temperature: 12,
        particleIntensity: 0.9,
        color: '#330033'
      },
      FOGGY: {
        name: 'Foggy',
        description: 'Dense fog reducing visibility',
        visibility: 0.3,
        windSpeed: 1,
        temperature: 18,
        particleIntensity: 0.5,
        color: '#cccccc'
      },
      WINDY: {
        name: 'Windy',
        description: 'Strong winds blowing',
        visibility: 0.9,
        windSpeed: 6,
        temperature: 18,
        particleIntensity: 0.3,
        color: '#ffffff'
      },
      HAIL: {
        name: 'Hail',
        description: 'Hailstones falling',
        visibility: 0.5,
        windSpeed: 5,
        temperature: 0,
        particleIntensity: 0.8,
        color: '#ccccff'
      },
      SANDSTORM: {
        name: 'Sandstorm',
        description: 'Dust storm in desert',
        visibility: 0.2,
        windSpeed: 10,
        temperature: 35,
        particleIntensity: 0.95,
        color: '#cc9966'
      }
    };
  }

  /**
   * Set weather condition
   */
  setWeather(weatherType, intensity = 1.0) {
    if (!this.weatherData[weatherType]) {
      console.error(`❌ Weather type "${weatherType}" not found`);
      return false;
    }

    this.currentWeather = weatherType;
    this.weatherIntensity = Math.max(0, Math.min(1, intensity));

    const weather = this.weatherData[weatherType];
    this.visibility = weather.visibility * (1 - this.weatherIntensity * 0.3);
    this.windSpeed = weather.windSpeed + this.weatherIntensity * 5;
    this.temperature = weather.temperature;

    console.log(`🌦️ Weather changed to: ${weather.name} (Intensity: ${(this.weatherIntensity * 100).toFixed(0)}%)`);
    this.emit('weatherChanged', { weather: weatherType, intensity: this.weatherIntensity });
    return true;
  }

  /**
   * Get current weather info
   */
  getWeatherInfo() {
    const weather = this.weatherData[this.currentWeather];
    return {
      type: this.currentWeather,
      name: weather.name,
      description: weather.description,
      intensity: this.weatherIntensity,
      visibility: this.visibility,
      windSpeed: this.windSpeed,
      windDirection: this.windDirection,
      temperature: this.temperature,
      particleIntensity: weather.particleIntensity
    };
  }

  /**
   * Change wind direction
   */
  setWindDirection(degrees) {
    this.windDirection = degrees % 360;
  }

  /**
   * Get wind vector
   */
  getWindVector() {
    const radians = (this.windDirection * Math.PI) / 180;
    return {
      x: Math.cos(radians) * this.windSpeed,
      y: Math.sin(radians) * this.windSpeed
    };
  }

  /**
   * Apply weather effects to entity
   */
  applyWeatherEffects(entity) {
    if (!entity) return;

    const windVector = this.getWindVector();
    
    // Wind pushes entity
    if (this.windSpeed > 0 && !entity.isStatic) {
      entity.velocityX += windVector.x * 0.1;
      entity.velocityY += windVector.y * 0.1;
    }

    // Store weather effects on entity
    entity.weatherEffects = {
      visibility: this.visibility,
      windSpeed: this.windSpeed,
      temperature: this.temperature,
      weatherType: this.currentWeather
    };
  }

  /**
   * List all weather types
   */
  listWeathers() {
    const weatherList = [];
    Object.entries(this.weatherData).forEach(([key, data]) => {
      weatherList.push({
        type: key,
        name: data.name,
        description: data.description
      });
    });
    return weatherList;
  }

  /**
   * Get random weather
   */
  getRandomWeather() {
    const types = Object.keys(this.weatherData);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomIntensity = Math.random();
    return { type: randomType, intensity: randomIntensity };
  }

  /**
   * Add listener
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Get weather color overlay
   */
  getWeatherColor() {
    return this.weatherData[this.currentWeather].color;
  }

  /**
   * Print weather report
   */
  printReport() {
    console.log('='.repeat(60));
    console.log('🌦️ WEATHER REPORT');
    console.log('='.repeat(60));
    const info = this.getWeatherInfo();
    console.log(`Current Weather: ${info.name}`);
    console.log(`Intensity: ${(info.intensity * 100).toFixed(0)}%`);
    console.log(`Visibility: ${(info.visibility * 100).toFixed(0)}%`);
    console.log(`Wind Speed: ${info.windSpeed.toFixed(1)} m/s`);
    console.log(`Wind Direction: ${info.windDirection.toFixed(0)}°`);
    console.log(`Temperature: ${info.temperature}°C`);
    console.log('='.repeat(60));
  }
}

/**
 * ============================================================================
 * BIOME/ENVIRONMENT SYSTEM
 * ============================================================================
 */
class BiomeSystem {
  constructor() {
    this.currentBiome = 'OPEN_FIELD';
    this.biomeData = {
      OPEN_FIELD: {
        name: 'Open Field',
        description: 'Flat grasslands with clear skies',
        backgroundColor: '#90ee90',
        skyColor: '#87ceeb',
        music: 'field_theme.mp3',
        ambiance: 'birds_chirping.mp3',
        hazards: [],
        defaultWeather: 'CLEAR',
        compatiblePhysics: [0, 4, 5],
        flora: 'grass, wildflowers',
        fauna: 'rabbits, deer, birds'
      },
      HILLSIDE: {
        name: 'Hillside',
        description: 'Mountainous terrain with elevation changes',
        backgroundColor: '#8b7355',
        skyColor: '#87ceeb',
        music: 'mountain_theme.mp3',
        ambiance: 'wind_howling.mp3',
        hazards: ['falling', 'avalanche'],
        defaultWeather: 'CLEAR',
        compatiblePhysics: [0, 2],
        flora: 'pine trees, moss',
        fauna: 'mountain goats, eagles'
      },
      OCEAN: {
        name: 'Ocean',
        description: 'Open water with waves',
        backgroundColor: '#0077be',
        skyColor: '#87ceeb',
        music: 'ocean_theme.mp3',
        ambiance: 'waves.mp3',
        hazards: ['drowning', 'sharks', 'whirlpool'],
        defaultWeather: 'RAINY',
        compatiblePhysics: [3, 1],
        flora: 'seaweed, coral',
        fauna: 'fish, whales, sharks'
      },
      SHORE: {
        name: 'Shore/Beach',
        description: 'Coastal area with sand and waves',
        backgroundColor: '#ffd700',
        skyColor: '#87ceeb',
        music: 'beach_theme.mp3',
        ambiance: 'waves_and_seagulls.mp3',
        hazards: ['drowning'],
        defaultWeather: 'CLEAR',
        compatiblePhysics: [0, 4, 5],
        flora: 'palm trees, driftwood',
        fauna: 'seagulls, crabs, fish'
      },
      URBAN_CITY: {
        name: 'Urban City',
        description: 'Modern buildings and streets',
        backgroundColor: '#606060',
        skyColor: '#87ceeb',
        music: 'city_theme.mp3',
        ambiance: 'traffic_noise.mp3',
        hazards: ['falling', 'traffic'],
        defaultWeather: 'CLEAR',
        compatiblePhysics: [0, 4, 5],
        flora: 'potted plants, parks',
        fauna: 'pigeons, rats, cats'
      },
      FUTURISTIC_DYSTOPIA: {
        name: 'Futuristic Dystopia',
        description: 'Neon cyberpunk landscape',
        backgroundColor: '#1a1a2e',
        skyColor: '#0f3460',
        music: 'synthwave.mp3',
        ambiance: 'electric_hum.mp3',
        hazards: ['radiation', 'electrocution'],
        defaultWeather: 'FOGGY',
        compatiblePhysics: [4, 5, 1],
        flora: 'none',
        fauna: 'none'
      },
      MEDIEVAL_KINGDOM: {
        name: 'Medieval Kingdom',
        description: 'Fantasy castles and villages',
        backgroundColor: '#8b4513',
        skyColor: '#87ceeb',
        music: 'medieval_theme.mp3',
        ambiance: 'birds_and_bells.mp3',
        hazards: ['combat', 'traps'],
        defaultWeather: 'CLEAR',
        compatiblePhysics: [0, 2, 4],
        flora: 'oak trees, crops',
        fauna: 'horses, chickens, wolves'
      },
      TUNDRA: {
        name: 'Tundra',
        description: 'Ice and snow landscape',
        backgroundColor: '#e0ffff',
        skyColor: '#b0e0e6',
        music: 'tundra_theme.mp3',
        ambiance: 'wind_and_ice.mp3',
        hazards: ['freezing', 'avalanche', 'blizzard'],
        defaultWeather: 'SNOWY',
        compatiblePhysics: [0, 2],
        flora: 'lichen, mosses',
        fauna: 'polar bears, arctic foxes, penguins'
      },
      BLANK_WORLD: {
        name: 'Blank World',
        description: 'Empty canvas - customize as needed',
        backgroundColor: '#000000',
        skyColor: '#000000',
        music: 'ambient.mp3',
        ambiance: 'silence.mp3',
        hazards: [],
        defaultWeather: 'CLEAR',
        compatiblePhysics: [0, 1, 4, 5],
        flora: 'none',
        fauna: 'none'
      },
      DIGITAL_ENVIRONMENT: {
        name: 'Digital Environment',
        description: 'Tech circuits and data streams',
        backgroundColor: '#001a00',
        skyColor: '#00aa00',
        music: 'digital_theme.mp3',
        ambiance: 'computer_sounds.mp3',
        hazards: ['data_corruption', 'power_surge'],
        defaultWeather: 'CLEAR',
        compatiblePhysics: [4, 5, 1],
        flora: 'none',
        fauna: 'none'
      },
      LABORATORY: {
        name: 'Laboratory',
        description: 'Scientific research facility',
        backgroundColor: '#cccccc',
        skyColor: '#ffffff',
        music: 'lab_theme.mp3',
        ambiance: 'beeping_and_bubbling.mp3',
        hazards: ['chemical_spill', 'explosion'],
        defaultWeather: 'CLEAR',
        compatiblePhysics: [0, 1, 4],
        flora: 'none',
        fauna: 'none'
      },
      APOCALYPTIC_WASTELAND: {
        name: 'Apocalyptic Wasteland',
        description: 'Post-apocalyptic ruins',
        backgroundColor: '#4d3319',
        skyColor: '#330000',
        music: 'wasteland_theme.mp3',
        ambiance: 'eerie_winds.mp3',
        hazards: ['radiation', 'falling_debris', 'toxic_gas'],
        defaultWeather: 'STORMY',
        compatiblePhysics: [0, 4],
        flora: 'dead trees',
        fauna: 'mutants, scavengers'
      },
      DESERT: {
        name: 'Desert',
        description: 'Sandy landscape with dunes',
        backgroundColor: '#e6b800',
        skyColor: '#ffcc66',
        music: 'desert_theme.mp3',
        ambiance: 'wind_and_sand.mp3',
        hazards: ['dehydration', 'sandstorm', 'quicksand'],
        defaultWeather: 'SANDSTORM',
        compatiblePhysics: [0, 4],
        flora: 'cacti, desert shrubs',
        fauna: 'camels, scorpions, lizards'
      },
      FOREST: {
        name: 'Forest',
        description: 'Dense wooded area',
        backgroundColor: '#228b22',
        skyColor: '#87ceeb',
        music: 'forest_theme.mp3',
        ambiance: 'nature_sounds.mp3',
        hazards: ['getting_lost', 'wild_animals'],
        defaultWeather: 'CLEAR',
        compatiblePhysics: [0, 2, 5],
        flora: 'trees, shrubs, mushrooms',
        fauna: 'deer, wolves, bears, birds'
      },
      FACTORY: {
        name: 'Factory',
        description: 'Industrial manufacturing plant',
        backgroundColor: '#696969',
        skyColor: '#808080',
        music: 'factory_theme.mp3',
        ambiance: 'machinery.mp3',
        hazards: ['machinery', 'fire', 'toxic_fumes'],
        defaultWeather: 'FOGGY',
        compatiblePhysics: [0, 4],
        flora: 'none',
        fauna: 'none'
      }
    };

    this.listeners = [];
  }

  /**
   * Set current biome
   */
  setBiome(biomeType) {
    if (!this.biomeData[biomeType]) {
      console.error(`❌ Biome type "${biomeType}" not found`);
      return false;
    }

    this.currentBiome = biomeType;
    const biome = this.biomeData[biomeType];
    console.log(`🌍 Environment changed to: ${biome.name}`);
    this.emit('biomeChanged', { biome: biomeType });
    return true;
  }

  /**
   * Get current biome info
   */
  getBiomeInfo() {
    const biome = this.biomeData[this.currentBiome];
    return {
      type: this.currentBiome,
      ...biome
    };
  }

  /**
   * List all biomes
   */
  listBiomes() {
    const biomeList = [];
    Object.entries(this.biomeData).forEach(([key, data]) => {
      biomeList.push({
        type: key,
        name: data.name,
        description: data.description
      });
    });
    return biomeList;
  }

  /**
   * Get background color for biome
   */
  getBackgroundColor() {
    return this.biomeData[this.currentBiome].backgroundColor;
  }

  /**
   * Get sky color for biome
   */
  getSkyColor() {
    return this.biomeData[this.currentBiome].skyColor;
  }

  /**
   * Get compatible physics sets for biome
   */
  getCompatiblePhysics() {
    return this.biomeData[this.currentBiome].compatiblePhysics;
  }

  /**
   * Get hazards for biome
   */
  getHazards() {
    return this.biomeData[this.currentBiome].hazards;
  }

  /**
   * Check if entity is affected by biome hazard
   */
  checkHazards(entity) {
    const hazards = this.getHazards();
    const affectedHazards = [];

    hazards.forEach(hazard => {
      // Hazard logic would go here
      if (Math.random() < 0.01) { // 1% chance per frame
        affectedHazards.push(hazard);
      }
    });

    return affectedHazards;
  }

  /**
   * Get default weather for biome
   */
  getDefaultWeather() {
    return this.biomeData[this.currentBiome].defaultWeather;
  }

  /**
   * Get random biome
   */
  getRandomBiome() {
    const types = Object.keys(this.biomeData);
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Add listener
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Print biome report
   */
  printReport() {
    console.log('='.repeat(60));
    console.log('🌍 BIOME REPORT');
    console.log('='.repeat(60));
    const info = this.getBiomeInfo();
    console.log(`Current Biome: ${info.name}`);
    console.log(`Description: ${info.description}`);
    console.log(`Hazards: ${info.hazards.join(', ') || 'None'}`);
    console.log(`Flora: ${info.flora}`);
    console.log(`Fauna: ${info.fauna}`);
    console.log('='.repeat(60));
  }
}

/**
 * ============================================================================
 * ENVIRONMENTAL MANAGER - Unified interface for all systems
 * ============================================================================
 */
class EnvironmentalManager {
  constructor() {
    this.timeSystem = new TimeOfDaySystem();
    this.weatherSystem = new WeatherSystem();
    this.biomeSystem = new BiomeSystem();
    this.ambiance = {
      music: null,
      ambiance: null,
      volume: 0.5
    };
  }

  /**
   * Update all environmental systems
   */
  update(dt) {
    this.timeSystem.update(dt);
  }

  /**
   * Get complete environmental state
   */
  getEnvironmentState() {
    return {
      time: this.timeSystem.getTime(),
      weather: this.weatherSystem.getWeatherInfo(),
      biome: this.biomeSystem.getBiomeInfo(),
      brightness: this.timeSystem.getBrightness(),
      colorTint: this.timeSystem.getColorTint()
    };
  }

  /**
   * Set complete environment
   */
  setEnvironment(biomeType, weatherType, hour = 12) {
    this.biomeSystem.setBiome(biomeType);
    this.weatherSystem.setWeather(weatherType, 0.5);
    this.timeSystem.setTime(hour, 0);
    console.log(`🌍 Environment set to: ${biomeType} at ${hour}:00 with ${weatherType}`);
  }

  /**
   * Quick environment presets
   */
  applyPreset(presetName) {
    const presets = {
      morning_field: () => this.setEnvironment('OPEN_FIELD', 'CLEAR', 9),
      noon_city: () => this.setEnvironment('URBAN_CITY', 'CLEAR', 12),
      sunset_beach: () => this.setEnvironment('SHORE', 'CLEAR', 18),
      midnight_forest: () => this.setEnvironment('FOREST', 'CLEAR', 0),
      storm_wasteland: () => this.setEnvironment('APOCALYPTIC_WASTELAND', 'STORMY', 15),
      foggy_tundra: () => this.setEnvironment('TUNDRA', 'SNOWY', 12),
      neon_dystopia: () => this.setEnvironment('FUTURISTIC_DYSTOPIA', 'FOGGY', 20),
      blank_canvas: () => this.setEnvironment('BLANK_WORLD', 'CLEAR', 12)
    };

    if (presets[presetName]) {
      presets[presetName]();
      console.log(`✓ Applied environment preset: ${presetName}`);
      return true;
    }

    console.error(`❌ Preset "${presetName}" not found`);
    return false;
  }

  /**
   * Print complete environmental report
   */
  printReport() {
    console.log('='.repeat(60));
    console.log('🌍 COMPLETE ENVIRONMENTAL REPORT');
    console.log('='.repeat(60));
    
    const state = this.getEnvironmentState();
    console.log(`\n📍 BIOME: ${state.biome.name}`);
    console.log(`   ${state.biome.description}`);
    
    console.log(`\n🕐 TIME: ${state.time.timeString} (${state.time.isNight ? 'Night' : 'Day'})`);
    console.log(`   Brightness: ${(state.brightness * 100).toFixed(0)}%`);
    
    console.log(`\n🌦️ WEATHER: ${state.weather.name}`);
    console.log(`   Intensity: ${(state.weather.intensity * 100).toFixed(0)}%`);
    console.log(`   Visibility: ${(state.weather.visibility * 100).toFixed(0)}%`);
    console.log(`   Temperature: ${state.weather.temperature}°C`);
    
    console.log('='.repeat(60));
  }
}

/**
 * ============================================================================
 * API REFERENCE & USAGE EXAMPLES
 * ============================================================================
 */

const ENVIRONMENT_API_EXAMPLES = `

// TIME SYSTEM
engine.environmentManager.timeSystem.setTime(18, 30);
engine.environmentManager.timeSystem.skipToTime(12);
engine.environmentManager.timeSystem.getTime();
engine.environmentManager.timeSystem.getBrightness();
engine.environmentManager.timeSystem.getColorTint();

// WEATHER SYSTEM
engine.environmentManager.weatherSystem.setWeather('RAINY', 0.8);
engine.environmentManager.weatherSystem.getWeatherInfo();
engine.environmentManager.weatherSystem.listWeathers();
engine.environmentManager.weatherSystem.getRandomWeather();
engine.environmentManager.weatherSystem.applyWeatherEffects(entity);

// BIOME SYSTEM
engine.environmentManager.biomeSystem.setBiome('FOREST');
engine.environmentManager.biomeSystem.getBiomeInfo();
engine.environmentManager.biomeSystem.listBiomes();
engine.environmentManager.biomeSystem.getBackgroundColor();
engine.environmentManager.biomeSystem.getHazards();

// ENVIRONMENTAL MANAGER (ALL SYSTEMS)
engine.environmentManager.setEnvironment('DESERT', 'SANDSTORM', 14);
engine.environmentManager.getEnvironmentState();
engine.environmentManager.applyPreset('sunset_beach');
engine.environmentManager.printReport();

// TIME OF DAY OPTIONS (0-23):
// 0 - Midnight
// 6 - Sunrise
// 9 - Morning
// 12 - Noon
// 15 - Afternoon
// 18 - Sunset
// 21 - Evening
// 23 - Night

// WEATHER OPTIONS:
// CLEAR - Perfect conditions
// RAINY - Rain falling
// SNOWY - Snow covering
// STORMY - Heavy thunderstorm
// FOGGY - Dense fog
// WINDY - Strong winds
// HAIL - Ice pellets
// SANDSTORM - Desert dust

// BIOME OPTIONS:
// OPEN_FIELD, HILLSIDE, OCEAN, SHORE, URBAN_CITY, FUTURISTIC_DYSTOPIA,
// MEDIEVAL_KINGDOM, TUNDRA, BLANK_WORLD, DIGITAL_ENVIRONMENT, LABORATORY,
// APOCALYPTIC_WASTELAND, DESERT, FOREST, FACTORY

// PRESET ENVIRONMENTS:
// 'morning_field', 'noon_city', 'sunset_beach', 'midnight_forest',
// 'storm_wasteland', 'foggy_tundra', 'neon_dystopia', 'blank_canvas'

// LISTENING TO EVENTS:
engine.environmentManager.timeSystem.on('dayChanged', (data) => {
  console.log('New day:', data.day);
});

engine.environmentManager.weatherSystem.on('weatherChanged', (data) => {
  console.log('Weather changed to:', data.weather);
});

engine.environmentManager.biomeSystem.on('biomeChanged', (data) => {
  console.log('Biome changed to:', data.biome);
});

`;

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TimeOfDaySystem,
    WeatherSystem,
    BiomeSystem,
    EnvironmentalManager
  };
}