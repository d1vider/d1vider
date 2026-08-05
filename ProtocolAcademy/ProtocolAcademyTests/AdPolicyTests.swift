import XCTest
@testable import ProtocolAcademy

/// Ad pacing rules. These exist because the ad policy is the part most likely to draw
/// an App Review rejection, and it is easy to break accidentally while adding features.
@MainActor
final class AdPolicyTests: XCTestCase {

    private var defaults: UserDefaults!
    private var suiteName: String!

    override func setUp() {
        super.setUp()
        suiteName = "ads.tests.\(UUID().uuidString)"
        defaults = UserDefaults(suiteName: suiteName)
    }

    override func tearDown() {
        defaults.removePersistentDomain(forName: suiteName)
        defaults = nil
        super.tearDown()
    }

    private func makeCoordinator() -> AdCoordinator {
        let coordinator = AdCoordinator(defaults: defaults)
        coordinator.attach(entitlements: EntitlementStore())
        return coordinator
    }

    func testAdvertisingIsOnForAFreeUser() {
        let coordinator = makeCoordinator()
        XCTAssertTrue(coordinator.isAdvertisingEnabled)
        for placement in [AdPlacement.catalogFooter, .protocolDetail, .progressDashboard] {
            XCTAssertTrue(coordinator.shouldShowBanner(at: placement))
        }
    }

    func testNoBannersBeforeAnEntitlementStoreIsAttached() {
        // Fails closed: if the entitlement state is unknown, show nothing rather than
        // risk billing a paying user's screen with ads.
        let coordinator = AdCoordinator(defaults: defaults)
        XCTAssertFalse(coordinator.isAdvertisingEnabled)
        XCTAssertFalse(coordinator.shouldShowBanner(at: .catalogFooter))
    }

    func testFirstModulesNeverTriggerAnInterstitial() {
        let coordinator = makeCoordinator()
        for _ in 0..<AdCoordinator.interstitialWarmup {
            XCTAssertFalse(coordinator.trainingModuleCompleted(protocolID: "tls13"))
        }
        XCTAssertNil(coordinator.pendingInterstitial)
    }

    func testInterstitialAppearsAfterTheWarmup() {
        let coordinator = makeCoordinator()
        for _ in 0..<AdCoordinator.interstitialWarmup {
            _ = coordinator.trainingModuleCompleted(protocolID: "tls13")
        }
        XCTAssertTrue(coordinator.trainingModuleCompleted(protocolID: "ssh"))
        XCTAssertEqual(coordinator.pendingInterstitial?.afterProtocolID, "ssh")
    }

    func testInterstitialsAreRateLimited() {
        let coordinator = makeCoordinator()
        for _ in 0...AdCoordinator.interstitialWarmup {
            _ = coordinator.trainingModuleCompleted(protocolID: "tls13")
        }
        coordinator.dismissInterstitial()

        XCTAssertFalse(
            coordinator.trainingModuleCompleted(protocolID: "https"),
            "A second interstitial within the minimum interval must be suppressed"
        )
        XCTAssertNil(coordinator.pendingInterstitial)
    }

    func testDismissClearsThePendingInterstitial() {
        let coordinator = makeCoordinator()
        for _ in 0...AdCoordinator.interstitialWarmup {
            _ = coordinator.trainingModuleCompleted(protocolID: "tls13")
        }
        XCTAssertNotNil(coordinator.pendingInterstitial)
        coordinator.dismissInterstitial()
        XCTAssertNil(coordinator.pendingInterstitial)
    }

    func testPersonalisationDefaultsToOff() {
        let coordinator = makeCoordinator()
        XCTAssertFalse(coordinator.personalisationOptIn)
        XCTAssertFalse(coordinator.usesPersonalisedAds, "Ads must be non-personalised until the user opts in")
    }

    func testPersonalisationPreferencePersists() {
        let first = makeCoordinator()
        first.personalisationOptIn = true

        let second = AdCoordinator(defaults: defaults)
        XCTAssertTrue(second.personalisationOptIn)

        second.disablePersonalisation()
        XCTAssertFalse(AdCoordinator(defaults: defaults).personalisationOptIn)
    }

    func testPersonalisationStillRequiresSystemAuthorisation() {
        let coordinator = makeCoordinator()
        coordinator.personalisationOptIn = true
        // The simulator reports .notDetermined until the ATT prompt is answered, so the
        // opt-in alone must not be enough to turn on tracking.
        if !TrackingAuthorization.current.allowsPersonalisedAds {
            XCTAssertFalse(coordinator.usesPersonalisedAds)
        }
    }

    func testHouseRendererAlwaysHasCreative() {
        let renderer = HouseAdRenderer()
        XCTAssertNotNil(renderer.bannerView(for: .catalogFooter, personalised: false))
        XCTAssertNotNil(renderer.interstitialView(personalised: false, onDismiss: {}))
    }
}
