
import { useState, useEffect } from "react";
import { Phone, MessageSquare, Clock, CheckCircle, Navigation, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

interface VendorLocation {
  lat: number;
  lng: number;
  heading?: number;
}

interface LiveMapProps {
  vendorName: string;
  vendorPhone?: string;
  estimatedTime?: string;
  status: "accepted" | "on_the_way" | "arrived" | "in_progress" | "completed";
  customerAddress?: string;
}

const statusSteps = [
  { id: "accepted", label: "Job Accepted", icon: CheckCircle },
  { id: "on_the_way", label: "On the Way", icon: Navigation },
  { id: "arrived", label: "Arrived", icon: MapPin },
  { id: "in_progress", label: "Work in Progress", icon: Clock },
  { id: "completed", label: "Completed", icon: CheckCircle },
];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 12.9716,
  lng: 77.5946,
};

const LiveMap = ({ vendorName, vendorPhone, estimatedTime, status, customerAddress }: LiveMapProps) => {
  const [vendorLocation, setVendorLocation] = useState<VendorLocation>({
    lat: 12.9716,
    lng: 77.5946,
  });
  const [mapError, setMapError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const isValidKey = apiKey && apiKey !== "YOUR_GOOGLE_MAPS_API_KEY_HERE";

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: isValidKey ? apiKey : "",
  });

  useEffect(() => {
    if (loadError) {
      setMapError("Failed to load Google Maps. Please check your API key and network connection.");
      console.error("Google Maps Load Error:", loadError);
    }
  }, [loadError]);

  // Simulate vendor movement
  useEffect(() => {
    if (status === "on_the_way") {
      const interval = setInterval(() => {
        setVendorLocation((prev) => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001,
          heading: Math.random() * 360,
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [status]);

  const currentStepIndex = statusSteps.findIndex((step) => step.id === status);

  const handleCall = () => {
    if (vendorPhone) {
      window.location.href = `tel:${vendorPhone} `;
    }
  };

  const handleMessage = () => {
    console.log("Open chat with vendor");
  };

  return (
    <div className="space-y-6">
      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card h-64 md:h-80">
        {isValidKey ? (
          isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
              options={{
                disableDefaultUI: true,
                styles: [
                  {
                    featureType: "all",
                    elementType: "geometry",
                    stylers: [{ color: "#242f3e" }],
                  },
                  {
                    featureType: "all",
                    elementType: "labels.text.stroke",
                    stylers: [{ color: "#242f3e" }],
                  },
                  {
                    featureType: "all",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#746855" }],
                  },
                ],
              }}
            >
              {/* Customer Location */}
              <Marker position={center} />

              {/* Vendor Location */}
              {status === "on_the_way" && (
                <Marker
                  position={vendorLocation}
                  icon={{
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 6,
                    fillColor: "#10b981", // Success color
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                    rotation: vendorLocation.heading,
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
              <p className="text-muted-foreground">Loading Map...</p>
            </div>
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/50 p-6 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Map Configuration Required</h3>
            <p className="text-muted-foreground max-w-md">
              Please add your Google Maps API Key to the <code>.env</code> file as <code>VITE_GOOGLE_MAPS_API_KEY</code> to enable live tracking.
            </p>
          </div>
        )}

        {/* Error Overlay */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-20">
            <p className="text-destructive font-medium">{mapError}</p>
          </div>
        )}

        {/* ETA badge */}
        {estimatedTime && status === "on_the_way" && (
          <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border z-10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">ETA: {estimatedTime}</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-semibold text-foreground mb-4">Service Status</h4>
        <div className="relative">
          {statusSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.id} className="flex items-start gap-4 pb-6 last:pb-0">
                {/* Status line */}
                {index < statusSteps.length - 1 && (
                  <div
                    className={`absolute left - [19px] w - 0.5 h - 8 mt - 8 ${isCompleted ? "bg-success" : "bg-border"
                      } `}
                    style={{ top: `${index * 56} px` }}
                  />
                )}

                {/* Status icon */}
                <div
                  className={`w - 10 h - 10 rounded - full flex items - center justify - center flex - shrink - 0 ${isCompleted
                      ? "bg-success text-success-foreground"
                      : isCurrent
                        ? "bg-primary text-primary-foreground animate-pulse"
                        : "bg-secondary text-muted-foreground"
                    } `}
                >
                  <step.icon className="w-5 h-5" />
                </div>

                {/* Status text */}
                <div className="flex-1 pt-2">
                  <p
                    className={`font - medium ${isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                      } `}
                  >
                    {step.label}
                  </p>
                  {isCurrent && step.id === "on_the_way" && estimatedTime && (
                    <p className="text-sm text-primary">Arriving in {estimatedTime}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vendor Contact */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center text-success-foreground font-semibold">
              {vendorName.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-foreground">{vendorName}</p>
              <p className="text-sm text-muted-foreground">Your service provider</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleMessage}>
              <MessageSquare className="w-5 h-5" />
            </Button>
            <Button variant="default" size="icon" onClick={handleCall}>
              <Phone className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Service address */}
        {customerAddress && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Service Address</p>
                <p className="text-foreground">{customerAddress}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMap;
