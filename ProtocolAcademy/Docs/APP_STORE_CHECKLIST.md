# App Store submission checklist

Everything below has to be true before the build will pass review. Items marked
**[code]** are already handled in this repository; items marked **[you]** happen in
App Store Connect, the Apple Developer portal, or on a web host, and cannot be done
from source.

## 1. Apple Developer account and identifiers

- **[you]** Enrol in the Apple Developer Program ($99/year). In-app purchases are not
  available without it.
- **[you]** Complete **Agreements, Tax, and Banking** in App Store Connect. This is the
  single most common reason products return an empty list at runtime: until the *Paid
  Applications* agreement is active, `Product.products(for:)` returns nothing, the
  paywall shows "Prices couldn't be loaded", and review will reject the build as
  non-functional.
- **[you]** Register the App ID `com.d1vider.protocolacademy` with the **In-App
  Purchase** capability.
- **[code]** `PRODUCT_BUNDLE_IDENTIFIER` is set to `com.d1vider.protocolacademy` in both
  build configurations. Change it in `ProtocolAcademy.xcodeproj` *and* in
  `StoreProductID` if you use a different prefix.

## 2. In-app purchase products

Create three **Non-Consumable** products with exactly these product IDs:

| Product ID | Reference name | Suggested price |
|---|---|---|
| `com.d1vider.protocolacademy.removeads` | Remove Ads | Tier 2 ($1.99) |
| `com.d1vider.protocolacademy.fulllibrary` | Full Protocol Library | Tier 5 ($4.99) |
| `com.d1vider.protocolacademy.pro` | Academy Pro Bundle | Tier 6 ($5.99) |

- **[you]** Each product needs a display name, description, and a **review screenshot**
  of the paywall. Products submitted without a screenshot are rejected.
- **[you]** Submit the products **with the first build**. Products left in "Ready to
  Submit" are not reviewed on their own and the app will be rejected for selling
  something that does not exist.
- **[code]** `Products.storekit` mirrors these for local testing; the scheme already
  references it, so purchases work in the simulator with no App Store account.
- **[code]** `EntitlementTests.testProductIdentifiersMatchTheStoreKitConfiguration`
  fails if the two lists drift apart.

## 3. Guideline 3.1.1 — in-app purchase rules

- **[code]** All three products are non-consumables bought through StoreKit 2. There is
  no external payment path, no link to a website to buy, and no crypto or alternative
  currency.
- **[code]** **Restore Purchases** appears on the paywall *and* in Settings. Required
  for non-consumables, and it works with no account.
- **[code]** Prices come from `Product.displayPrice`, so they are always correct for the
  user's storefront and currency. Never hardcode a price in the UI.
- **[code]** Nothing is described as a subscription, because none of these are.
- **[code]** Purchase buttons are disabled until StoreKit returns a price, so a user can
  never tap Buy on an unknown amount.

## 4. Guideline 3.1.2 and 1.2 — terms and privacy links

- **[code]** The paywall links to a Privacy Policy and to Terms of Use (EULA).
- **[you]** Host both documents at real, publicly reachable URLs and update
  `AppLinks` in `Features/Store/PaywallView.swift`. Review does open these links.
  `Docs/PRIVACY_POLICY.md` is a starting draft written to match what the app actually
  does. The Terms link currently points at Apple's standard EULA, which is acceptable
  if you do not have your own.
- **[you]** Enter the same Privacy Policy URL in App Store Connect.

## 5. Privacy — nutrition label and manifest

- **[code]** `Resources/PrivacyInfo.xcprivacy` declares no tracking, no collected data,
  and one required-reason API (`UserDefaults`, reason `CA92.1`).
- **[code]** No analytics SDK, no accounts, no network calls other than StoreKit's.
- **[you]** In App Store Connect, answer **App Privacy** as *Data Not Collected* — but
  only while no ad SDK is linked. **Adding an ad network changes this answer**; see
  `ADS_INTEGRATION.md`.
- **[code]** `NSUserTrackingUsageDescription` is present, and the ATT prompt is only
  shown if the user turns on personalised ads in Settings. Do not move this to launch:
  prompting before the user has context is a frequent 5.1.2 rejection.

## 6. Guideline 4.2 and 2.1 — minimum functionality

- **[code]** Six complete protocols with full write-ups, 18 lessons, and 18 quiz
  questions are available before any purchase. The free tier is a usable app, not a
  demo, which is what 4.2 asks for.
- **[code]** The app works fully offline. Only the store needs a network.

## 7. Advertising

- **[code]** Every ad surface is labelled "Ad".
- **[code]** Interstitials never interrupt a lesson or quiz — they are only queued after
  a module is finished and the sheet has closed.
- **[code]** No interstitial on the first two completed modules, and never more than one
  in a three-minute window.
- **[code]** The interstitial close button is full-size and available immediately.
- **[you]** If you link an ad SDK, add its `SKAdNetworkItems` to `Config/Info.plist` and
  re-check the App Privacy answers.

## 8. Age rating and metadata

- **[you]** Suggested rating **12+**. The content is educational and describes attack
  techniques at a conceptual level, with no exploit code or tooling. Answer
  "Infrequent/Mild — Medical/Treatment Information: None", "Horror/Fear: None"; the
  relevant question is usually *Unrestricted Web Access* — answer **No**, the app has
  no browser.
- **[you]** Do not use the words "hack", "hacking tool", or "penetration testing" in
  the title or subtitle. Apple reviews security-adjacent apps carefully, and framing
  the app as educational reference material avoids an unnecessary round trip.
- **[you]** Screenshots for 6.9" and 6.5" iPhone displays are required. iPad
  screenshots are required because `TARGETED_DEVICE_FAMILY` is `1,2` — either supply
  them or change the setting to `1` for iPhone only.
- **[you]** Fill in the App Review notes: "No account required. All content is
  available without login. To test the paid tiers use the sandbox account provided, or
  tap Restore Purchases."

## 9. Export compliance

- **[code]** `ITSAppUsesNonExemptEncryption` is `false` in `Config/Info.plist`. The app
  implements no cryptography of its own and only uses Apple's TLS through StoreKit,
  which qualifies for the exemption. This stops TestFlight asking on every upload.

## 10. Before you archive

- **[you]** Set `DEVELOPMENT_TEAM` in the target's build settings (it is intentionally
  blank in the committed project so the file is not tied to one account).
- **[you]** Replace `Resources/Assets.xcassets/AppIcon.appiconset/icon-1024.png` if you
  want different artwork. The generated placeholder is a valid 1024×1024 PNG with no
  alpha channel, which is what App Store validation requires.
- **[code]** Run the unit tests — they check content integrity, entitlement mapping, and
  ad pacing.
- **[you]** Test purchases in the sandbox on a real device before submitting. The
  StoreKit configuration file exercises the code paths but not Apple's actual servers.
