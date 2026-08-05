import SwiftUI

/// Preview shown in place of the full write-up for premium protocols.
///
/// It deliberately shows real value — the first two sentences of the overview and the
/// list of concepts covered — so the upgrade decision is informed rather than blind.
struct LockedProtocolView: View {
    @Environment(\.showPaywall) private var showPaywall

    let entry: SecurityProtocol

    private var tint: Color { Theme.categoryTint(entry.category) }

    private var teaser: String {
        let sentences = entry.overview.split(separator: ".", omittingEmptySubsequences: true)
        return sentences.prefix(2).joined(separator: ".").trimmingCharacters(in: .whitespaces) + "…"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Metrics.sectionSpacing) {
            VStack(alignment: .leading, spacing: 10) {
                SectionHeading(title: "Overview", systemImage: "text.alignleft")
                Text(teaser)
                    .font(.body)
                    .fixedSize(horizontal: false, vertical: true)
            }

            VStack(alignment: .leading, spacing: 14) {
                HStack(spacing: 10) {
                    Image(systemName: "lock.fill")
                        .font(.title3)
                        .foregroundStyle(Theme.accent)
                    Text("Included with the full library")
                        .font(.headline)
                }

                VStack(alignment: .leading, spacing: 9) {
                    included("The complete \(entry.howItWorks.count)-step protocol walkthrough")
                    included("\(entry.keyConcepts.count) key concepts explained")
                    included("What it protects against — and what it doesn't")
                    included("\(entry.training.lessons.count) guided lessons with real-world context")
                    included("\(entry.training.quiz.count) quiz questions with explained answers")
                }

                Button { showPaywall() } label: {
                    Text("Unlock all 25 protocols")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Theme.brandGradient, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .foregroundStyle(.white)
                }
                .buttonStyle(.plain)
                .padding(.top, 4)
            }
            .cardStyle(tint: Theme.accent)

            VStack(alignment: .leading, spacing: 12) {
                SectionHeading(title: "Concepts covered", systemImage: "key")
                FlowingTagList(items: entry.keyConcepts.map(\.term))
            }

            VStack(alignment: .leading, spacing: 12) {
                SectionHeading(title: "Reference", systemImage: "doc.text")
                Text(entry.standards.joined(separator: " · "))
                    .font(.subheadline.monospaced())
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .cardStyle()
            }
        }
    }

    private func included(_ text: String) -> some View {
        BulletRow(text: text, symbol: "checkmark.circle.fill", tint: Theme.accent)
    }
}

/// Wrapping row of chips. `Layout` keeps it simple without measuring in a GeometryReader.
struct FlowingTagList: View {
    let items: [String]

    var body: some View {
        FlowLayout(spacing: 8) {
            ForEach(items, id: \.self) { item in
                TagChip(text: item, tint: .secondary)
            }
        }
    }
}

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var origin = CGPoint.zero
        var rowHeight: CGFloat = 0
        var totalHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if origin.x + size.width > maxWidth, origin.x > 0 {
                origin.x = 0
                origin.y += rowHeight + spacing
                totalHeight += rowHeight + spacing
                rowHeight = 0
            }
            origin.x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
        return CGSize(width: maxWidth == .infinity ? origin.x : maxWidth, height: totalHeight + rowHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var origin = bounds.origin
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if origin.x + size.width > bounds.maxX, origin.x > bounds.minX {
                origin.x = bounds.minX
                origin.y += rowHeight + spacing
                rowHeight = 0
            }
            subview.place(at: origin, proposal: ProposedViewSize(size))
            origin.x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}
