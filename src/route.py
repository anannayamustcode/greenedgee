"""
Advanced Multi-Factor Route Optimizer
Optimizes routes considering weather, traffic, CO2 emissions, and time
Built for production with performance, accuracy, and scalability in mind.
"""

import asyncio
import aiohttp
import numpy as np
import folium
from typing import List, Tuple, Dict, Optional, Union, NamedTuple
from dataclasses import dataclass, field
from enum import Enum
from concurrent.futures import ThreadPoolExecutor
import json
import time
from functools import lru_cache
import logging
from abc import ABC, abstractmethod

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VehicleType(Enum):
    """Supported vehicle types"""
    CAR = "car"
    TRUCK = "truck"
    BIKE = "bike"
    MOTORCYCLE = "motorcycle"


class FuelType(Enum):
    """Supported fuel types"""
    PETROL = "petrol"
    DIESEL = "diesel"
    ELECTRIC = "electric"
    HYBRID = "hybrid"


class RouteMode(Enum):
    """Mapbox routing modes"""
    DRIVING = "driving"
    DRIVING_TRAFFIC = "driving-traffic"
    CYCLING = "cycling"
    WALKING = "walking"


@dataclass(frozen=True)
class Coordinate:
    """Immutable coordinate representation"""
    lat: float
    lon: float
    
    def __post_init__(self):
        if not (-90 <= self.lat <= 90):
            raise ValueError(f"Invalid latitude: {self.lat}")
        if not (-180 <= self.lon <= 180):
            raise ValueError(f"Invalid longitude: {self.lon}")
    
    def to_tuple(self) -> Tuple[float, float]:
        return (self.lat, self.lon)
    
    def to_mapbox_format(self) -> str:
        return f"{self.lon},{self.lat}"


@dataclass
class RouteSegment:
    """Represents a segment of a route with all metrics"""
    start: Coordinate
    end: Coordinate
    distance_km: float
    duration_min: float
    co2_g: float
    weather_penalty: float
    traffic_penalty: float
    composite_score: float
    waypoints: List[Coordinate] = field(default_factory=list)


@dataclass
class OptimizationWeights:
    """Weights for multi-objective optimization"""
    co2: float = 0.3
    time: float = 0.25
    weather: float = 0.25
    traffic: float = 0.2
    
    def __post_init__(self):
        total = self.co2 + self.time + self.weather + self.traffic
        if abs(total - 1.0) > 1e-6:
            raise ValueError(f"Weights must sum to 1.0, got {total}")


@dataclass
class VehicleConfig:
    """Vehicle configuration with emission factors"""
    vehicle_type: VehicleType
    fuel_type: FuelType
    load_kg: float = 0.0
    fuel_efficiency_penalty: float = 0.001  # per kg of load
    
    # CO2 emissions in grams per km
    BASE_EMISSIONS = {
        (VehicleType.CAR, FuelType.PETROL): 120,
        (VehicleType.CAR, FuelType.DIESEL): 140,
        (VehicleType.CAR, FuelType.ELECTRIC): 50,
        (VehicleType.CAR, FuelType.HYBRID): 85,
        (VehicleType.TRUCK, FuelType.DIESEL): 800,
        (VehicleType.TRUCK, FuelType.PETROL): 750,
        (VehicleType.BIKE, FuelType.PETROL): 80,
        (VehicleType.BIKE, FuelType.DIESEL): 90,
        (VehicleType.MOTORCYCLE, FuelType.PETROL): 90,
    }
    
    @property
    def base_co2_per_km(self) -> float:
        """Calculate base CO2 emissions per km including load penalty"""
        base = self.BASE_EMISSIONS.get((self.vehicle_type, self.fuel_type))
        if base is None:
            raise ValueError(f"Unsupported vehicle-fuel combination: {self.vehicle_type}-{self.fuel_type}")
        
        # Apply load penalty
        return base * (1 + self.fuel_efficiency_penalty * self.load_kg)


