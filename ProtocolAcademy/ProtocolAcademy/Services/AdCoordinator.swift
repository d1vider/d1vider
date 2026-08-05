import Foundation
import SwiftUI

/// Where a banner is being asked for. Placements exist so pacing and suppression
/// rules live in one place rather than being re-decided at each call site.
enum AdPlacement: String, Sendable {
    case catalogFooter
    case protocolDetail
    case progressDashboard
}

/// Decides whether advertising is shown, and paces interstitials.
///
/// The app is deliberately conservative about ads, because the most common ad-related
/// App Review rejections come from interstitials that interrupt an activity or appear
/// before any content is shown. Rules enforced here:
///
/// * Ads never render while the ad-free entitlement is held.
/// * Interstitials never appear during a lesson or quiz — only after a module ends.
/// * At most one interstitial per `minimumInterstitialInterval`, and never on the
///   first module a user completes.
/// * Personalised ads require an explicit opt-in plus ATT authorisation.
@MainActor
@Observable
final class AdCoordinator {

    /// Modules a user must finish before the first interstitial is eligible.
    static let interstitialWarmup = 2
    /// Minimum wall-clock gap between interstitials.
    static let minimumInterstitialInterval: TimeInterval = 180

    private static let personalisationKey = "ads.personalisationOptIn"

    private let defaults: UserDefaults
    private weak var entitlements: EntitlementStore?

    /// Set when an interstitial should be presented; the root view observes it.
    var pendingInterstitial: InterstitialContext?

    private(set) var completedModules = 0
    private var lastInterstitialShown: Date?

    /// User's stored preference. Personalised ads also require ATT authorisation,
    /// so this being true is necessary but not sufficient.
    var personalisationOptIn: Bool {
        didSet {
            guard personalisationOptIn != oldValue else { return }
            defaults.set(personalisationOptIn, forKey: Self.personalisationKey)
        }
    }

    struct InterstitialContext: Identifiable, Equatable {
        let id = UUID()
        let afterProtocolID: String
    }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        self.personalisationOptIn = defaults.bool(forKey: Self.personalisationKey)
    }

    func attach(entitlements: EntitlementStore) {
        self.entitlements = entitlements
    }

    // MARK: - Policy

    /// False as soon as the user has paid to remove ads.
    var isAdvertisingEnabled: Bool {
        entitlements?.hasAdFree == false
    }

    /// Whether ads may use tracking data. Requires both the in-app opt-in and the
    /// system-level ATT authorisation.
    var usesPersonalisedAds: Bool {
        personalisationOptIn && TrackingAuthorization.current.allowsPersonalisedAds
    }

    func shouldShowBanner(at placement: AdPlacement) -> Bool {
        guard isAdvertisingEnabled else { return false }
        switch placement {
        case .catalogFooter, .protocolDetail, .progressDashboard:
            return true
        }
    }

    /// Called when a training module finishes. Returns true if an interstitial was queued.
    @discardableResult
    func trainingModuleCompleted(protocolID: String) -> Bool {
        completedModules += 1
        guard isAdvertisingEnabled else { return false }
        guard completedModules > Self.interstitialWarmup else { return false }
        if let last = lastInterstitialShown,
           Date.now.timeIntervalSince(last) < Self.minimumInterstitialInterval {
            return false
        }
        lastInterstitialShown = .now
        pendingInterstitial = InterstitialContext(afterProtocolID: protocolID)
        return true
    }

    func dismissInterstitial() {
        pendingInterstitial = nil
    }

    /// Turns personalisation on, requesting ATT if the prompt has not been shown yet.
    func enablePersonalisation() async {
        var status = TrackingAuthorization.current
        if status == .notDetermined {
            status = await TrackingAuthorization.request()
        }
        personalisationOptIn = status.allowsPersonalisedAds
    }

    func disablePersonalisation() {
        personalisationOptIn = false
    }
}
