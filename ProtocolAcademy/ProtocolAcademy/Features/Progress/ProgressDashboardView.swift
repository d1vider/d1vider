import SwiftUI

struct ProgressDashboardView: View {
    @Environment(EntitlementStore.self) private var entitlements
    @Environment(ProgressStore.self) private var progress

    let catalog: ProtocolCatalog

    private var accessible: [SecurityProtocol] {
        entitlements.hasFullLibrary ? catalog.protocols : catalog.freeProtocols
    }

    private var overall: Double {
        progress.overallProgress(
            in: catalog,
            unlockedOnly: true,
            hasFullLibrary: entitlements.hasFullLibrary
        )
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 18) {
                    summaryCard
                    AdBannerSlot(placement: .progressDashboard)
                        .padding(.horizontal, -16)
                    categoryBreakdown
                    studiedList
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Progress")
        }
    }

    private var summaryCard: some View {
        VStack(spacing: 16) {
            HStack(spacing: 20) {
                stat(value: "\(progress.completedCount(in: catalog))", label: "Passed")
                Divider().frame(height: 34)
                stat(value: "\(progress.masteredCount(in: catalog))", label: "Perfect")
                Divider().frame(height: 34)
                stat(value: "\(progress.lessonsRead(in: catalog))", label: "Lessons")
            }

            VStack(alignment: .leading, spacing: 6) {
                ProgressBar(value: overall, height: 8)
                Text("\(Int((overall * 100).rounded()))% of your unlocked library")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .cardStyle(tint: Theme.accent)
    }

    private func stat(value: String, label: String) -> some View {
        VStack(spacing: 3) {
            Text(value)
                .font(.title2.bold().monospacedDigit())
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .combine)
    }

    private var categoryBreakdown: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeading(title: "By category", systemImage: "chart.bar")
            VStack(spacing: 14) {
                ForEach(ProtocolCategory.allCases) { category in
                    let pool = accessible.filter { $0.category == category }
                    let done = pool.filter { progress[$0.id].isQuizPassed }.count
                    if !pool.isEmpty {
                        VStack(alignment: .leading, spacing: 5) {
                            HStack {
                                Label(category.title, systemImage: category.symbolName)
                                    .font(.subheadline.weight(.medium))
                                Spacer()
                                Text("\(done)/\(pool.count)")
                                    .font(.caption.monospacedDigit())
                                    .foregroundStyle(.secondary)
                            }
                            ProgressBar(
                                value: Double(done) / Double(pool.count),
                                tint: Theme.categoryTint(category)
                            )
                        }
                    }
                }
            }
            .cardStyle()
        }
    }

    @ViewBuilder
    private var studiedList: some View {
        let studied = accessible
            .filter { progress[$0.id].lastStudied != nil }
            .sorted { (progress[$0.id].lastStudied ?? .distantPast) > (progress[$1.id].lastStudied ?? .distantPast) }

        if studied.isEmpty {
            ContentUnavailableView(
                "Nothing studied yet",
                systemImage: "book.closed",
                description: Text("Open any protocol and finish its training to start building a record here.")
            )
            .padding(.top, 20)
        } else {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeading(title: "Recently studied", systemImage: "clock.arrow.circlepath")
                VStack(spacing: 0) {
                    ForEach(studied.prefix(8)) { entry in
                        let record = progress[entry.id]
                        HStack(spacing: 12) {
                            Image(systemName: entry.category.symbolName)
                                .font(.footnote)
                                .foregroundStyle(Theme.categoryTint(entry.category))
                                .frame(width: 26)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(entry.acronym)
                                    .font(.subheadline.weight(.medium))
                                Text("\(record.completedLessonIDs.count) of \(entry.training.lessons.count) lessons read")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer(minLength: 0)
                            if record.quizTotal > 0 {
                                Text("\(Int((record.bestScore * 100).rounded()))%")
                                    .font(.subheadline.monospacedDigit())
                                    .foregroundStyle(record.isQuizPassed ? .green : .secondary)
                            }
                        }
                        .padding(.vertical, 9)

                        if entry.id != studied.prefix(8).last?.id {
                            Divider()
                        }
                    }
                }
                .cardStyle()
            }
        }
    }
}