class WeatherCondition(Enum):
    """Weather conditions with their impact multipliers"""
    CLEAR = ("Clear", 1.0)
    PARTLY_CLOUDY = ("Partly cloudy", 1.02)
    OVERCAST = ("Overcast", 1.05)
    LIGHT_RAIN = ("Light rain", 1.08)
    MODERATE_RAIN = ("Moderate rain", 1.15)
    HEAVY_RAIN = ("Heavy rain", 1.25)
    FOG = ("Fog", 1.20)
    THUNDERSTORM = ("Thunderstorm", 1.35)
    SNOW = ("Snow", 1.40)
    
    def __init__(self, description: str, multiplier: float):
        self.description = description
        self.multiplier = multiplier


class DataProvider(ABC):
    """Abstract base class for data providers"""
    
    @abstractmethod
    async def fetch_data(self, *args, **kwargs) -> Dict:
        pass


class WeatherProvider(DataProvider):
    """Async weather data provider with caching and error handling"""
    
    WEATHER_CODE_MAP = {
        0: WeatherCondition.CLEAR,
        1: WeatherCondition.CLEAR,
        2: WeatherCondition.PARTLY_CLOUDY,
        3: WeatherCondition.OVERCAST,
        45: WeatherCondition.FOG,
        48: WeatherCondition.FOG,
        51: WeatherCondition.LIGHT_RAIN,
        61: WeatherCondition.LIGHT_RAIN,
        63: WeatherCondition.MODERATE_RAIN,
        65: WeatherCondition.HEAVY_RAIN,
        80: WeatherCondition.MODERATE_RAIN,
        95: WeatherCondition.THUNDERSTORM,
        96: WeatherCondition.THUNDERSTORM,
    }
    
    def __init__(self, cache_ttl: int = 3600):
        self.cache = {}
        self.cache_ttl = cache_ttl
    
    @lru_cache(maxsize=1000)
    def _get_cache_key(self, lat: float, lon: float) -> Tuple[float, float]:
        """Generate cache key with coordinate rounding"""
        return (round(lat, 3), round(lon, 3))
    
    async def fetch_data(self, coord: Coordinate) -> WeatherCondition:
        """Fetch weather data for a coordinate"""
        cache_key = self._get_cache_key(coord.lat, coord.lon)
        current_time = time.time()
        
        # Check cache
        if cache_key in self.cache:
            cached_time, cached_data = self.cache[cache_key]
            if current_time - cached_time < self.cache_ttl:
                return cached_data
        
        # Fetch from API
        url = f"https://api.open-meteo.com/v1/forecast"
        params = {
            'latitude': coord.lat,
            'longitude': coord.lon,
            'current_weather': 'true',
            'timezone': 'auto'
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=10) as response:
                    response.raise_for_status()
                    data = await response.json()
                    
                    weather_code = data['current_weather']['weathercode']
                    condition = self.WEATHER_CODE_MAP.get(weather_code, WeatherCondition.CLEAR)
                    
                    # Cache result
                    self.cache[cache_key] = (current_time, condition)
                    return condition
                    
        except Exception as e:
            logger.warning(f"Weather fetch failed for {coord}: {e}")
            return WeatherCondition.CLEAR
    
    async def get_route_weather_impact(self, coordinates: List[Coordinate], 
                                     sample_points: int = 8) -> float:
        """Calculate average weather impact along route"""
        if not coordinates:
            return 1.0
        
        # Sample points along route
        sampled_coords = self._interpolate_coordinates(coordinates, sample_points)
        
        # Fetch weather for all points concurrently
        weather_tasks = [self.fetch_data(coord) for coord in sampled_coords]
        weather_conditions = await asyncio.gather(*weather_tasks)
        
        # Calculate average impact
        multipliers = [condition.multiplier for condition in weather_conditions]
        return sum(multipliers) / len(multipliers)
    
    @staticmethod
    def _interpolate_coordinates(coords: List[Coordinate], target_count: int) -> List[Coordinate]:
        """Efficiently interpolate coordinates using numpy"""
        if len(coords) <= target_count:
            return coords
        
        coords_array = np.array([(c.lat, c.lon) for c in coords])
        indices = np.linspace(0, len(coords_array) - 1, target_count, dtype=int)
        
        return [Coordinate(lat=coords_array[i, 0], lon=coords_array[i, 1]) for i in indices]


