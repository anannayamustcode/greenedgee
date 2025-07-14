from flask import Flask, request, jsonify
import pandas as pd
from prophet import Prophet
import plotly.express as px
import plotly.graph_objects as go
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import base64
import io
import warnings
import numpy as np
from datetime import datetime, timedelta
import os
import sys
import requests
from flask import render_template_string, jsonify, current_app
import json
warnings.filterwarnings("ignore")
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

import asyncio
from concurrent.futures import ThreadPoolExecutor

# Load and preprocess your Walmart data
DATA_PATH = "walmart_data.xlsx"

# Global variable to store data
df = None

def load_data():
    """Load data with error handling"""
    global df
    try:
        if not os.path.exists(DATA_PATH):
            print(f"ERROR: Data file {DATA_PATH} not found!")
            print(f"Current directory: {os.getcwd()}")
            print(f"Files in directory: {os.listdir('.')}")
            return False
        
        print(f"Loading data from {DATA_PATH}...")
        df = pd.read_excel(DATA_PATH, parse_dates=["date"])
        print(f"Data loaded successfully! Shape: {df.shape}")
        
        # Enhanced preprocessing
        df["stockout"] = df["stockout"].map({"Yes": 1, "No": 0})
        df["is_holiday"] = df["holiday"].notna().astype(int)
        df = pd.get_dummies(df, columns=["promotion"], prefix="promo")

        # Create additional features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        print("Data preprocessing completed successfully!")
        return True
    except Exception as e:
        print(f"ERROR loading data: {str(e)}")
        return False

# Try to load data on startup
if not load_data():
    print("Failed to load data. Server will start but endpoints may not work.")

# Category → Items dictionary
category_items = {
    "Grocery & Food": [
        "Dry groceries", "Fresh produce", "Dairy", "Meat & seafood", "Frozen foods",
        "Snacks", "Beverages", "Baby food", "Condiments & sauces", "Bakery"
    ],
    "Health & Personal Care": [
        "Bath & shower", "Hair care", "Oral care", "Skincare", "Feminine hygiene",
        "First aid & medical", "Vitamins & supplements"
    ],
    "Household Essentials": [
        "Cleaning supplies", "Paper products", "Laundry", "Trash & storage", "Pest control"
    ],
    "Home & Kitchen": [
        "Cookware", "Tableware", "Appliances", "Home décor", "Furniture"
    ],
    "Clothing & Footwear": [
        "Men's clothing", "Women's clothing", "Kids' clothing", "Footwear"
    ],
    "Electronics": [
        "Mobiles & tablets", "TV & audio", "Computers & accessories", "Gaming consoles",
        "Home electronics (mixers, vacuum cleaners)", "Cameras"
    ],
    "Stationery & Office": [
        "School stationery", "Notebooks", "Pens & pencils", "Art supplies", "Printer paper"
    ],
    "Toys & Baby Care": [
        "Soft toys", "Board games", "Baby diapers", "Baby wipes", "Educational toys"
    ],
    "Automotive": [
        "Engine oil", "Car cleaning", "Car air fresheners", "Bike accessories"
    ],
    "Gardening & Outdoor": [
        "Plant seeds", "Fertilizers", "Garden tools", "Outdoor furniture"
    ],
    "Sports & Fitness": [
        "Fitness equipment", "Sports gear"
    ]
}

def get_category_group(category):
    """Find which main category group a subcategory belongs to"""
    for group, items in category_items.items():
        if category in items:
            return group
    return "Miscellaneous"

@app.route("/")
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "Server is running",
        "data_loaded": df is not None,
        "endpoints": ["/forecast", "/forecast/table", "/plot/demand/<store_id>"]
    })

