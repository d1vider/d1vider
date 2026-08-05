import SwiftUI

/// Drop-in banner slot.
///
/// Renders nothing at all when the ad-free entitlement is held, so callers do not
/// need to guard the placement themselves. Always labelled "Ad" — App Review requires
/// advertising to be clearly distinguishable from app content.
struct AdBannerSlot: View {
    @Environment(AdCoordinator.self) private var ads

    let placement: AdPlacement

    var body: some View {
        if ads.shouldShowBanner(at: placement),
           let creative = AdRendererRegistry.shared.renderer.bannerView(
               for: placement,
               personalised: ads.usesPersonalisedAds
           ) {
            creative
                .padding(.horizontal)
                .padding(.vertical, 8)
                .transition(.opacity)
        }
    }
}

/// The in-house banner creative.
struct HouseBannerCard: View {
    @Environment(\.showPaywall) private var showPaywall

    let creative: HouseAdRenderer.Creative
    let placement: AdPlacement

    var body: some View {
        Button {
            showPaywall()
        } label: {
            HStack(spacing: 12) {
                Image(systemName: creative.symbol)
                    .font(.title3)
                    .foregroundStyle(Theme.accent)
                    .frame(width: 36, height: 36)
                    .background {
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(Theme.accent.opacity(0.14))
                    }

                VStack(alignment: .leading, spacing: 2) {
                    Text(creative.headline)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                    Text(creative.body)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                .multilineTextAlignment(.leading)

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.tertiary)
            }
            .padding(12)
            .background {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color(.secondarySystemGroupedBackground))
            }
            .overlay(alignment: .topTrailing) {
                Text("Ad")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 5)
                    .padding(.vertical, 2)
                    .background(Color.secondary, in: RoundedRectangle(cornerRadius: 4, style: .continuous))
                    .padding(6)
                    .accessibilityHidden(true)
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Advertisement. \(creative.headline). \(creative.body)")
        .accessibilityHint("Opens upgrade options")
    }
}

/// Full-screen in-house interstitial shown between training modules.
///
/// The dismiss control is available immediately and is a full-size tappable target,
/// which is what App Review looks for — tiny or delayed close buttons are a common
/// rejection reason.
struct HouseInterstitialView: View {
    @Environment(\.showPaywall) private var showPaywall

    let onDismiss: () -> Void

    var body: some View {
        ZStack {
            Theme.brandGradient.ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer()

                Image(systemName: "shield.lefthalf.filled.badge.checkmark")
                    .font(.system(size: 64, weight: .light))
                    .foregroundStyle(.white)

                VStack(spacing: 10) {
                    Text("Keep the momentum going")
                        .font(.title2.bold())
                        .foregroundStyle(.white)
                    Text("Academy Pro unlocks all 25 protocols, every lesson and quiz, and removes ads for good.")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.9))
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, 32)

                Spacer()

                VStack(spacing: 12) {
                    Button {
                        onDismiss()
                        afterDismissal(showPaywall)
                    } label: {
                        Text("See upgrade options")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(.white, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .foregroundStyle(Theme.gradientEnd)
                    }

                    Button("Continue studying", action: onDismiss)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
            }
        }
        .overlay(alignment: .topTrailing) {
            Button(action: onDismiss) {
                Image(systemName: "xmark")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .padding(12)
                    .background(.black.opacity(0.25), in: Circle())
            }
            .padding()
            .accessibilityLabel("Close advertisement")
        }
        .overlay(alignment: .topLeading) {
            Text("Ad")
                .font(.caption2.weight(.bold))
                .foregroundStyle(.white)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(.black.opacity(0.25), in: Capsule())
                .padding()
        }
    }
}

// MARK: - Paywall presentation

/// Lets any view ask for the paywall without threading a binding through the hierarchy.
struct ShowPaywallKey: EnvironmentKey {
    static let defaultValue: () -> Void = {}
}

extension EnvironmentValues {
    var showPaywall: () -> Void {
        get { self[ShowPaywallKey.self] }
        set { self[ShowPaywallKey.self] = newValue }
    }
}

/// Presenting a sheet in the same run loop as dismissing a full-screen cover gets
/// dropped by SwiftUI, so anything that opens the paywall from inside a cover has to
/// wait for the dismissal to finish first.
@MainActor
func afterDismissal(_ action: @escaping () -> Void) {
    Task { @MainActor in
        try? await Task.sleep(for: .milliseconds(400))
        action()
    }
}
