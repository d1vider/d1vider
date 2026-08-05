import SwiftUI

struct CatalogView: View {
    @Environment(EntitlementStore.self) private var entitlements
    @Environment(ProgressStore.self) private var progress
    @Environment(\.showPaywall) private var showPaywall

    let catalog: ProtocolCatalog

    @State private var query = ""
    @State private var selectedCategory: ProtocolCategory?

    private var results: [SecurityProtocol] {
        let searched = catalog.search(query)
        guard let selectedCategory else { return searched }
        return searched.filter { $0.category == selectedCategory }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 14) {
                    if query.isEmpty && selectedCategory == nil {
                        ContinueLearningCard(catalog: catalog)
                            .padding(.horizontal)
                    }

                    CategoryFilterBar(selection: $selectedCategory)

                    if results.isEmpty {
                        ContentUnavailableView.search(text: query)
                            .padding(.top, 40)
                    } else {
                        ForEach(Array(results.enumerated()), id: \.element.id) { index, entry in
                            NavigationLink(value: entry.id) {
                                ProtocolCard(
                                    entry: entry,
                                    progress: progress[entry.id],
                                    isLocked: !entitlements.canAccess(entry)
                                )
                            }
                            .buttonStyle(.plain)
                            .padding(.horizontal)

                            // A single in-feed placement, far enough down that content
                            // is always the first thing on screen.
                            if index == 3 {
                                AdBannerSlot(placement: .catalogFooter)
                            }
                        }
                    }

                    if !entitlements.hasFullLibrary {
                        UnlockPromptCard(lockedCount: catalog.premiumProtocols.count)
                            .padding(.horizontal)
                            .padding(.top, 6)
                    }
                }
                .padding(.vertical, 12)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Protocols")
            .searchable(text: $query, prompt: "Search protocols, RFCs, concepts")
            .navigationDestination(for: String.self) { id in
                if let entry = catalog[id] {
                    ProtocolDetailView(entry: entry)
                }
            }
            .toolbar {
                if !entitlements.ownsEverything {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Upgrade", systemImage: "sparkles") { showPaywall() }
                            .labelStyle(.titleOnly)
                            .font(.subheadline.weight(.semibold))
                    }
                }
            }
        }
    }
}

/// Horizontal category filter.
struct CategoryFilterBar: View {
    @Binding var selection: ProtocolCategory?

    var body: some View {
        ScrollView(.horizontal) {
            HStack(spacing: 8) {
                chip(title: "All", symbol: "square.grid.2x2", tint: .secondary, isSelected: selection == nil) {
                    selection = nil
                }
                ForEach(ProtocolCategory.allCases) { category in
                    chip(
                        title: category.title,
                        symbol: category.symbolName,
                        tint: Theme.categoryTint(category),
                        isSelected: selection == category
                    ) {
                        selection = selection == category ? nil : category
                    }
                }
            }
            .padding(.horizontal)
        }
        .scrollIndicators(.hidden)
    }

    private func chip(
        title: String,
        symbol: String,
        tint: Color,
        isSelected: Bool,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            Label(title, systemImage: symbol)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(isSelected ? .white : tint)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background {
                    Capsule().fill(isSelected ? tint : tint.opacity(0.12))
                }
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(isSelected ? [.isSelected, .isButton] : .isButton)
    }
}

/// Suggests the next protocol to study, based on stored progress.
struct ContinueLearningCard: View {
    @Environment(EntitlementStore.self) private var entitlements
    @Environment(ProgressStore.self) private var progress

    let catalog: ProtocolCatalog

    var body: some View {
        if let next = progress.suggestedNext(in: catalog, hasFullLibrary: entitlements.hasFullLibrary) {
            NavigationLink(value: next.id) {
                VStack(alignment: .leading, spacing: 10) {
                    Text(progress[next.id].viewed ? "Pick up where you left off" : "Start here")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.85))

                    Text(next.acronym)
                        .font(.title2.bold())
                        .foregroundStyle(.white)

                    Text(next.tagline)
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.9))
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)

                    HStack(spacing: 6) {
                        Image(systemName: "clock")
                        Text("\(next.readingMinutes) min read")
                        Text("·")
                        Text("\(next.training.lessons.count) lessons")
                    }
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.85))
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(18)
                .background(Theme.brandGradient, in: RoundedRectangle(cornerRadius: Theme.Metrics.cardCorner, style: .continuous))
            }
            .buttonStyle(.plain)
        }
    }
}

/// Bottom-of-list upsell. Distinct from an ad — this is first-party app content.
struct UnlockPromptCard: View {
    @Environment(\.showPaywall) private var showPaywall

    let lockedCount: Int

    var body: some View {
        Button { showPaywall() } label: {
            HStack(spacing: 14) {
                Image(systemName: "lock.open")
                    .font(.title3)
                    .foregroundStyle(Theme.accent)
                VStack(alignment: .leading, spacing: 3) {
                    Text("\(lockedCount) protocols still locked")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                    Text("Unlock the full library and every training module")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer(minLength: 0)
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.tertiary)
            }
            .multilineTextAlignment(.leading)
            .cardStyle(tint: Theme.accent)
        }
        .buttonStyle(.plain)
    }
}
