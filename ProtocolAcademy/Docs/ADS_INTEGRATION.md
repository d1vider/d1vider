# Wiring up a real ad network

## What ships in this repository

The app has complete ad **surfaces, policy, and pacing** but **no third-party ad SDK**.
`HouseAdRenderer` fills every placement with a first-party promotion of the in-app
purchase, so the project builds and runs with zero external dependencies and the ad
layout can be reviewed without a network account.

That is a deliberate choice, not an omission: linking an ad SDK changes the app's
privacy manifest, its App Store privacy answers, and its dependency graph, and those
are decisions to make with a specific network in mind.

## The integration point

Everything the app needs from an ad network is behind one protocol in
`Services/AdRendering.swift`:

```swift
@MainActor
protocol AdRendering: AnyObject {
    func bannerView(for placement: AdPlacement, personalised: Bool) -> AnyView?
    func interstitialView(personalised: Bool, onDismiss: @escaping () -> Void) -> AnyView?
    func prepare(personalised: Bool)
}
```

Implement it for your network and register it once at launch, in `AppModel.start()`:

```swift
AdRendererRegistry.shared.register(GoogleMobileAdsRenderer())
```

Nothing else in the app changes. `AdCoordinator` still decides *whether* an ad may be
shown; the renderer only decides *what is drawn*.

## Google AdMob, step by step

1. **Add the SDK.** In Xcode: *File ▸ Add Package Dependencies* →
   `https://github.com/googleads/swift-package-manager-google-mobile-ads` and add it to
   the `ProtocolAcademy` target.

2. **Add your app ID to `Config/Info.plist`:**

   ```xml
   <key>GADApplicationIdentifier</key>
   <string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
   ```

3. **Add `SKAdNetworkItems`.** Google publishes the current list; it changes, so copy it
   from their documentation rather than from a blog post. Without it, attribution stops
   working and your revenue drops silently.

4. **Write the renderer.** A banner in SwiftUI needs a `UIViewRepresentable` wrapper
   around the SDK's banner view, and an interstitial needs a `UIViewController` to
   present from. Check the SDK version you installed for the current class names —
   they were renamed in the version 12 Swift API (`GADBannerView` → `BannerView`), so
   copying an older sample will not compile.

5. **Pass the personalisation flag through.** `AdCoordinator.usesPersonalisedAds` is
   already computed correctly from the in-app opt-in *and* the ATT status. Map it onto
   the network's non-personalised-ads request extra — for AdMob that is the `npa`
   parameter set to `"1"` when `personalised` is `false`.

6. **Use test unit IDs during development.** Google bans accounts that generate
   impressions on live units in testing. Their published test IDs are safe.

## What changes for App Review

Adding any ad SDK means all of the following become true, and each one is a rejection if
missed:

- **`Resources/PrivacyInfo.xcprivacy`** — set `NSPrivacyTracking` to `true`, list the
  network's domains in `NSPrivacyTrackingDomains`, and declare the data types it
  collects (for AdMob: Device ID, Advertising Data, Product Interaction, and Coarse
  Location if you leave location signals enabled).
- **App Store Connect ▸ App Privacy** — the answer stops being *Data Not Collected*.
  You must declare the SDK's collection and mark it as *Used for Tracking*.
- **ATT** — required before any tracking identifier is read. The app already gates this
  behind an explicit opt-in; do not "helpfully" move the prompt to launch.
- **Age rating** — some networks require you to declare the app may show ads.

## Keeping the ad policy intact

`AdCoordinator` enforces the rules that keep the app reviewable. If you change them,
change them deliberately:

| Rule | Where |
|---|---|
| No ads at all once `adFree` is owned | `isAdvertisingEnabled` |
| No interstitial during a lesson or quiz | `TrainingFlowView.finish()` queues only after dismissal |
| No interstitial on the first two completed modules | `interstitialWarmup` |
| At most one interstitial per three minutes | `minimumInterstitialInterval` |
| Non-personalised unless the user opts in | `usesPersonalisedAds` |

`ProtocolAcademyTests/AdPolicyTests.swift` covers every row in that table.
