import SwiftUI

@main
struct ProtocolAcademyApp: App {
    @State private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(model)
                .environment(model.entitlements)
                .environment(model.progress)
                .environment(model.ads)
                .task { await model.start() }
        }
    }
}

/// Top-level container for the app's long-lived services.
///
/// Everything is created eagerly and injected through the environment, so views take
/// their dependencies rather than reaching for singletons — which is what makes the
/// previews and unit tests in `ProtocolAcademyTests` possible.
@MainActor
@Observable
final class AppModel {
    let entitlements = EntitlementStore()
    let progress = ProgressStore()
    let ads = AdCoordinator()

    private(set) var catalog: ProtocolCatalog?
    private(set) var loadError: String?

    init() {
        ads.attach(entitlements: entitlements)
        do {
            catalog = try ProtocolCatalog.load()
        } catch {
            loadError = error.localizedDescription
        }
    }

    func start() async {
        await entitlements.start()
        AdRendererRegistry.shared.renderer.prepare(personalised: ads.usesPersonalisedAds)
    }
}
