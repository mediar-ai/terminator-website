import { posthog } from "@/components/PostHogProvider";

export interface CrossProductClickProps {
  site: string;
  targetProduct: string;
  destination: string;
  text?: string;
  component?: string;
  section?: string;
  extra?: Record<string, unknown>;
}

export function trackCrossProductClick(props: CrossProductClickProps): void {
  const { site, targetProduct, destination, text, component, section, extra } = props;
  posthog?.capture("cross_product_click", {
    ...(extra || {}),
    site,
    target_product: targetProduct,
    destination,
    text,
    component,
    section,
    page: typeof window !== "undefined" ? window.location.pathname : undefined,
  });
}
