import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export function useSettings() {
    const { data: settings, isLoading } = trpc.settings.list.useQuery();

    useEffect(() => {
        if (settings) {
            // Update Favicon
            const faviconUrl = settings.find((s) => s.key === "site_favicon")?.value;
            if (faviconUrl) {
                const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
                if (link) {
                    link.href = faviconUrl;
                }
            }

            // Update Title (optional, if site_name exists)
            const siteName = settings.find((s) => s.key === "site_name")?.value;
            if (siteName) {
                document.title = siteName;
            }
        }
    }, [settings]);

    const getSetting = (key: string) => {
        return settings?.find((s) => s.key === key)?.value;
    };

    return { settings, isLoading, getSetting };
}
