import XCTest
@testable import ProtocolAcademy

/// Entitlement mapping and access rules.
///
/// The purchase flow itself needs a StoreKit test session, but the logic that decides
/// *what a purchase unlocks* is pure and worth pinning down here — a mistake in this
/// mapping either gives away paid content or fails to deliver something a user paid for.
final class EntitlementTests: XCTestCase {

    func testProductGrants() {
        XCTAssertEqual(StoreProductID.removeAds.grants, [.adFree])
        XCTAssertEqual(StoreProductID.fullLibrary.grants, [.fullLibrary])
        XCTAssertEqual(StoreProductID.pro.grants, [.adFree, .fullLibrary])
    }

    func testProBundleSupersedesTheIndividualProducts() {
        let proGrants = StoreProductID.pro.grants
        XCTAssertTrue(StoreProductID.removeAds.grants.isSubset(of: proGrants))
        XCTAssertTrue(StoreProductID.fullLibrary.grants.isSubset(of: proGrants))
    }

    func testEveryProductHasMarketingCopy() {
        for id in StoreProductID.allCases {
            XCTAssertFalse(id.fallbackTitle.isEmpty, "\(id.rawValue): no fallback title")
            XCTAssertFalse(id.marketingDescription.isEmpty, "\(id.rawValue): no description")
            XCTAssertGreaterThanOrEqual(id.benefits.count, 3, "\(id.rawValue): needs at least 3 benefits")
        }
    }

    func testDisplayOrderCoversEveryProduct() {
        XCTAssertEqual(Set(StoreProductID.displayOrder), Set(StoreProductID.allCases))
        XCTAssertEqual(StoreProductID.displayOrder.last, .pro, "The bundle should be listed last")
    }

    func testProductIdentifiersMatchTheStoreKitConfiguration() throws {
        // Guards against a rename in one place and not the other, which would ship an
        // app whose products silently fail to load.
        let bundle = Bundle(for: ProgressStore.self)
        guard let url = bundle.url(forResource: "Products", withExtension: "storekit") else {
            throw XCTSkip("Products.storekit is not bundled into the app — it is a scheme resource only.")
        }
        let json = try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any]
        let products = json?["products"] as? [[String: Any]] ?? []
        let configured = Set(products.compactMap { $0["productID"] as? String })
        XCTAssertEqual(configured, Set(StoreProductID.allCases.map(\.rawValue)))
    }

    @MainActor
    func testFreshInstallHasNoEntitlements() {
        let store = EntitlementStore()
        XCTAssertFalse(store.hasAdFree)
        XCTAssertFalse(store.hasFullLibrary)
        XCTAssertFalse(store.ownsEverything)
        XCTAssertTrue(store.entitlements.isEmpty)
    }

    @MainActor
    func testFreeProtocolsAreAccessibleWithoutPurchase() throws {
        let store = EntitlementStore()
        let catalog = try ProtocolCatalog.load(from: Bundle(for: ProgressStore.self))

        for entry in catalog.freeProtocols {
            XCTAssertTrue(store.canAccess(entry), "\(entry.id) should be free to read")
        }
        for entry in catalog.premiumProtocols {
            XCTAssertFalse(store.canAccess(entry), "\(entry.id) should be locked")
        }
    }

    @MainActor
    func testRedundancyIsFalseBeforeAnyPurchase() {
        let store = EntitlementStore()
        for id in StoreProductID.allCases {
            XCTAssertFalse(store.isRedundant(id))
            XCTAssertFalse(store.owns(id))
        }
    }
}
