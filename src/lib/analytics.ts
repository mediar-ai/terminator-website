import { posthog } from "@/components/PostHogProvider";

// ============================================================================
// HIGH PRIORITY EVENTS - Conversion & Core Engagement
// ============================================================================

/**
 * Track when user copies the install command
 */
export function trackInstallCopied(source: string) {
  posthog?.capture("cta_click", { source: `install_copy_${source}`, cta_name: "install_command_copied" });
}

/**
 * Track when user copies code from a code block
 */
export function trackCodeCopied(section: string, language: string) {
  posthog?.capture("code_copied", { section, language });
}

/**
 * Track CTA button clicks
 */
export function trackCtaClicked(
  ctaName: string,
  location: "hero" | "nav" | "cta_section" | "footer" | "platform_cards"
) {
  posthog?.capture("cta_click", { cta_name: ctaName, source: location });
}

/**
 * Track when waitlist modal is opened
 */
export function trackWaitlistOpened(platform: "macos" | "linux") {
  posthog?.capture("modal_opened", { modal: "waitlist", platform });
}

/**
 * Track when waitlist modal is closed without submitting
 */
export function trackWaitlistClosed(platform: "macos" | "linux", hadEmail: boolean) {
  posthog?.capture("modal_closed", { modal: "waitlist", platform, had_email: hadEmail });
}

// ============================================================================
// MEDIUM PRIORITY EVENTS - User Journey & Navigation
// ============================================================================

/**
 * Track external link clicks
 */
export function trackExternalLinkClicked(
  url: string,
  linkType: "github" | "discord" | "npm" | "pypi" | "mediar" | "docs" | "other"
) {
  posthog?.capture("cta_click", { source: `external_link_${linkType}`, url, link_type: linkType });
}

/**
 * Track internal navigation clicks
 */
export function trackNavClicked(target: string, location: "nav" | "footer" | "inline") {
  posthog?.capture("cta_click", { source: `nav_${location}`, target });
}

/**
 * Track when a section comes into view (scroll depth)
 */
export function trackSectionViewed(section: string) {
  posthog?.capture("section_viewed", { section });
}

/**
 * Track feature card interactions
 */
export function trackFeatureViewed(featureIndex: number, featureTitle: string) {
  posthog?.capture("feature_viewed", { feature_index: featureIndex, feature_title: featureTitle });
}

// ============================================================================
// LOWER PRIORITY EVENTS - UX Insights & Micro-interactions
// ============================================================================

/**
 * Track comparison table views
 */
export function trackComparisonViewed() {
  posthog?.capture("comparison_viewed");
}

/**
 * Track platform card interactions
 */
export function trackPlatformCardClicked(platform: "windows" | "macos" | "linux", action: "view" | "waitlist") {
  posthog?.capture("cta_click", { source: "platform_card", platform, action });
}

/**
 * Track hero badge click/interaction
 */
export function trackHeroBadgeClicked() {
  posthog?.capture("cta_click", { source: "hero_badge" });
}

/**
 * Track scroll depth milestones
 */
export function trackScrollDepth(percentage: 25 | 50 | 75 | 100) {
  posthog?.capture("scroll_depth", { percentage });
}

/**
 * Track time on page milestones
 */
export function trackTimeOnPage(seconds: number) {
  posthog?.capture("time_on_page", { seconds });
}

/**
 * Track logo/brand click
 */
export function trackLogoClicked() {
  posthog?.capture("cta_click", { source: "logo" });
}

// ============================================================================
// UTILITY - Identify user properties
// ============================================================================

/**
 * Set user properties for segmentation
 */
export function setUserProperties(properties: Record<string, unknown>) {
  posthog?.setPersonProperties(properties);
}

/**
 * Track page view with additional context
 */
export function trackPageView(pageName: string, properties?: Record<string, unknown>) {
  posthog?.capture("$pageview", {
    page_name: pageName,
    ...properties,
  });
}
