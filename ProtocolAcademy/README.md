# Protocol Academy

An iOS app that teaches the security protocols the internet actually runs on — how each
one works, what it protects against, and where it fails — with guided lessons and
quizzes for every one of them.

Built with SwiftUI and StoreKit 2, targeting iOS 17+, with no third-party dependencies.

## What's in it

**25 protocols** across six categories, each with an overview, a step-by-step
walkthrough, key concepts, an explicit threat model (what it protects *and* what it
doesn't), real-world deployments, and the relevant RFCs.

| Category | Protocols |
|---|---|
| Transport & Web | TLS 1.3, HTTPS, mTLS, DTLS |
| Network & VPN | SSH, IPsec, WireGuard, OpenVPN, SFTP |
| Identity & Access | Kerberos, OAuth 2.0, OpenID Connect, SAML 2.0, FIDO2/WebAuthn, RADIUS, TACACS+ |
| Wireless & Ports | WPA3, 802.1X/EAP |
| Messaging & Email | Signal Protocol, SPF·DKIM·DMARC, S/MIME, OpenPGP, SRTP |
| Infrastructure | DNSSEC, SNMPv3 |

**Training:** 75 lessons and 75 quiz questions — three of each per protocol. Every
question has an explanation, and scores are tracked per protocol with a progress
dashboard.

**Free tier:** six protocols (TLS 1.3, HTTPS, SSH, IPsec, WPA3, DNSSEC) with their
complete write-ups and training. That is a genuinely useful app before anyone pays,
which is both the right thing to do and what App Review Guideline 4.2 expects.

## In-app purchases

Three **non-consumables** — no subscriptions, no recurring anything.

| Product | Unlocks |
|---|---|
| Remove Ads | No advertising anywhere in the app |
| Full Protocol Library | All 25 protocols and every training module |
| Academy Pro | Both, cheaper than buying them separately |

Handled by StoreKit 2 in `Services/EntitlementStore.swift`. Entitlements are derived
from `Transaction.currentEntitlements` — Apple's record, not a local flag — so
reinstalls and new devices restore correctly. Restore Purchases is on the paywall and in
Settings, as required for non-consumables.

## Advertising

Ad **surfaces and policy** ship here; an ad **network SDK** does not. `HouseAdRenderer`
fills every placement with a first-party upgrade promo, so the app builds and runs with
no external dependency and no tracking SDK.

To serve real ads, implement `AdRendering` for your network and register it at launch —
one call site. `Docs/ADS_INTEGRATION.md` walks through AdMob specifically, including the
privacy-manifest and App Store Connect changes it forces.

The pacing rules in `AdCoordinator` are the part worth keeping: no ads once ad-free is
owned, never during a lesson or quiz, none on the first two completed modules, at most
one interstitial per three minutes, and non-personalised unless the user explicitly opts
in (which is also the only thing that triggers an ATT prompt).

## Getting started

```
open ProtocolAcademy/ProtocolAcademy.xcodeproj
```

Requires Xcode 16 or later. Set `DEVELOPMENT_TEAM` in the target's Signing settings —
it is deliberately blank so the project is not tied to one account.

The shared scheme points at `Products.storekit`, so purchases work in the simulator
without an App Store account or any App Store Connect setup. Buy something, then use
*Debug ▸ StoreKit ▸ Manage Transactions* to reset it. If the paywall shows no prices on
first run, check *Product ▸ Scheme ▸ Edit Scheme ▸ Run ▸ Options ▸ StoreKit
Configuration* and select the file there — Xcode stores that path relative to the
scheme, and it can need re-picking after the project moves.

If the project file is ever damaged by a merge, `xcodegen generate` rebuilds an
equivalent one from `project.yml`.

## Tests

`⌘U` runs four suites:

- **CatalogTests** — every content file decodes, identifiers are unique, no quiz points
  at a missing option, no lesson is a stub. Content is data, and data rots quietly.
- **EntitlementTests** — what each product grants, and that `Products.storekit` and
  `StoreProductID` have not drifted apart.
- **ProgressTests** — scoring, the 70% pass threshold, persistence, and that a worse
  retake never lowers a best score.
- **AdPolicyTests** — the whole pacing table above, because that is what gets an app
  rejected.

## Project layout

```
ProtocolAcademy/
├── Config/Info.plist                 Explicit plist (export compliance, ATT string)
├── Products.storekit                 Local StoreKit testing configuration
├── Docs/
│   ├── APP_STORE_CHECKLIST.md        Everything needed to pass review
│   ├── ADS_INTEGRATION.md            Adding a real ad network
│   └── PRIVACY_POLICY.md             Draft policy matching what the app does
├── ProtocolAcademy/
│   ├── App/                          Entry point, root tabs, dependency wiring
│   ├── Models/                       Content model and catalog loader
│   ├── Content/                      Six JSON files — the entire library
│   ├── Services/                     StoreKit, progress, ad policy, ATT
│   ├── Features/                     Catalog, Detail, Training, Store, Progress, Settings
│   └── Resources/                    Assets, privacy manifest
└── ProtocolAcademyTests/
```

Content lives in JSON rather than Swift so protocols can be added or corrected without
touching code — add an entry to the right `Content/catalog-*.json` and the tests will
tell you if anything about it is incomplete.

## Before submitting

Read `Docs/APP_STORE_CHECKLIST.md`. The items that most often go wrong are outside the
code: the Paid Applications agreement being inactive (which makes products silently fail
to load), submitting the app without submitting the IAP products alongside it, and
privacy policy links that do not resolve.
