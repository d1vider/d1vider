import SwiftUI

struct SettingsView: View {
    @Environment(EntitlementStore.self) private var entitlements
    @Environment(ProgressStore.self) private var progress
    @Environment(AdCoordinator.self) private var ads
    @Environment(\.openURL) private var openURL
    @Environment(\.showPaywall) private var showPaywall

    let catalog: ProtocolCatalog

    @State private var isResetConfirmationPresented = false
    @State private var restoreMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                purchasesSection
                if ads.isAdvertisingEnabled { advertisingSection }
                learningSection
                aboutSection
            }
            .navigationTitle("Settings")
            .alert("Reset progress?", isPresented: $isResetConfirmationPresented) {
                Button("Reset", role: .destructive) { progress.reset() }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This clears every quiz score and lesson you've completed on this device. Purchases are not affected.")
            }
            .alert(
                "Restore Purchases",
                isPresented: Binding(get: { restoreMessage != nil }, set: { if !$0 { restoreMessage = nil } })
            ) {
                Button("OK", role: .cancel) { restoreMessage = nil }
            } message: {
                Text(restoreMessage ?? "")
            }
        }
    }

    // MARK: - Sections

    private var purchasesSection: some View {
        Section {
            LabeledContent("Full library") {
                Text(entitlements.hasFullLibrary ? "Unlocked" : "Locked")
                    .foregroundStyle(entitlements.hasFullLibrary ? .green : .secondary)
            }
            LabeledContent("Advertising") {
                Text(entitlements.hasAdFree ? "Removed" : "On")
                    .foregroundStyle(entitlements.hasAdFree ? .green : .secondary)
            }

            if !entitlements.ownsEverything {
                Button("View upgrade options") { showPaywall() }
            }

            Button {
                Task {
                    await entitlements.restore()
                    restoreMessage = entitlements.ownedProductIDs.isEmpty
                        ? "No previous purchases were found for this Apple Account."
                        : "Your purchases have been restored."
                }
            } label: {
                if entitlements.isRestoring {
                    HStack { Text("Restoring…"); Spacer(); ProgressView() }
                } else {
                    Text("Restore Purchases")
                }
            }
            .disabled(entitlements.isRestoring)
        } header: {
            Text("Purchases")
        } footer: {
            Text("All purchases are one-time and tied to your Apple Account. Restoring works on any device signed in with the same account.")
        }
    }

    private var advertisingSection: some View {
        Section {
            Toggle(
                "Personalised ads",
                isOn: Binding(
                    get: { ads.usesPersonalisedAds },
                    set: { newValue in
                        Task {
                            if newValue {
                                await ads.enablePersonalisation()
                            } else {
                                ads.disablePersonalisation()
                            }
                        }
                    }
                )
            )

            if ads.personalisationOptIn && !TrackingAuthorization.current.allowsPersonalisedAds {
                Text("Tracking is turned off for this app in iOS Settings, so ads stay non-personalised.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Button("Remove ads permanently") { showPaywall() }
        } header: {
            Text("Advertising")
        } footer: {
            Text("Ads are non-personalised by default and no tracking identifier is used. Turning this on asks iOS for permission first, and you can change your mind at any time.")
        }
    }

    private var learningSection: some View {
        Section {
            LabeledContent("Protocols passed", value: "\(progress.completedCount(in: catalog)) of \(accessibleCount)")
            LabeledContent("Lessons read", value: "\(progress.lessonsRead(in: catalog))")
            Button("Reset progress", role: .destructive) { isResetConfirmationPresented = true }
        } header: {
            Text("Learning")
        } footer: {
            Text("Progress is stored only on this device. Nothing is uploaded and no account is required.")
        }
    }

    private var aboutSection: some View {
        Section {
            LabeledContent("Version", value: Bundle.main.shortVersionString)
            Button("Privacy Policy") { openURL(AppLinks.privacyPolicy) }
            Button("Terms of Use") { openURL(AppLinks.termsOfUse) }
            Button("Support") { openURL(AppLinks.support) }
        } header: {
            Text("About")
        } footer: {
            Text("Protocol Academy is an educational reference. It explains how security protocols work and where they fail — it is not a substitute for professional security advice or a formal certification course.")
        }
    }

    private var accessibleCount: Int {
        entitlements.hasFullLibrary ? catalog.protocols.count : catalog.freeProtocols.count
    }
}

extension Bundle {
    var shortVersionString: String {
        let version = infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let build = infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(version) (\(build))"
    }
}