@app.route("/forecast", methods=["POST"])
def forecast_restock_categories():
    """
    Enhanced forecasting endpoint that ALWAYS returns at least 10 categories with items and quantities
    """
    try:
        if df is None:
            return jsonify({"error": "Data not loaded. Please check server logs."}), 500
        
        content = request.get_json()
        if not content:
            return jsonify({"error": "No JSON data provided"}), 400
            
        if "store_id" not in content:
            return jsonify({"error": "store_id is required"}), 400
            
        store_id = int(content["store_id"])
        
        # Optional parameters
        forecast_days = content.get("forecast_days", 30)
        min_categories = content.get("min_categories", 10)

        store_df = df[df["store_id"] == store_id].copy()
        if store_df.empty:
            return jsonify({"error": f"No data found for store {store_id}"}), 404

        # Simple grouping to get historical data
        grouped = store_df.groupby(["category", "date"]).agg({
            "quantity_ordered": "sum"
        }).reset_index()

        # Calculate demand statistics for each category
        category_stats = {}
        for category in grouped["category"].unique():
            cat_df = grouped[grouped["category"] == category].copy()
            
            recent_data = cat_df.tail(30)  # Last 30 data points
            avg_demand = float(recent_data["quantity_ordered"].mean())
            min_demand = float(recent_data["quantity_ordered"].min())
            max_demand = float(recent_data["quantity_ordered"].max())
            std_demand = float(recent_data["quantity_ordered"].std())
            
            # Calculate restock score (lower = needs more restocking)
            restock_score = avg_demand + (std_demand * 0.5)
            
            category_stats[category] = {
                "avg_demand": avg_demand,
                "min_demand": min_demand,
                "max_demand": max_demand,
                "std_demand": std_demand,
                "restock_score": restock_score
            }

        # Sort categories by restock score (lowest first = highest priority)
        sorted_categories = sorted(category_stats.items(), key=lambda x: x[1]["restock_score"])

        # Generate restock recommendations
        restock_predictions = []
        
        for i, (category, stats) in enumerate(sorted_categories):
            if len(restock_predictions) >= min_categories:
                break
                
            # Find the main category group
            category_group = get_category_group(category)
            items_list = category_items.get(category_group, ["General stock"])
            
            # Calculate quantities for each item
            base_quantity = max(50, int(stats["avg_demand"] * 0.8))  # At least 50 units
            items_with_quantities = []
            
            for item in items_list:
                # Vary quantity based on item type and demand
                if "dairy" in item.lower() or "fresh" in item.lower():
                    quantity = int(base_quantity * 0.6)  # Less for perishables
                elif "cleaning" in item.lower() or "paper" in item.lower():
                    quantity = int(base_quantity * 1.2)  # More for essentials
                else:
                    quantity = base_quantity
                
                items_with_quantities.append({
                    "item_name": item,
                    "quantity_to_order": int(max(20, quantity))  # Minimum 20 units, ensure int
                })
            
            # Determine priority
            if i < 3:
                priority = "High"
            elif i < 6:
                priority = "Medium"
            else:
                priority = "Low"
            
            # Calculate stockout risk based on demand variability
            stockout_risk = min(95, max(10, 100 - (stats["restock_score"] / 10)))
            
            restock_predictions.append({
                "category": category,
                "category_group": category_group,
                "items_to_order": items_with_quantities,
                "avg_predicted_demand": float(round(stats["avg_demand"], 2)),
                "min_predicted_demand": float(round(stats["min_demand"], 2)),
                "max_predicted_demand": float(round(stats["max_demand"], 2)),
                "stockout_risk_percentage": float(round(stockout_risk, 2)),
                "priority": priority,
                "total_items": int(len(items_with_quantities))
            })

        # If we still don't have enough categories, add more with fallback logic
        if len(restock_predictions) < min_categories:
            remaining_categories = [cat for cat in category_stats.keys() 
                                 if cat not in [item["category"] for item in restock_predictions]]
            
            for category in remaining_categories:
                if len(restock_predictions) >= min_categories:
                    break
                    
                category_group = get_category_group(category)
                items_list = category_items.get(category_group, ["General stock"])
                
                # Default quantities for fallback categories
                items_with_quantities = []
                for item in items_list:
                    items_with_quantities.append({
                        "item_name": item,
                        "quantity_to_order": 30  # Default quantity
                    })
                
                stats = category_stats[category]
                
                restock_predictions.append({
                    "category": category,
                    "category_group": category_group,
                    "items_to_order": items_with_quantities,
                    "avg_predicted_demand": float(round(stats["avg_demand"], 2)),
                    "min_predicted_demand": float(round(stats["min_demand"], 2)),
                    "max_predicted_demand": float(round(stats["max_demand"], 2)),
                    "stockout_risk_percentage": 25.0,  # Default risk
                    "priority": "Low",
                    "total_items": int(len(items_with_quantities))
                })

        # Ensure exactly min_categories results
        restock_predictions = restock_predictions[:min_categories]

        return jsonify({
            "store_id": int(store_id),
            "forecast_period_days": int(forecast_days),
            "categories_to_restock": restock_predictions,
            "total_restock_count": int(len(restock_predictions)),
            "high_priority_count": int(len([x for x in restock_predictions if x["priority"] == "High"])),
            "medium_priority_count": int(len([x for x in restock_predictions if x["priority"] == "Medium"])),
            "low_priority_count": int(len([x for x in restock_predictions if x["priority"] == "Low"])),
            "total_items_to_order": int(sum([x["total_items"] for x in restock_predictions]))
        })

    except Exception as e:
        print(f"ERROR in forecast endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/forecast/table", methods=["POST"])
