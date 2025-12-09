import { useState, useRef, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
import { MapPin, Search, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface LocationPickerProps {
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
    initialLocation?: { lat: number; lng: number };
}

const libraries: ("places")[] = ["places"];

// Default to India center if no location
const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629,
};

const mapContainerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "0.75rem",
};

const LocationPicker = ({ onLocationSelect, initialLocation }: LocationPickerProps) => {
    const { t } = useTranslation();
    const { toast } = useToast();

    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [center, setCenter] = useState(initialLocation || defaultCenter);
    const [markerPosition, setMarkerPosition] = useState(initialLocation || defaultCenter);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPosition({ lat, lng });
            reverseGeocode(lat, lng);
        }
    }, []);

    const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPosition({ lat, lng });
            reverseGeocode(lat, lng);
        }
    }, []);

    const reverseGeocode = async (lat: number, lng: number) => {
        if (!window.google) return;

        const geocoder = new window.google.maps.Geocoder();

        try {
            const response = await geocoder.geocode({ location: { lat, lng } });
            if (response.results && response.results[0]) {
                const address = response.results[0].formatted_address;
                onLocationSelect({ lat, lng, address });
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            toast({
                title: t('location.error'),
                description: "Could not fetch address details. Please type it manually.",
                variant: "destructive",
            });
        }
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                setCenter({ lat, lng });
                setMarkerPosition({ lat, lng });
                map?.panTo({ lat, lng });
                map?.setZoom(15);

                if (place.formatted_address) {
                    onLocationSelect({ lat, lng, address: place.formatted_address });
                }
            } else {
                toast({
                    title: t('location.no_details'),
                    description: t('location.select_valid_place'),
                    variant: "destructive",
                });
            }
        }
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    setCenter({ lat, lng });
                    setMarkerPosition({ lat, lng });
                    map?.panTo({ lat, lng });
                    map?.setZoom(15);
                    reverseGeocode(lat, lng);
                    setIsLocating(false);

                    toast({
                        title: t('location.located'),
                        description: t('location.using_current_location'),
                    });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setIsLocating(false);
                    toast({
                        title: t('location.error'),
                        description: t('location.enable_location'),
                        variant: "destructive",
                    });
                }
            );
        } else {
            toast({
                title: t('location.not_supported'),
                description: t('location.browser_not_supported'),
                variant: "destructive",
            });
        }
    };

    if (loadError) {
        return (
            <div className="h-[400px] w-full bg-secondary/20 rounded-xl flex items-center justify-center border-2 border-dashed border-border p-6 text-center">
                <div>
                    <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">{t('location.map_error')}</p>
                    <p className="text-xs text-muted-foreground/80">{loadError.message}</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="h-[400px] w-full bg-secondary/20 rounded-xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Autocomplete
                        onLoad={setAutocomplete}
                        onPlaceChanged={onPlaceChanged}
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                            <Input
                                placeholder={t('location.search_placeholder')}
                                className="pl-9"
                            />
                        </div>
                    </Autocomplete>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    title={t('location.use_current')}
                >
                    {isLocating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Navigation className="w-4 h-4" />
                    )}
                </Button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-border shadow-sm">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={10}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={onMapClick}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                        clickableIcons: false,
                    }}
                >
                    <Marker
                        position={markerPosition}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                        animation={window.google.maps.Animation.DROP}
                    />
                </GoogleMap>

                <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border border-border text-xs sm:text-sm shadow-lg pointer-events-none">
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="font-medium text-foreground">
                            {t('location.drag_marker')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
