export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error("Google Maps API Key missing");
        return null;
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.status === "OK" && data.results && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        } else {
            console.warn("Geocoding failed:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}