def forecast_table():
    """
    Returns forecast data in a nicely formatted table (DataFrame)
    """
    try:
        if df is None:
            return jsonify({"error": "Data not loaded. Please check server logs."}), 500
        
        content = request.get_json()
        if not content:
            return jsonify({"error": "No JSON data provided"}), 400
            
        if "store_id" not in content:
            return jsonify({"error": "store_id is required"}), 400
            
        store_id = int(content["store_id"])
        
        # Optional parameters
        forecast_days = content.get("forecast_days", 30)
        min_categories = content.get("min_categories", 10)

        store_df = df[df["store_id"] == store_id].copy()
        if store_df.empty:
            return jsonify({"error": f"No data found for store {store_id}"}), 404

        # Simple grouping to get historical data
        grouped = store_df.groupby(["category", "date"]).agg({
            "quantity_ordered": "sum"
        }).reset_index()

        # Calculate demand statistics for each category
        category_stats = {}
        for category in grouped["category"].unique():
            cat_df = grouped[grouped["category"] == category].copy()
            
            recent_data = cat_df.tail(30)  # Last 30 data points
            avg_demand = float(recent_data["quantity_ordered"].mean())
            min_demand = float(recent_data["quantity_ordered"].min())
            max_demand = float(recent_data["quantity_ordered"].max())
            std_demand = float(recent_data["quantity_ordered"].std())
            
            # Calculate restock score (lower = needs more restocking)
            restock_score = avg_demand + (std_demand * 0.5)
            
            category_stats[category] = {
                "avg_demand": avg_demand,
                "min_demand": min_demand,
                "max_demand": max_demand,
                "std_demand": std_demand,
                "restock_score": restock_score
            }

        # Sort categories by restock score (lowest first = highest priority)
        sorted_categories = sorted(category_stats.items(), key=lambda x: x[1]["restock_score"])

        # Create DataFrame for table display
        table_data = []
        
        for i, (category, stats) in enumerate(sorted_categories):
            if len(table_data) >= min_categories:
                break
                
            # Find the main category group
            category_group = get_category_group(category)
            items_list = category_items.get(category_group, ["General stock"])
            
            # Calculate total quantity needed for this category
            base_quantity = max(50, int(stats["avg_demand"] * 0.8))
            total_quantity = 0
            
            for item in items_list:
                if "dairy" in item.lower() or "fresh" in item.lower():
                    quantity = int(base_quantity * 0.6)
                elif "cleaning" in item.lower() or "paper" in item.lower():
                    quantity = int(base_quantity * 1.2)
                else:
                    quantity = base_quantity
                total_quantity += max(20, quantity)
            
            # Determine priority
            if i < 3:
                priority = "🔴 High"
            elif i < 6:
                priority = "🟡 Medium"
            else:
                priority = "🟢 Low"
            
            # Calculate stockout risk
            stockout_risk = min(95, max(10, 100 - (stats["restock_score"] / 10)))
            
            table_data.append({
                "Priority": priority,
                "Category": category,
                "Category Group": category_group,
                "Avg Demand": f"{stats['avg_demand']:.1f}",
                "Min Demand": f"{stats['min_demand']:.1f}",
                "Max Demand": f"{stats['max_demand']:.1f}",
                "Stockout Risk": f"{stockout_risk:.1f}%",
                "Total Items": len(items_list),
                "Total Quantity": total_quantity,
                "Top Items": ", ".join(items_list[:3]) + ("..." if len(items_list) > 3 else "")
            })

        # Create DataFrame
        forecast_df = pd.DataFrame(table_data)
        
        # Create summary statistics
        summary_stats = {
            "Store ID": store_id,
            "Forecast Period": f"{forecast_days} days",
            "Total Categories": len(table_data),
            "High Priority": len([x for x in table_data if "High" in x["Priority"]]),
            "Medium Priority": len([x for x in table_data if "Medium" in x["Priority"]]),
            "Low Priority": len([x for x in table_data if "Low" in x["Priority"]]),
            "Total Items to Order": sum([x["Total Items"] for x in table_data]),
            "Total Quantity to Order": sum([x["Total Quantity"] for x in table_data])
        }
        
        # Convert DataFrame to HTML table for better display
        table_html = forecast_df.to_html(index=False, classes="table table-striped table-hover", escape=False)
        
        # Create a formatted string representation
        table_string = f"""
{'='*80}
WALMART STORE RESTOCK FORECAST - STORE {store_id}
{'='*80}

SUMMARY:
{'-'*40}
Forecast Period: {forecast_days} days
Total Categories: {len(table_data)}
High Priority: {summary_stats['High Priority']} | Medium Priority: {summary_stats['Medium Priority']} | Low Priority: {summary_stats['Low Priority']}
Total Items to Order: {summary_stats['Total Items to Order']}
Total Quantity to Order: {summary_stats['Total Quantity to Order']:,}

DETAILED FORECAST:
{'-'*40}
{forecast_df.to_string(index=False)}
{'='*80}
"""
        
        return jsonify({
            "store_id": store_id,
            "summary": summary_stats,
            "table_html": table_html,
            "table_string": table_string,
            "dataframe_json": forecast_df.to_dict('records')
        })

    except Exception as e:
        print(f"ERROR in forecast table endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/plot/demand/<int:store_id>")
