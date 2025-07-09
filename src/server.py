from flask import Flask
from flask_socketio import SocketIO
import random
import time
import threading

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

def generate_alternative_route(original_route):
    """Generate a realistic alternative route with small variations"""
    if not original_route or len(original_route) < 2:
        return original_route
    
    alternative = []
    variation = random.uniform(-0.01, 0.01)  # Small variation
    
    for i, point in enumerate(original_route):
        # Add more variation in the middle of the route
        progress = i / len(original_route)
        current_variation = variation * (1 + 2 * abs(progress - 0.5))
        
        alternative.append([
            point[0] + current_variation,
            point[1] + current_variation
        ])
    
    return alternative

def calculate_route_distance(route):
    """Calculate approximate distance in km"""
    if len(route) < 2:
        return 0
    
    total = 0
    for i in range(len(route)-1):
        # Simple distance calculation (approximate)
        lat_diff = route[i+1][0] - route[i][0]
        lon_diff = route[i+1][1] - route[i][1]
        total += (lat_diff**2 + lon_diff**2)**0.5 * 111  # Convert to km
    
    return total

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('update_position')
def handle_position(data):
    current_pos = data.get('currentPos')
    destination = data.get('destination')
    current_route = data.get('currentRoute')
    
    if not all([current_pos, destination, current_route]):
        return
    
    # Simulate processing delay
    time.sleep(1)
    
    # Randomly decide whether to suggest a new route (30% chance)
    if random.random() < 0.3:
        alternative_route = generate_alternative_route(current_route)
        current_distance = calculate_route_distance(current_route)
        new_distance = calculate_route_distance(alternative_route)
        
        # Only suggest if at least 5% better
        if new_distance < current_distance * 0.95:
            improvement = {
                'route': alternative_route,
                'distance': new_distance,
                'duration': new_distance * random.uniform(1.1, 1.3),  # Dummy duration
                'co2': new_distance * random.uniform(0.15, 0.25)  # Dummy CO2 (kg)
            }
            
            socketio.emit('better_route', improvement)

if __name__ == '__main__':
    socketio.run(app, port=5000, debug=True)