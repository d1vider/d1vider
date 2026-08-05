import Foundation
#if canImport(AppTrackingTransparency)
import AppTrackingTransparency
#endif

/// Thin wrapper over App Tracking Transparency.
///
/// The app defaults to **non-personalised** advertising, which needs no ATT prompt
/// and no IDFA. The prompt is only requested if the user actively opts in from
/// Settings, which keeps the app compliant with App Store Review Guideline 5.1.2
/// and avoids the pattern of asking for tracking before the user has any context.
@MainActor
enum TrackingAuthorization {

    enum Status: String, Sendable {
        case notDetermined
        case restricted
        case denied
        case authorized
        case unavailable

        var allowsPersonalisedAds: Bool { self == .authorized }
    }

    static var current: Status {
        #if canImport(AppTrackingTransparency)
        switch ATTrackingManager.trackingAuthorizationStatus {
        case .notDetermined: return .notDetermined
        case .restricted: return .restricted
        case .denied: return .denied
        case .authorized: return .authorized
        @unknown default: return .unavailable
        }
        #else
        return .unavailable
        #endif
    }

    /// Presents the system prompt if it has not been shown before.
    ///
    /// Returns the resulting status. Apple requires the app to be active when this
    /// is called, so callers should invoke it from a user-initiated action rather
    /// than during launch.
    @discardableResult
    static func request() async -> Status {
        #if canImport(AppTrackingTransparency)
        _ = await ATTrackingManager.requestTrackingAuthorization()
        return current
        #else
        return .unavailable
        #endif
    }
}