def plot_demand_trends(store_id):
    """
    Enhanced plot endpoint showing high-demand categories
    """
    if df is None:
        return "Data not loaded", 500
        
    store_df = df[df["store_id"] == store_id].copy()
    if store_df.empty:
        return "No data for store", 404

    # Group by category + date
    grouped = store_df.groupby(["category", "date"])["quantity_ordered"].sum().reset_index()

    # Compute average demand per category
    category_means = grouped.groupby("category")["quantity_ordered"].mean()

    # Filter high-demand categories (avg > 400)
    high_demand = category_means[category_means > 400]

    if high_demand.empty:
        return "No high-demand categories for this store", 200

    # Create enhanced plot
    fig, ax = plt.subplots(figsize=(12, 8))
    bars = high_demand.sort_values().plot(kind='barh', ax=ax, color='skyblue', edgecolor='navy')

    ax.set_title(f"Average Demand of High-Demand Categories - Store {store_id}", fontsize=16, fontweight='bold')
    ax.set_xlabel("Average Quantity Ordered", fontsize=12)
    ax.set_ylabel("Category", fontsize=12)
    ax.grid(axis='x', linestyle='--', alpha=0.7)

    # Add value labels on bars
    for i, (category, value) in enumerate(high_demand.sort_values().items()):
        ax.text(value + 10, i, f'{value:.0f}', va='center', fontsize=10)

    # Export plot to image
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format="png", dpi=150, bbox_inches='tight')
    buf.seek(0)
    plt.close()

    return app.response_class(buf.getvalue(), mimetype="image/png")