class MapboxProvider(DataProvider):
    """Mapbox routing provider with traffic-aware routing"""
    
    def __init__(self, token: str, mode: RouteMode = RouteMode.DRIVING_TRAFFIC):
        self.token = token
        self.mode = mode
        self.base_url = "https://api.mapbox.com/directions/v5/mapbox"
    
    async def fetch_data(self, coordinates: List[Coordinate], 
                        alternatives: bool = True, 
                        steps: bool = True) -> Dict:
        """Fetch route data from Mapbox"""
        if len(coordinates) < 2:
            raise ValueError("At least 2 coordinates required")
        
        coord_str = ";".join([coord.to_mapbox_format() for coord in coordinates])
        url = f"{self.base_url}/{self.mode.value}/{coord_str}"
        
        params = {
            'access_token': self.token,
            'alternatives': 'true' if alternatives else 'false',
            'steps': 'true' if steps else 'false',
            'overview': 'full',
            'geometries': 'geojson'
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=15) as response:
                    response.raise_for_status()
                    return await response.json()
        except Exception as e:
            logger.error(f"Mapbox API error: {e}")
            raise


class RouteOptimizer:
    """
    Advanced route optimizer with multi-factor scoring
    Generates optimal waypoints between start and end points
    """
    
    def __init__(self, 
                 vehicle_config: VehicleConfig,
                 mapbox_token: str,
                 weather_provider: Optional[WeatherProvider] = None,
                 route_mode: RouteMode = RouteMode.DRIVING_TRAFFIC):
        
        self.vehicle_config = vehicle_config
        self.mapbox_provider = MapboxProvider(mapbox_token, route_mode)
        self.weather_provider = weather_provider or WeatherProvider()
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def optimize_route(self, 
                           start: Coordinate,
                           end: Coordinate,
                           intermediate_points: Optional[List[Coordinate]] = None,
                           weights: OptimizationWeights = OptimizationWeights(),
                           num_waypoints: int = 10,
                           max_alternatives: int = 3) -> List[Coordinate]:
        """
        Find optimal route with waypoints considering all factors
        
        Args:
            start: Starting coordinate
            end: Ending coordinate
            intermediate_points: Optional intermediate waypoints
            weights: Optimization weights for different factors
            num_waypoints: Number of waypoints to return
            max_alternatives: Maximum route alternatives to consider
            
        Returns:
            List of optimized waypoints from start to end
        """
        try:
            # Build coordinate list
            coordinates = [start]
            if intermediate_points:
                coordinates.extend(intermediate_points)
            coordinates.append(end)
            
            # Get route alternatives
            route_data = await self.mapbox_provider.fetch_data(coordinates, alternatives=True)
            
            # Evaluate all route alternatives
            route_evaluations = []
            for i, route in enumerate(route_data.get('routes', [])[:max_alternatives]):
                evaluation = await self._evaluate_route(route, weights)
                evaluation['route_index'] = i
                route_evaluations.append(evaluation)
            
            if not route_evaluations:
                raise ValueError("No valid routes found")
            
            # Select best route
            best_route = min(route_evaluations, key=lambda x: x['composite_score'])
            
            # Extract and interpolate waypoints
            waypoints = self._extract_waypoints(route_data['routes'][best_route['route_index']], 
                                              num_waypoints)
            
            logger.info(f"Optimized route: {best_route['distance_km']:.2f}km, "
                       f"Score: {best_route['composite_score']:.4f}")
            
            return waypoints
            
        except Exception as e:
            logger.error(f"Route optimization failed: {e}")
            raise
    
    async def _evaluate_route(self, route: Dict, weights: OptimizationWeights) -> Dict:
        """Evaluate a single route considering all factors"""
        # Extract basic metrics
        distance_km = route['distance'] / 1000
        duration_min = route['duration'] / 60
        
        # Extract coordinates from geometry
        coordinates = [
            Coordinate(lat=coord[1], lon=coord[0]) 
            for coord in route['geometry']['coordinates']
        ]
        
        # Calculate CO2 emissions
        base_co2 = distance_km * self.vehicle_config.base_co2_per_km
        
        # Get weather impact
        weather_impact = await self.weather_provider.get_route_weather_impact(coordinates)
        
        # Calculate traffic penalty (from duration vs distance ratio)
        expected_duration = distance_km * 1.2  # ~50 km/h average
        traffic_penalty = max(1.0, duration_min / expected_duration)
        
        # Apply penalties
        adjusted_co2 = base_co2 * weather_impact
        adjusted_time = duration_min * traffic_penalty
        
        # Normalize metrics (0-1 scale)
        normalized_metrics = self._normalize_metrics({
            'co2': adjusted_co2,
            'time': adjusted_time,
            'weather': weather_impact,
            'traffic': traffic_penalty
        })
        
        # Calculate composite score
        composite_score = (
            normalized_metrics['co2'] * weights.co2 +
            normalized_metrics['time'] * weights.time +
            normalized_metrics['weather'] * weights.weather +
            normalized_metrics['traffic'] * weights.traffic
        )
        
        return {
            'distance_km': round(distance_km, 2),
            'duration_min': round(duration_min, 2),
            'co2_g': round(adjusted_co2, 2),
            'weather_impact': round(weather_impact, 3),
            'traffic_penalty': round(traffic_penalty, 3),
            'composite_score': round(composite_score, 4),
            'coordinates': coordinates
        }
    
    def _normalize_metrics(self, metrics: Dict[str, float]) -> Dict[str, float]:
        """Normalize metrics to 0-1 scale using reasonable baselines"""
        baselines = {
            'co2': 200.0,      # grams per km baseline
            'time': 120.0,     # minutes baseline
            'weather': 1.5,    # weather impact baseline
            'traffic': 2.0     # traffic penalty baseline
        }
        
        return {
            key: min(value / baselines[key], 1.0) 
            for key, value in metrics.items()
        }
    
    def _extract_waypoints(self, route: Dict, num_waypoints: int) -> List[Coordinate]:
        """Extract evenly spaced waypoints from route geometry"""
        coordinates = route['geometry']['coordinates']
        
        if len(coordinates) <= num_waypoints:
            return [Coordinate(lat=coord[1], lon=coord[0]) for coord in coordinates]
        
        # Calculate indices for even spacing
        indices = np.linspace(0, len(coordinates) - 1, num_waypoints, dtype=int)
        
        return [
            Coordinate(lat=coordinates[i][1], lon=coordinates[i][0]) 
            for i in indices
        ]
    
    def visualize_route(self, waypoints: List[Coordinate], 
                       route_info: Optional[Dict] = None) -> folium.Map:
        """Create interactive visualization of optimized route"""
        if not waypoints:
            raise ValueError("No waypoints to visualize")
        
        # Center map on route midpoint
        center_lat = sum(wp.lat for wp in waypoints) / len(waypoints)
        center_lon = sum(wp.lon for wp in waypoints) / len(waypoints)
        
        m = folium.Map(location=[center_lat, center_lon], zoom_start=10)
        
        # Add route line
        route_coords = [wp.to_tuple() for wp in waypoints]
        folium.PolyLine(
            route_coords,
            color='blue',
            weight=4,
            opacity=0.8,
            popup=f"Optimized Route: {route_info.get('distance_km', 'N/A')} km" if route_info else None
        ).add_to(m)
        
        # Add start and end markers
        folium.Marker(
            waypoints[0].to_tuple(),
            popup="Start",
            icon=folium.Icon(color='green', icon='play')
        ).add_to(m)
        
        folium.Marker(
            waypoints[-1].to_tuple(),
            popup="End",
            icon=folium.Icon(color='red', icon='stop')
        ).add_to(m)
        
        # Add intermediate waypoint markers
        for i, wp in enumerate(waypoints[1:-1], 1):
            folium.CircleMarker(
                wp.to_tuple(),
                radius=5,
                popup=f"Waypoint {i}",
                color='orange',
                fill=True
            ).add_to(m)
        
        return m


