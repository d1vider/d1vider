import Foundation

/// Product identifiers configured in App Store Connect.
///
/// These strings must match App Store Connect exactly. They are also mirrored in
/// `Products.storekit` at the repository root, which drives local testing in Xcode.
enum StoreProductID: String, CaseIterable, Sendable {
    /// Non-consumable. Removes all advertising, permanently.
    case removeAds = "com.d1vider.protocolacademy.removeads"
    /// Non-consumable. Unlocks every protocol and its training module.
    case fullLibrary = "com.d1vider.protocolacademy.fulllibrary"
    /// Non-consumable bundle. Grants both of the above at a discount.
    case pro = "com.d1vider.protocolacademy.pro"

    /// Display order in the paywall — the bundle is listed last as the recommended option.
    static var displayOrder: [StoreProductID] { [.removeAds, .fullLibrary, .pro] }

    /// Entitlements granted by owning this product.
    var grants: Set<Entitlement> {
        switch self {
        case .removeAds: [.adFree]
        case .fullLibrary: [.fullLibrary]
        case .pro: [.adFree, .fullLibrary]
        }
    }

    /// Copy shown if StoreKit metadata cannot be loaded (offline, or App Store unreachable).
    var fallbackTitle: String {
        switch self {
        case .removeAds: "Remove Ads"
        case .fullLibrary: "Full Protocol Library"
        case .pro: "Academy Pro"
        }
    }

    var marketingDescription: String {
        switch self {
        case .removeAds:
            "Hide every banner and promo card. Your progress and unlocked content stay exactly as they are."
        case .fullLibrary:
            "Unlock all 25 protocols with their full breakdowns, key concepts, guided lessons, and quizzes."
        case .pro:
            "Everything in one purchase: the complete protocol library, all training modules, and no ads."
        }
    }

    var benefits: [String] {
        switch self {
        case .removeAds:
            ["No banner ads anywhere in the app", "No promotional cards in the catalog", "One-time purchase, restorable"]
        case .fullLibrary:
            ["All 25 protocols unlocked", "75 guided lessons", "75 quiz questions with explanations", "One-time purchase, restorable"]
        case .pro:
            ["All 25 protocols and every training module", "Completely ad-free", "Best value — cheaper than buying separately", "One-time purchase, restorable"]
        }
    }
}

/// A capability the user has unlocked. Kept separate from products so a future
/// bundle or promotion can grant the same capability without new call sites.
enum Entitlement: String, Hashable, Sendable {
    case adFree
    case fullLibrary
}
