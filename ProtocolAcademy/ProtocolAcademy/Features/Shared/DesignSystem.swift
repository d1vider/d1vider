import SwiftUI

/// Visual constants for the app. Everything resolves through semantic system colours
/// so light mode, dark mode, and increased-contrast settings all work without extra
/// asset variants.
enum Theme {

    enum Metrics {
        static let cardCorner: CGFloat = 18
        static let chipCorner: CGFloat = 12
        static let cardPadding: CGFloat = 16
        static let sectionSpacing: CGFloat = 22
        static let hairline: CGFloat = 1 / 3
    }

    static let accent = Color("AccentColor")
    static let gradientStart = Color("BrandGradientStart")
    static let gradientEnd = Color("BrandGradientEnd")

    static var brandGradient: LinearGradient {
        LinearGradient(
            colors: [gradientStart, gradientEnd],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static func categoryTint(_ category: ProtocolCategory) -> Color {
        switch category {
        case .transport: .blue
        case .network: .teal
        case .identity: .indigo
        case .wireless: .orange
        case .messaging: .pink
        case .infrastructure: .green
        }
    }

    static func difficultyTint(_ difficulty: Difficulty) -> Color {
        switch difficulty {
        case .foundational: .green
        case .core: .blue
        case .advanced: .purple
        }
    }
}

/// Card container used throughout the app.
struct CardBackground: ViewModifier {
    var tint: Color = .clear

    func body(content: Content) -> some View {
        content
            .padding(Theme.Metrics.cardPadding)
            .background {
                RoundedRectangle(cornerRadius: Theme.Metrics.cardCorner, style: .continuous)
                    .fill(Color(.secondarySystemGroupedBackground))
                    .overlay {
                        RoundedRectangle(cornerRadius: Theme.Metrics.cardCorner, style: .continuous)
                            .strokeBorder(tint.opacity(0.18), lineWidth: 1)
                    }
            }
    }
}

extension View {
    func cardStyle(tint: Color = .clear) -> some View {
        modifier(CardBackground(tint: tint))
    }
}

/// Small rounded label — category, difficulty, lock state.
struct TagChip: View {
    let text: String
    var systemImage: String?
    var tint: Color = .secondary

    var body: some View {
        Label {
            Text(text)
        } icon: {
            if let systemImage {
                Image(systemName: systemImage)
            }
        }
        .labelStyle(.titleAndIcon)
        .font(.caption.weight(.semibold))
        .foregroundStyle(tint)
        .padding(.horizontal, 9)
        .padding(.vertical, 5)
        .background {
            RoundedRectangle(cornerRadius: Theme.Metrics.chipCorner, style: .continuous)
                .fill(tint.opacity(0.14))
        }
    }
}

/// Section header with an optional trailing detail.
struct SectionHeading: View {
    let title: String
    var systemImage: String?
    var detail: String?

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Label {
                Text(title)
            } icon: {
                if let systemImage { Image(systemName: systemImage) }
            }
            .font(.headline)
            Spacer()
            if let detail {
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .accessibilityAddTraits(.isHeader)
    }
}

/// A bulleted point used in the "protects against" and "weaknesses" lists.
struct BulletRow: View {
    let text: String
    var symbol: String
    var tint: Color

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: symbol)
                .font(.caption)
                .foregroundStyle(tint)
                .frame(width: 18)
                .padding(.top, 3)
                .accessibilityHidden(true)
            Text(text)
                .font(.subheadline)
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
    }
}

/// Thin progress bar with a label, used on cards and the dashboard.
struct ProgressBar: View {
    let value: Double
    var tint: Color = Theme.accent
    var height: CGFloat = 6

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(Color(.tertiarySystemFill))
                Capsule()
                    .fill(tint)
                    .frame(width: max(0, min(1, value)) * geo.size.width)
            }
        }
        .frame(height: height)
        .accessibilityElement()
        .accessibilityLabel("Progress")
        .accessibilityValue("\(Int((value * 100).rounded())) percent")
    }
}