# Factory function for easy initialization
def create_route_optimizer(vehicle_type: str, 
                         fuel_type: str,
                         mapbox_token: str,
                         load_kg: float = 0.0,
                         route_mode: str = "driving-traffic") -> RouteOptimizer:
    """Factory function to create RouteOptimizer with simplified parameters"""
    
    vehicle_config = VehicleConfig(
        vehicle_type=VehicleType(vehicle_type.lower()),
        fuel_type=FuelType(fuel_type.lower()),
        load_kg=load_kg
    )
    
    return RouteOptimizer(
        vehicle_config=vehicle_config,
        mapbox_token=mapbox_token,
        route_mode=RouteMode(route_mode)  # <-- Use the original string
    )


# Example usage and testing
async def main():
    """Example usage of the route optimizer"""
    
    # Get Mapbox token from environment or user input
    import os
    from dotenv import load_dotenv
    load_dotenv()
    mapbox_token = os.getenv('MAPBOX_API_KEY')
    if not mapbox_token:
        mapbox_token = input("Enter your Mapbox token: ").strip()
        if not mapbox_token:
            print("❌ Mapbox token is required!")
            return
    
    # Initialize optimizer
    optimizer = create_route_optimizer(
        vehicle_type="truck",
        fuel_type="diesel",
        mapbox_token=mapbox_token,
        load_kg=1000
    )
    
    # Define start and end points (using coordinates in India near your location)
    start = Coordinate(lat=18.6298, lon=73.7997)  # Pimpri-Chinchwad
    end = Coordinate(lat=18.5204, lon=73.8567)    # Pune
    
    # Set optimization weights
    weights = OptimizationWeights(
        co2=0.4,      # Prioritize low emissions
        time=0.3,     # Consider time efficiency
        weather=0.2,  # Account for weather conditions
        traffic=0.1   # Minor traffic consideration
    )
    
    try:
        print("🚀 Starting route optimization...")
        print(f"📍 From: {start.lat:.4f}, {start.lon:.4f}")
        print(f"📍 To: {end.lat:.4f}, {end.lon:.4f}")
        
        # Optimize route
        waypoints = await optimizer.optimize_route(
            start=start,
            end=end,
            weights=weights,
            num_waypoints=12
        )
        
        print(f"\n✅ Optimized route with {len(waypoints)} waypoints:")
        for i, wp in enumerate(waypoints):
            print(f"  {i+1:2d}. {wp.lat:.4f}, {wp.lon:.4f}")
        
        # Visualize route
        print("\n🗺️  Creating route visualization...")
        map_viz = optimizer.visualize_route(waypoints)
        map_viz.save("optimized_route.html")
        print("📊 Route saved to 'optimized_route.html' - open it in your browser!")
        
    except Exception as e:
        logger.error(f"❌ Optimization failed: {e}")
        print(f"Error details: {e}")


def test_simple_route():
    """Simple test without async for quick validation"""
    print("🧪 Testing route optimizer components...")
    
    # Test coordinate creation
    try:
        coord = Coordinate(lat=18.6298, lon=73.7997)
        print(f"✅ Coordinate creation: {coord}")
    except Exception as e:
        print(f"❌ Coordinate test failed: {e}")
        return
    
    # Test vehicle config
    try:
        config = VehicleConfig(
            vehicle_type=VehicleType.TRUCK,
            fuel_type=FuelType.DIESEL,
            load_kg=1000
        )
        print(f"✅ Vehicle config: {(config.base_co2_per_km):.2f} g/km")
    except Exception as e:
        print(f"❌ Vehicle config test failed: {e}")
        return
    
    print("🎉 Basic tests passed!")


if __name__ == "__main__":
    
    # Run simple tests first
    test_simple_route()
    
    # Ask user what they want to do
    
    choice = input("\nEnter your choice (1 or 2): ").strip()
    
    if choice == "1":
        print("\n🔄 Running full optimization...")
        asyncio.run(main())
    else:
        print("👋 Goodbye!")