@app.route("/optimize-route", methods=["POST"])
def optimize_delivery_route():
    """
    Enhanced route optimization endpoint for Walmart delivery optimization
    Returns detailed waypoints with comprehensive route metrics
    """
    try:
        content = request.get_json()
        if not content:
            return jsonify({"error": "No JSON data provided"}), 400
        
        # Required parameters
        required_fields = ["start_lat", "start_lon", "end_lat", "end_lon"]
        for field in required_fields:
            if field not in content:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Extract coordinates
        start_lat = float(content["start_lat"])
        start_lon = float(content["start_lon"])
        end_lat = float(content["end_lat"])
        end_lon = float(content["end_lon"])
        
        # Get Mapbox token from environment variable
        mapbox_token = os.getenv('MAPBOX_API_KEY')
        if not mapbox_token:
            return jsonify({"error": "Mapbox API key not found in environment variables"}), 500
        
        # Optional parameters with defaults
        vehicle_type = content.get("vehicle_type", "truck")
        fuel_type = content.get("fuel_type", "diesel")
        load_kg = float(content.get("load_kg", 1000))
        num_waypoints = int(content.get("num_waypoints", 12))  # Increased default
        
        # Optimization weights
        weights_data = content.get("weights", {})
        co2_weight = float(weights_data.get("co2", 0.5))
        time_weight = float(weights_data.get("time", 0.2))
        weather_weight = float(weights_data.get("weather", 0.1))
        traffic_weight = float(weights_data.get("traffic", 0.2))
        
        # Import route optimization components
        from route import (
            create_route_optimizer, 
            Coordinate, 
            OptimizationWeights, 
            VehicleType, 
            FuelType,
            WeatherCondition
        )
        
        # Create coordinates
        start_coord = Coordinate(lat=start_lat, lon=start_lon)
        end_coord = Coordinate(lat=end_lat, lon=end_lon)
        
        # Handle intermediate points if provided
        intermediate_points = []
        if "intermediate_points" in content:
            for point in content["intermediate_points"]:
                intermediate_points.append(
                    Coordinate(lat=float(point["lat"]), lon=float(point["lon"]))
                )
        
        # Create optimizer
        optimizer = create_route_optimizer(
            vehicle_type=vehicle_type,
            fuel_type=fuel_type,
            mapbox_token=mapbox_token,
            load_kg=load_kg
        )
        
        # Create optimization weights
        weights = OptimizationWeights(
            co2=co2_weight,
            time=time_weight,
            weather=weather_weight,
            traffic=traffic_weight
        )
        
        # Run optimization in async context
        def run_optimization():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(
                    optimizer.optimize_route(
                        start=start_coord,
                        end=end_coord,
                        intermediate_points=intermediate_points if intermediate_points else None,
                        weights=weights,
                        num_waypoints=num_waypoints
                    )
                )
            finally:
                loop.close()
        
        # Execute optimization in thread pool
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(run_optimization)
            waypoints = future.result(timeout=45)  # Increased timeout
        
        # Enhanced waypoint processing with detailed metrics
        waypoints_data = []
        segment_details = []
        total_distance = 0
        total_estimated_time = 0
        total_co2 = 0
        
        for i, wp in enumerate(waypoints):
            # Basic waypoint info
            waypoint_info = {
                "sequence": i + 1,
                "lat": round(wp.lat, 6),
                "lon": round(wp.lon, 6),
                "is_start": i == 0,
                "is_end": i == len(waypoints) - 1,
                "waypoint_type": "start" if i == 0 else "end" if i == len(waypoints) - 1 else "intermediate"
            }
            
            # Calculate segment details if not the last waypoint
            if i < len(waypoints) - 1:
                next_wp = waypoints[i + 1]
                
                # Calculate distance between current and next waypoint
                segment_distance = calculate_haversine_distance(
                    wp.lat, wp.lon, next_wp.lat, next_wp.lon
                )
                
                # Estimate time for this segment (assuming average speed)
                avg_speed_kmh = 45  # km/h for delivery trucks
                segment_time_hours = segment_distance / avg_speed_kmh
                segment_time_minutes = segment_time_hours * 60
                
                # Calculate CO2 for this segment
                segment_co2 = segment_distance * optimizer.vehicle_config.base_co2_per_km
                
                # Add to totals
                total_distance += segment_distance
                total_estimated_time += segment_time_minutes
                total_co2 += segment_co2
                
                # Segment details
                segment_info = {
                    "segment_id": i + 1,
                    "from_waypoint": i + 1,
                    "to_waypoint": i + 2,
                    "distance_km": round(segment_distance, 3),
                    "estimated_time_minutes": round(segment_time_minutes, 2),
                    "co2_emissions_grams": round(segment_co2, 2),
                    "average_speed_kmh": avg_speed_kmh,
                    "from_coordinates": {"lat": wp.lat, "lon": wp.lon},
                    "to_coordinates": {"lat": next_wp.lat, "lon": next_wp.lon}
                }
                
                segment_details.append(segment_info)
                
                # Add segment info to waypoint
                waypoint_info["next_segment"] = {
                    "distance_to_next_km": round(segment_distance, 3),
                    "time_to_next_minutes": round(segment_time_minutes, 2),
                    "co2_to_next_grams": round(segment_co2, 2)
                }
            
            waypoints_data.append(waypoint_info)
        
        # Calculate route efficiency metrics
        direct_distance = calculate_haversine_distance(
            start_lat, start_lon, end_lat, end_lon
        )
        
        route_efficiency = (direct_distance / total_distance) * 100 if total_distance > 0 else 0
        
        # Enhanced response with comprehensive waypoint data
        response = {
            "status": "success",
            "optimization_summary": {
                "total_waypoints": len(waypoints),
                "total_segments": len(segment_details),
                "total_distance_km": round(total_distance, 2),
                "direct_distance_km": round(direct_distance, 2),
                "route_efficiency_percent": round(route_efficiency, 1),
                "total_estimated_time_hours": round(total_estimated_time / 60, 2),
                "total_estimated_time_minutes": round(total_estimated_time, 1),
                "total_co2_emissions_grams": round(total_co2, 2),
                "total_co2_emissions_kg": round(total_co2 / 1000, 3),
                "average_speed_kmh": round(total_distance / (total_estimated_time / 60), 1) if total_estimated_time > 0 else 0,
                "vehicle_configuration": {
                    "vehicle_type": vehicle_type,
                    "fuel_type": fuel_type,
                    "load_kg": load_kg,
                    "co2_per_km": round(optimizer.vehicle_config.base_co2_per_km, 2)
                }
            },
            "route_waypoints": waypoints_data,
            "segment_details": segment_details,
            "optimization_weights": {
                "co2": co2_weight,
                "time": time_weight,
                "weather": weather_weight,
                "traffic": traffic_weight
            },
            "route_visualization": {
                "mapbox_compatible": True,
                "center_lat": round(sum(wp.lat for wp in waypoints) / len(waypoints), 6),
                "center_lon": round(sum(wp.lon for wp in waypoints) / len(waypoints), 6),
                "bounds": {
                    "north": round(max(wp.lat for wp in waypoints), 6),
                    "south": round(min(wp.lat for wp in waypoints), 6),
                    "east": round(max(wp.lon for wp in waypoints), 6),
                    "west": round(min(wp.lon for wp in waypoints), 6)
                }
            },
            "delivery_recommendations": {
                "estimated_fuel_cost": round(total_distance * 0.08, 2),  # Assuming ₹0.08 per km
                "recommended_departure_time": "Consider traffic patterns",
                "weather_advisory": "Check weather conditions along route",
                "optimization_score": "Route optimized for multi-factor efficiency"
            }
        }
        
        return jsonify(response)
        
    except asyncio.TimeoutError:
        return jsonify({"error": "Route optimization timed out"}), 408
    except ValueError as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400
    except Exception as e:
        print(f"ERROR in route optimization: {str(e)}")
        return jsonify({"error": f"Route optimization failed: {str(e)}"}), 500


