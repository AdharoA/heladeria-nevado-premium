import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useSettings } from "@/_core/hooks/useSettings";
import { useTheme } from "@/contexts/ThemeContext";
import { useMemo } from "react";

export default function Location() {
    const { getSetting } = useSettings();
    const { theme } = useTheme();

    const companyName = getSetting("company_name") || "Heladería Nevado Premium";
    const address = getSetting("contact_address") || "Av. Principal 123, Lima, Perú";
    const phone = getSetting("contact_phone") || "+51 945 472 993";
    const email = getSetting("contact_email") || "contacto@nevadopremium.com";
    const businessHours = getSetting("business_hours") || "Lunes - Viernes: 10:00 AM - 10:00 PM\nSábado - Domingo: 11:00 AM - 11:00 PM";
    const mapsIframe = getSetting("maps_iframe");
    const mapsSize = getSetting("maps_size") || "medium";
    const mapsCustomHeight = getSetting("maps_custom_height") || "450";

    // Parse business hours (split by newline)
    const hours = businessHours.split('\n').filter(h => h.trim());

    // Determine map height based on size setting
    const mapHeight = useMemo(() => {
        switch (mapsSize) {
            case "small": return "300px";
            case "large": return "600px";
            case "custom": return `${mapsCustomHeight}px`;
            default: return "450px"; // medium
        }
    }, [mapsSize, mapsCustomHeight]);

    // Extract src from iframe or use default
    const mapSrc = useMemo(() => {
        if (!mapsIframe) {
            return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.666076941687!2d-77.04279308561794!3d-12.04595299146864!2m3!1f0!2f0!1f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b79a23f351%3A0x6ec651152e44040!2sPlaza%20Mayor%20de%20Lima!5e0!3m2!1ses!2spe!4v1625688000000!5m2!1ses!2spe";
        }

        // Extract src from iframe tag
        const match = mapsIframe.match(/src="([^"]+)"/);
        return match ? match[1] : mapsIframe;
    }, [mapsIframe]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-primary dark:text-white">Nuestra Ubicación</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-6 w-6 text-primary" />
                                Visítanos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-lg">
                                <strong>{companyName}</strong><br />
                                {address.split(',').map((line, idx) => (
                                    <span key={idx}>
                                        {line.trim()}{idx < address.split(',').length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{email}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-6 w-6 text-primary" />
                                Horario de Atención
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {hours.map((hour, idx) => {
                                const parts = hour.split(':');
                                if (parts.length >= 2) {
                                    return (
                                        <div key={idx} className="flex justify-between">
                                            <span>{parts[0].trim()}</span>
                                            <span>{parts.slice(1).join(':').trim()}</span>
                                        </div>
                                    );
                                }
                                return <p key={idx}>{hour}</p>;
                            })}
                        </CardContent>
                    </Card>
                </div>

                <div
                    className="w-full rounded-lg overflow-hidden border shadow-lg"
                    style={{ height: mapHeight }}
                >
                    <iframe
                        src={mapSrc}
                        width="100%"
                        height="100%"
                        style={{
                            border: 0,
                            filter: theme === 'dark' ? 'invert(90%) hue-rotate(180deg)' : 'none'
                        }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
