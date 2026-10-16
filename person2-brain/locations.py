"""
Local drop-off location recommendations.
Curated list for major Indian cities + generic fallbacks.
"""

# Category → location type
CATEGORY_LOCATION_TYPE = {
    "Recyclable": "Recycling center or curbside program",
    "Biodegradable": "Municipal compost / garden waste drop-off",
    "Hazardous": "Household Hazardous Waste (HHW) facility",
    "Reusable": "Donation center or thrift store",
}

# Curated locations by city
LOCATIONS = {
    "bangalore": {
        "Hazardous": [
            {"name": "BBMP Dry Waste Collection Center - Koramangala", "address": "5th Block, Koramangala", "hours": "9am-5pm Mon-Sat", "distance_km": 2.3, "phone": "+91-80-XXXX"},
            {"name": "Saahas Zero Waste - HHW Drop", "address": "Jayanagar 4th Block", "hours": "10am-6pm", "distance_km": 4.1, "phone": "+91-80-XXXX"},
            {"name": "KSPCB E-Waste Center", "address": "Peenya Industrial Area", "hours": "9am-5pm", "distance_km": 12.5, "phone": "+91-80-XXXX"},
        ],
        "Recyclable": [
            {"name": "BBMP Dry Waste Collection Center - Indiranagar", "address": "12th Main, Indiranagar", "hours": "9am-5pm", "distance_km": 1.8},
            {"name": "ITC WOW Recycling - HSR", "address": "HSR Layout Sector 2", "hours": "10am-6pm", "distance_km": 3.5},
        ],
        "Biodegradable": [
            {"name": "BBMP Compost Yard - Yelahanka", "address": "Yelahanka New Town", "hours": "8am-4pm", "distance_km": 8.2},
            {"name": "Daily Dump Composting - Indiranagar", "address": "CMH Road", "hours": "10am-6pm", "distance_km": 2.0},
        ],
        "Reusable": [
            {"name": "Goonj Donation Center", "address": "Sarjapur Road", "hours": "10am-5pm", "distance_km": 5.4},
            {"name": "Goodwill Thrift Store", "address": "Brigade Road", "hours": "11am-8pm", "distance_km": 4.2},
        ],
    },
    "mumbai": {
        "Hazardous": [
            {"name": "MCGM E-Waste Drop - Andheri", "address": "Andheri West", "hours": "9am-5pm", "distance_km": 3.1},
            {"name": "Mumbai HHW Facility - Deonar", "address": "Deonar", "hours": "8am-4pm", "distance_km": 15.0},
        ],
        "Recyclable": [
            {"name": "MCGM Dry Waste - Bandra", "address": "Bandra West", "hours": "9am-6pm", "distance_km": 2.4},
        ],
        "Biodegradable": [
            {"name": "Mumbai Compost - Dadar", "address": "Dadar", "hours": "8am-4pm", "distance_km": 4.0},
        ],
        "Reusable": [
            {"name": "Goonj - Mumbai", "address": "Kurla", "hours": "10am-5pm", "distance_km": 8.0},
        ],
    },
    "delhi": {
        "Hazardous": [
            {"name": "Delhi E-Waste - Okhla", "address": "Okhla Phase 1", "hours": "9am-5pm", "distance_km": 5.0},
            {"name": "NDMC HHW Drop", "address": "Connaught Place", "hours": "10am-6pm", "distance_km": 3.2},
        ],
        "Recyclable": [
            {"name": "Delhi Dry Waste - Dwarka", "address": "Dwarka Sector 10", "hours": "9am-5pm", "distance_km": 4.5},
        ],
        "Biodegradable": [
            {"name": "Delhi Compost Yard - Narela", "address": "Narela", "hours": "8am-4pm", "distance_km": 20.0},
        ],
        "Reusable": [
            {"name": "Goonj - Delhi", "address": "Sarita Vihar", "hours": "10am-5pm", "distance_km": 6.0},
        ],
    },
    "chennai": {
        "Hazardous": [
            {"name": "Chennai E-Waste - Guindy", "address": "Guindy Industrial Estate", "hours": "9am-5pm", "distance_km": 3.0},
        ],
        "Recyclable": [
            {"name": "Chennai Dry Waste - Adyar", "address": "Adyar", "hours": "9am-5pm", "distance_km": 2.0},
        ],
        "Biodegradable": [
            {"name": "Chennai Compost - Perungudi", "address": "Perungudi", "hours": "8am-4pm", "distance_km": 5.0},
        ],
        "Reusable": [
            {"name": "Chennai Donation Center", "address": "T. Nagar", "hours": "10am-6pm", "distance_km": 3.5},
        ],
    },
    "hyderabad": {
        "Hazardous": [
            {"name": "Hyderabad E-Waste - Jeedimetla", "address": "Jeedimetla", "hours": "9am-5pm", "distance_km": 12.0},
        ],
        "Recyclable": [
            {"name": "GHMC Dry Waste - Banjara Hills", "address": "Banjara Hills", "hours": "9am-5pm", "distance_km": 2.5},
        ],
        "Biodegradable": [
            {"name": "Hyderabad Compost - Gachibowli", "address": "Gachibowli", "hours": "8am-4pm", "distance_km": 6.0},
        ],
        "Reusable": [
            {"name": "Hyderabad Donation Center", "address": "Ameerpet", "hours": "10am-5pm", "distance_km": 4.0},
        ],
    },
}

# Generic fallback if city not found
GENERIC = {
    "Recyclable": "Search your municipality's recycling center or curbside pickup schedule.",
    "Biodegradable": "Find a local composting facility or start a home compost bin.",
    "Hazardous": "Search your city's Household Hazardous Waste (HHW) facility or retailer drop-off.",
    "Reusable": "Look up nearby donation centers (Goodwill, Goonj, Salvation Army).",
}


def get_locations(category: str, city: str = None, limit: int = 3) -> list:
    """
    Return drop-off recommendations.
    If city unknown, returns generic suggestion.
    """
    if not category:
        return []

    city_key = (city or "").lower().strip().replace(" ", "")

    if city_key and city_key in LOCATIONS:
        locations = LOCATIONS[city_key].get(category, [])
        return locations[:limit]

    # Fallback to generic
    fallback_msg = GENERIC.get(category, "Check local waste authority website.")
    return [{
        "name": "Generic recommendation",
        "category": category,
        "message": fallback_msg,
        "distance_km": None,
    }]


def get_categories() -> list:
    return list(CATEGORY_LOCATION_TYPE.keys())


def get_cities() -> list:
    return list(LOCATIONS.keys())


if __name__ == "__main__":
    import json
    print("=== Bangalore Hazardous ===")
    print(json.dumps(get_locations("Hazardous", "bangalore"), indent=2))

    print("\n=== Bangalore Recyclable ===")
    print(json.dumps(get_locations("Recyclable", "bangalore"), indent=2))

    print("\n=== Unknown city ===")
    print(json.dumps(get_locations("Hazardous", "nowhere"), indent=2))
