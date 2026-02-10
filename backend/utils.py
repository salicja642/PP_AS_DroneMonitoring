import math

def distance(lat1, lon1, lat2, lon2):
    """Odległość w metrach między dwoma punktami GPS"""
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(dlambda / 2.0) ** 2
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def reached_target(current_lat, current_lng, target_lat, target_lng, threshold=4):
    """
    Sprawdza, czy dron jest wystarczająco blisko punktu docelowego.
    Domyślny próg to 4 metry.
    """
    dist = distance(current_lat, current_lng, target_lat, target_lng)

    return dist < threshold
