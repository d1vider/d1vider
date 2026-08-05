import Foundation
import Observation
import StoreKit

/// Owns all App Store purchase state.
///
/// Uses StoreKit 2, so verification is handled by the framework: every transaction
/// arrives wrapped in `VerificationResult` and unverified ones are discarded rather
/// than trusted. Entitlements are derived from `Transaction.currentEntitlements`,
/// which is the App Store's own record — nothing is persisted locally as the source
/// of truth, so a reinstall or a new device restores correctly without a receipt file.
@MainActor
@Observable
final class EntitlementStore {

    enum PurchaseOutcome: Equatable {
        case success
        case pending
        case cancelled
    }

    enum StoreError: LocalizedError {
        case productUnavailable
        case failedVerification
        case unknown(String)

        var errorDescription: String? {
            switch self {
            case .productUnavailable:
                "That item isn't available from the App Store right now. Please try again later."
            case .failedVerification:
                "The App Store could not verify this purchase. Nothing was unlocked and you have not been charged."
            case .unknown(let message):
                message
            }
        }
    }

    /// Products fetched from the App Store, in paywall display order.
    private(set) var products: [Product] = []
    private(set) var entitlements: Set<Entitlement> = []
    private(set) var ownedProductIDs: Set<String> = []
    private(set) var isLoadingProducts = false
    private(set) var isRestoring = false
    /// Set while a specific product is being purchased, so only that row shows a spinner.
    private(set) var purchasingProductID: String?

    var lastError: StoreError?

    private var updatesTask: Task<Void, Never>?

    // MARK: - Derived state

    var hasAdFree: Bool { entitlements.contains(.adFree) }
    var hasFullLibrary: Bool { entitlements.contains(.fullLibrary) }
    /// True once nothing is left to sell.
    var ownsEverything: Bool { hasAdFree && hasFullLibrary }

    func owns(_ id: StoreProductID) -> Bool { ownedProductIDs.contains(id.rawValue) }

    /// A product is redundant when the user already holds everything it grants —
    /// for example Remove Ads after buying the Pro bundle. Those rows are shown as owned.
    func isRedundant(_ id: StoreProductID) -> Bool { id.grants.isSubset(of: entitlements) }

    func canAccess(_ entry: SecurityProtocol) -> Bool {
        entry.tier == .free || hasFullLibrary
    }

    // MARK: - Lifecycle

    init() {
        // Start listening before any purchase can occur, so transactions approved
        // outside the app (Ask to Buy, App Store redemption) are never missed.
        updatesTask = Task(priority: .background) { [weak self] in
            for await update in Transaction.updates {
                guard let self else { return }
                await self.handle(verification: update)
            }
        }
    }

    deinit {
        updatesTask?.cancel()
    }

    /// Loads product metadata and current entitlements. Safe to call more than once.
    func start() async {
        await refreshEntitlements()
        await loadProducts()
    }

    // MARK: - Products

    func loadProducts() async {
        guard !isLoadingProducts else { return }
        isLoadingProducts = true
        defer { isLoadingProducts = false }

        do {
            let fetched = try await Product.products(for: StoreProductID.allCases.map(\.rawValue))
            let order = StoreProductID.displayOrder.map(\.rawValue)
            products = fetched.sorted {
                (order.firstIndex(of: $0.id) ?? .max) < (order.firstIndex(of: $1.id) ?? .max)
            }
        } catch {
            // Not surfaced as an alert: the paywall falls back to describing the
            // products without prices, and offers a retry.
            products = []
        }
    }

    func product(for id: StoreProductID) -> Product? {
        products.first { $0.id == id.rawValue }
    }

    // MARK: - Purchasing

    @discardableResult
    func purchase(_ id: StoreProductID) async -> PurchaseOutcome? {
        guard let product = product(for: id) else {
            lastError = .productUnavailable
            return nil
        }
        return await purchase(product)
    }

    @discardableResult
    func purchase(_ product: Product) async -> PurchaseOutcome? {
        guard purchasingProductID == nil else { return nil }
        purchasingProductID = product.id
        defer { purchasingProductID = nil }

        do {
            switch try await product.purchase() {
            case .success(let verification):
                await handle(verification: verification)
                return .success
            case .pending:
                // Ask to Buy or Strong Customer Authentication. The transaction will
                // arrive later through Transaction.updates.
                return .pending
            case .userCancelled:
                return .cancelled
            @unknown default:
                return nil
            }
        } catch {
            lastError = .unknown(error.localizedDescription)
            return nil
        }
    }

    /// Restore Purchases. App Review requires this control on any app selling
    /// non-consumables, and it must work without an account.
    func restore() async {
        guard !isRestoring else { return }
        isRestoring = true
        defer { isRestoring = false }

        do {
            try await AppStore.sync()
        } catch {
            // sync() throws on cancellation of the sign-in sheet; entitlements are
            // still refreshed below, which covers the common "already signed in" case.
            lastError = .unknown(error.localizedDescription)
        }
        await refreshEntitlements()
    }

    // MARK: - Entitlements

    func refreshEntitlements() async {
        var granted: Set<Entitlement> = []
        var owned: Set<String> = []

        for await result in Transaction.currentEntitlements {
            guard let transaction = try? checkVerified(result) else { continue }
            guard transaction.revocationDate == nil else { continue }
            guard let id = StoreProductID(rawValue: transaction.productID) else { continue }
            owned.insert(transaction.productID)
            granted.formUnion(id.grants)
        }

        entitlements = granted
        ownedProductIDs = owned
    }

    private func handle(verification: VerificationResult<Transaction>) async {
        do {
            let transaction = try checkVerified(verification)
            await refreshEntitlements()
            // Tells the App Store the purchase was delivered. Without this the
            // transaction is replayed on every launch.
            await transaction.finish()
        } catch {
            lastError = .failedVerification
        }
    }

    private func checkVerified(_ result: VerificationResult<Transaction>) throws -> Transaction {
        switch result {
        case .unverified:
            throw StoreError.failedVerification
        case .verified(let transaction):
            return transaction
        }
    }
}
