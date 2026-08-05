import SwiftUI

/// Draws the actual advertising creative.
///
/// The app ships with `HouseAdRenderer`, which promotes the in-app purchase and needs
/// no third-party SDK — so the project builds, runs, and can be reviewed with no
/// external dependency. To serve a real ad network, implement this protocol against
/// that network's SDK and register it at launch:
///
/// ```swift
/// AdRendererRegistry.shared.register(GoogleMobileAdsRenderer())
/// ```
///
/// See `Docs/ADS_INTEGRATION.md` for the full walkthrough, including the Info.plist
/// and privacy-manifest entries the network will require.
@MainActor
protocol AdRendering: AnyObject {
    /// A banner sized for the placement, or `nil` if nothing is available to show.
    func bannerView(for placement: AdPlacement, personalised: Bool) -> AnyView?
    /// Full-screen creative shown between activities.
    func interstitialView(personalised: Bool, onDismiss: @escaping () -> Void) -> AnyView?
    /// Called once at launch, after the entitlement state is known.
    func prepare(personalised: Bool)
}

@MainActor
final class AdRendererRegistry {
    static let shared = AdRendererRegistry()

    private(set) var renderer: AdRendering = HouseAdRenderer()

    private init() {}

    func register(_ renderer: AdRendering) {
        self.renderer = renderer
    }
}

/// Default renderer: in-house promotion of the paid upgrade.
///
/// It keeps the ad surfaces real and visible during development without pulling in a
/// tracking SDK, and it remains a sensible fallback when a network has no fill.
@MainActor
final class HouseAdRenderer: AdRendering {

    struct Creative: Identifiable {
        let id: String
        let headline: String
        let body: String
        let symbol: String
    }

    private let creatives = [
        Creative(
            id: "library",
            headline: "19 more protocols waiting",
            body: "Kerberos, OAuth 2.0, WireGuard, WebAuthn and more — with lessons and quizzes.",
            symbol: "lock.open.rotation"
        ),
        Creative(
            id: "adfree",
            headline: "Study without interruptions",
            body: "Remove every ad in the app with a single one-time purchase.",
            symbol: "rectangle.slash"
        ),
        Creative(
            id: "pro",
            headline: "Academy Pro",
            body: "The full library plus an ad-free app, cheaper than buying both.",
            symbol: "sparkles"
        ),
    ]

    func prepare(personalised: Bool) {}

    /// Deterministic per placement rather than round-robin, so a view redraw never
    /// swaps the creative underneath the user.
    func bannerView(for placement: AdPlacement, personalised: Bool) -> AnyView? {
        let creative: Creative
        switch placement {
        case .catalogFooter: creative = creatives[0]
        case .protocolDetail: creative = creatives[2]
        case .progressDashboard: creative = creatives[1]
        }
        return AnyView(HouseBannerCard(creative: creative, placement: placement))
    }

    func interstitialView(personalised: Bool, onDismiss: @escaping () -> Void) -> AnyView? {
        AnyView(HouseInterstitialView(onDismiss: onDismiss))
    }
}