def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1_rad = lat1 * np.pi / 180
    lat2_rad = lat2 * np.pi / 180
    dlat = (lat2 - lat1) * np.pi / 180
    dlon = (lon2 - lon1) * np.pi / 180
    
    # Haversine formula
    a = (np.sin(dlat/2) ** 2 + 
         np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(dlon/2) ** 2)
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
    
    # Earth's radius in kilometers
    earth_radius_km = 6371
    distance = earth_radius_km * c
    
    return distance


# Additional endpoint for getting detailed route analysis
@app.route("/route-analysis", methods=["POST"])
def analyze_route_performance():
    """
    Analyze an existing route and provide detailed performance metrics
    """
    try:
        content = request.get_json()
        if not content or "waypoints" not in content:
            return jsonify({"error": "Waypoints data required"}), 400
        
        waypoints_data = content["waypoints"]
        vehicle_type = content.get("vehicle_type", "truck")
        fuel_type = content.get("fuel_type", "diesel")
        load_kg = float(content.get("load_kg", 1000))
        
        # Import route components
        from route import VehicleConfig, VehicleType, FuelType
        
        # Create vehicle config for analysis
        vehicle_config = VehicleConfig(
            vehicle_type=VehicleType(vehicle_type.lower()),
            fuel_type=FuelType(fuel_type.lower()),
            load_kg=load_kg
        )
        
        # Analyze route performance
        total_distance = 0
        total_co2 = 0
        segments = []
        
        for i in range(len(waypoints_data) - 1):
            current = waypoints_data[i]
            next_wp = waypoints_data[i + 1]
            
            # Calculate segment distance
            segment_distance = calculate_haversine_distance(
                current["lat"], current["lon"],
                next_wp["lat"], next_wp["lon"]
            )
            
            # Calculate segment metrics
            segment_co2 = segment_distance * vehicle_config.base_co2_per_km
            segment_time = segment_distance / 45 * 60  # minutes
            
            total_distance += segment_distance
            total_co2 += segment_co2
            
            segments.append({
                "segment": i + 1,
                "distance_km": round(segment_distance, 3),
                "co2_grams": round(segment_co2, 2),
                "estimated_time_minutes": round(segment_time, 2),
                "from": {"lat": current["lat"], "lon": current["lon"]},
                "to": {"lat": next_wp["lat"], "lon": next_wp["lon"]}
            })
        
        # Calculate efficiency metrics
        start = waypoints_data[0]
        end = waypoints_data[-1]
        direct_distance = calculate_haversine_distance(
            start["lat"], start["lon"], end["lat"], end["lon"]
        )
        
        efficiency = (direct_distance / total_distance) * 100 if total_distance > 0 else 0
        
        analysis = {
            "route_summary": {
                "total_waypoints": len(waypoints_data),
                "total_distance_km": round(total_distance, 2),
                "direct_distance_km": round(direct_distance, 2),
                "route_efficiency_percent": round(efficiency, 1),
                "total_co2_emissions_grams": round(total_co2, 2),
                "estimated_total_time_hours": round(total_distance / 45, 2),
                "fuel_efficiency_penalty": vehicle_config.fuel_efficiency_penalty * load_kg
            },
            "segment_analysis": segments,
            "performance_metrics": {
                "co2_per_km": round(vehicle_config.base_co2_per_km, 2),
                "average_segment_distance": round(total_distance / len(segments), 2) if segments else 0,
                "longest_segment_km": round(max([s["distance_km"] for s in segments]), 2) if segments else 0,
                "shortest_segment_km": round(min([s["distance_km"] for s in segments]), 2) if segments else 0
            },
            "recommendations": {
                "route_optimization": "Good" if efficiency > 80 else "Needs improvement",
                "environmental_impact": "Low" if total_co2 < 1000 else "Medium" if total_co2 < 2000 else "High",
                "suggested_improvements": [
                    "Consider consolidating nearby waypoints" if efficiency < 70 else "Route efficiency is good",
                    "Optimize for traffic patterns during peak hours",
                    "Consider electric vehicle for environmental benefits" if total_co2 > 1500 else "Current vehicle choice is efficient"
                ]
            }
        }
        
        return jsonify(analysis)
        
    except Exception as e:
        print(f"ERROR in route analysis: {str(e)}")
        return jsonify({"error": f"Route analysis failed: {str(e)}"}), 500

if __name__ == "__main__":
    print("Starting Flask server...")
    print(f"Current directory: {os.getcwd()}")
    print(f"Python version: {sys.version}")
    app.run(debug=True, host='0.0.0.0', port=5001)