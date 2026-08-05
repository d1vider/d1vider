import StoreKit
import SwiftUI

/// In-app purchase screen.
///
/// App Review requirements this screen satisfies (Guidelines 3.1.1 and 3.1.2):
/// * Every product's title, description, and App Store price are shown before purchase.
/// * A Restore Purchases control is always available and works without an account.
/// * Terms of Use (EULA) and Privacy Policy links are present on the purchase screen.
/// * Nothing is described as a subscription — all three products are one-time
///   non-consumables, and the copy says so explicitly.
struct PaywallView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.openURL) private var openURL
    @Environment(EntitlementStore.self) private var store

    @State private var confirmation: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 22) {
                    header

                    if store.ownsEverything {
                        allUnlockedCard
                    } else {
                        VStack(spacing: 12) {
                            ForEach(StoreProductID.displayOrder, id: \.rawValue) { id in
                                StoreProductRow(
                                    id: id,
                                    product: store.product(for: id),
                                    isOwned: store.isRedundant(id),
                                    isPurchasing: store.purchasingProductID == id.rawValue,
                                    isRecommended: id == .pro
                                ) {
                                    Task { await buy(id) }
                                }
                            }
                        }

                        if store.products.isEmpty && !store.isLoadingProducts {
                            unavailableNotice
                        }
                    }

                    footer
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Upgrade")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .overlay {
                if store.isLoadingProducts && store.products.isEmpty {
                    ProgressView("Contacting the App Store…")
                        .padding()
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
            }
            .alert("Purchase", isPresented: confirmationBinding) {
                Button("OK", role: .cancel) { confirmation = nil }
            } message: {
                Text(confirmation ?? "")
            }
            .alert(
                "Something went wrong",
                isPresented: Binding(get: { store.lastError != nil }, set: { if !$0 { store.lastError = nil } })
            ) {
                Button("OK", role: .cancel) { store.lastError = nil }
            } message: {
                Text(store.lastError?.errorDescription ?? "")
            }
        }
        .task { await store.loadProducts() }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(spacing: 12) {
            Image(systemName: "shield.lefthalf.filled.badge.checkmark")
                .font(.system(size: 46, weight: .light))
                .foregroundStyle(.white)
                .frame(width: 84, height: 84)
                .background(Theme.brandGradient, in: RoundedRectangle(cornerRadius: 22, style: .continuous))

            Text("Go deeper on 25 protocols")
                .font(.title2.bold())
                .multilineTextAlignment(.center)

            Text("One-time purchases. No subscription, no account, nothing recurring.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 8)
    }

    private var allUnlockedCard: some View {
        VStack(spacing: 10) {
            Image(systemName: "checkmark.seal.fill")
                .font(.largeTitle)
                .foregroundStyle(.green)
            Text("Everything is unlocked")
                .font(.headline)
            Text("You own the full protocol library and the app is ad-free. Thank you for the support.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .cardStyle(tint: .green)
    }

    private var unavailableNotice: some View {
        VStack(spacing: 8) {
            Text("Prices couldn't be loaded")
                .font(.subheadline.weight(.semibold))
            Text("Check your connection and try again. You won't be charged for anything until a price is shown and you confirm with the App Store.")
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Retry") { Task { await store.loadProducts() } }
                .font(.subheadline.weight(.semibold))
                .padding(.top, 2)
        }
        .frame(maxWidth: .infinity)
        .cardStyle(tint: .orange)
    }

    private var footer: some View {
        VStack(spacing: 14) {
            Button {
                Task {
                    await store.restore()
                    confirmation = store.ownedProductIDs.isEmpty
                        ? "No previous purchases were found for this Apple Account."
                        : "Your purchases have been restored."
                }
            } label: {
                if store.isRestoring {
                    ProgressView()
                } else {
                    Text("Restore Purchases")
                        .font(.subheadline.weight(.semibold))
                }
            }
            .disabled(store.isRestoring)

            Text("Purchases are tied to your Apple Account and can be restored on any device you sign in to.")
                .font(.caption2)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            HStack(spacing: 16) {
                Button("Terms of Use") { openURL(AppLinks.termsOfUse) }
                Button("Privacy Policy") { openURL(AppLinks.privacyPolicy) }
            }
            .font(.caption)
        }
        .padding(.top, 6)
    }

    private var confirmationBinding: Binding<Bool> {
        Binding(get: { confirmation != nil }, set: { if !$0 { confirmation = nil } })
    }

    private func buy(_ id: StoreProductID) async {
        switch await store.purchase(id) {
        case .success:
            confirmation = "Unlocked. Enjoy the rest of the library."
        case .pending:
            confirmation = "This purchase needs approval before it can complete. It will unlock automatically once approved."
        case .cancelled, .none:
            break
        }
    }
}

/// External links shown on the purchase screen. App Review checks that both resolve.
enum AppLinks {
    static let privacyPolicy = URL(string: "https://d1vider.github.io/protocol-academy/privacy")!
    static let termsOfUse = URL(string: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")!
    static let support = URL(string: "https://d1vider.github.io/protocol-academy/support")!
}
