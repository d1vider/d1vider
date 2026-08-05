import SwiftUI

struct RootView: View {
    @Environment(AppModel.self) private var model
    @Environment(AdCoordinator.self) private var ads

    @State private var selectedTab: Tab = .learn
    @State private var isPaywallPresented = false

    enum Tab: Hashable {
        case learn, progress, settings
    }

    var body: some View {
        Group {
            if let catalog = model.catalog {
                TabView(selection: $selectedTab) {
                    CatalogView(catalog: catalog)
                        .tabItem { Label("Learn", systemImage: "books.vertical") }
                        .tag(Tab.learn)

                    ProgressDashboardView(catalog: catalog)
                        .tabItem { Label("Progress", systemImage: "chart.bar.xaxis") }
                        .tag(Tab.progress)

                    SettingsView(catalog: catalog)
                        .tabItem { Label("Settings", systemImage: "gearshape") }
                        .tag(Tab.settings)
                }
            } else {
                CatalogLoadFailureView(message: model.loadError)
            }
        }
        .environment(\.showPaywall) { isPaywallPresented = true }
        .sheet(isPresented: $isPaywallPresented) {
            PaywallView()
        }
        .fullScreenCover(item: interstitialBinding) { _ in
            if let view = AdRendererRegistry.shared.renderer.interstitialView(
                personalised: ads.usesPersonalisedAds,
                onDismiss: { ads.dismissInterstitial() }
            ) {
                view
            } else {
                Color.clear.onAppear { ads.dismissInterstitial() }
            }
        }
    }

    private var interstitialBinding: Binding<AdCoordinator.InterstitialContext?> {
        Binding(
            get: { ads.pendingInterstitial },
            set: { if $0 == nil { ads.dismissInterstitial() } }
        )
    }
}

/// Shown only if the bundled content fails to decode — a build or packaging problem
/// rather than something the user can fix, so the copy says so plainly.
struct CatalogLoadFailureView: View {
    let message: String?

    var body: some View {
        ContentUnavailableView {
            Label("Content unavailable", systemImage: "exclamationmark.triangle")
        } description: {
            Text(message ?? "The protocol library could not be loaded.")
        } actions: {
            Text("Reinstalling the app should resolve this.")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
    }
}
