import StoreKit
import SwiftUI

struct StoreProductRow: View {
    let id: StoreProductID
    /// `nil` when App Store metadata could not be fetched — the row still renders,
    /// but the buy button is disabled because no price can be shown.
    let product: Product?
    let isOwned: Bool
    let isPurchasing: Bool
    let isRecommended: Bool
    let onBuy: () -> Void

    private var title: String { product?.displayName ?? id.fallbackTitle }
    private var description: String { product?.description ?? id.marketingDescription }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .firstTextBaseline) {
                Text(title)
                    .font(.headline)
                if isRecommended && !isOwned {
                    TagChip(text: "Best value", systemImage: "star.fill", tint: Theme.accent)
                }
                Spacer(minLength: 0)
                if let price = product?.displayPrice {
                    Text(price)
                        .font(.headline.monospacedDigit())
                }
            }

            Text(description)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            VStack(alignment: .leading, spacing: 7) {
                ForEach(id.benefits, id: \.self) { benefit in
                    BulletRow(text: benefit, symbol: "checkmark", tint: Theme.accent)
                }
            }

            buyButton
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle(tint: isRecommended ? Theme.accent : .clear)
    }

    @ViewBuilder
    private var buyButton: some View {
        if isOwned {
            Label("Purchased", systemImage: "checkmark.circle.fill")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.green)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.green.opacity(0.12), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        } else {
            Button(action: onBuy) {
                Group {
                    if isPurchasing {
                        ProgressView().tint(.white)
                    } else {
                        Text(product.map { "Buy for \($0.displayPrice)" } ?? "Unavailable")
                            .font(.subheadline.weight(.semibold))
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 13)
                .background(
                    product == nil
                        ? AnyShapeStyle(Color(.tertiarySystemFill))
                        : AnyShapeStyle(Theme.brandGradient),
                    in: RoundedRectangle(cornerRadius: 12, style: .continuous)
                )
                .foregroundStyle(product == nil ? Color.secondary : .white)
            }
            .buttonStyle(.plain)
            .disabled(product == nil || isPurchasing)
            .accessibilityLabel("Buy \(title)")
            .accessibilityValue(product?.displayPrice ?? "Price unavailable")
        }
    }
}
