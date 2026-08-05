import SwiftUI

struct ProtocolDetailView: View {
    @Environment(EntitlementStore.self) private var entitlements
    @Environment(ProgressStore.self) private var progress

    let entry: SecurityProtocol

    @State private var isTrainingPresented = false

    private var tint: Color { Theme.categoryTint(entry.category) }
    private var isLocked: Bool { !entitlements.canAccess(entry) }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Metrics.sectionSpacing) {
                header

                if isLocked {
                    LockedProtocolView(entry: entry)
                } else {
                    overview
                    trainingCallout
                    howItWorks
                    keyConcepts
                    threatModel
                    realWorld
                    reference
                    AdBannerSlot(placement: .protocolDetail)
                        .padding(.horizontal, -16)
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 32)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(entry.acronym)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if !isLocked { progress.markViewed(entry.id) }
        }
        .fullScreenCover(isPresented: $isTrainingPresented) {
            TrainingFlowView(entry: entry)
        }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                Image(systemName: entry.category.symbolName)
                    .font(.title2)
                    .foregroundStyle(.white)
                    .frame(width: 46, height: 46)
                    .background(Theme.brandGradient, in: RoundedRectangle(cornerRadius: 13, style: .continuous))
                    .accessibilityHidden(true)

                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.name)
                        .font(.title3.bold())
                        .fixedSize(horizontal: false, vertical: true)
                    if let year = entry.yearIntroduced {
                        Text("Introduced \(String(year))")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Text(entry.tagline)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 6) {
                TagChip(text: entry.category.title, systemImage: entry.category.symbolName, tint: tint)
                TagChip(text: entry.difficulty.title, tint: Theme.difficultyTint(entry.difficulty))
                TagChip(text: "\(entry.readingMinutes) min", systemImage: "clock", tint: .secondary)
            }
        }
        .padding(.top, 8)
    }

    private var overview: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeading(title: "Overview", systemImage: "text.alignleft")
            Text(entry.overview)
                .font(.body)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var trainingCallout: some View {
        let record = progress[entry.id]
        return Button {
            isTrainingPresented = true
        } label: {
            HStack(spacing: 14) {
                Image(systemName: record.isQuizPassed ? "arrow.clockwise.circle.fill" : "graduationcap.fill")
                    .font(.title2)
                    .foregroundStyle(.white)
                VStack(alignment: .leading, spacing: 3) {
                    Text(record.isQuizPassed ? "Retake training" : "Start training")
                        .font(.headline)
                        .foregroundStyle(.white)
                    Text("\(entry.training.lessons.count) lessons · \(entry.training.quiz.count) questions")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.9))
                }
                Spacer(minLength: 0)
                if record.quizTotal > 0 {
                    Text("\(Int((record.bestScore * 100).rounded()))%")
                        .font(.headline.monospacedDigit())
                        .foregroundStyle(.white)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity)
            .background(Theme.brandGradient, in: RoundedRectangle(cornerRadius: Theme.Metrics.cardCorner, style: .continuous))
        }
        .buttonStyle(.plain)
    }

    private var howItWorks: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeading(title: "How it works", systemImage: "list.number", detail: "\(entry.howItWorks.count) steps")
            VStack(alignment: .leading, spacing: 14) {
                ForEach(Array(entry.howItWorks.enumerated()), id: \.element.id) { index, step in
                    HStack(alignment: .top, spacing: 12) {
                        Text("\(index + 1)")
                            .font(.caption.bold().monospacedDigit())
                            .foregroundStyle(tint)
                            .frame(width: 22, height: 22)
                            .background(Circle().fill(tint.opacity(0.14)))
                            .accessibilityHidden(true)

                        VStack(alignment: .leading, spacing: 3) {
                            Text(step.title)
                                .font(.subheadline.weight(.semibold))
                            Text(step.detail)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
            }
            .cardStyle(tint: tint)
        }
    }

    private var keyConcepts: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeading(title: "Key concepts", systemImage: "key")
            VStack(alignment: .leading, spacing: 14) {
                ForEach(entry.keyConcepts) { concept in
                    VStack(alignment: .leading, spacing: 3) {
                        Text(concept.term)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(tint)
                        Text(concept.definition)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
            .cardStyle(tint: tint)
        }
    }

    private var threatModel: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeading(title: "Threat model", systemImage: "shield.lefthalf.filled")
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 9) {
                    Text("Protects against")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.green)
                    ForEach(entry.protects, id: \.self) {
                        BulletRow(text: $0, symbol: "checkmark.shield", tint: .green)
                    }
                }
                Divider()
                VStack(alignment: .leading, spacing: 9) {
                    Text("Does not protect against")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.orange)
                    ForEach(entry.weaknesses, id: \.self) {
                        BulletRow(text: $0, symbol: "exclamationmark.triangle", tint: .orange)
                    }
                }
            }
            .cardStyle()
        }
    }

    private var realWorld: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeading(title: "Where you'll meet it", systemImage: "building.2")
            VStack(alignment: .leading, spacing: 9) {
                ForEach(entry.realWorldUse, id: \.self) {
                    BulletRow(text: $0, symbol: "circle.fill", tint: tint)
                }
            }
            .cardStyle(tint: tint)
        }
    }

    private var reference: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeading(title: "Reference", systemImage: "doc.text")
            VStack(alignment: .leading, spacing: 12) {
                referenceRow(title: "Standards", values: entry.standards)
                Divider()
                referenceRow(title: "Ports", values: entry.ports)
            }
            .cardStyle()
        }
    }

    private func referenceRow(title: String, values: [String]) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            Text(values.joined(separator: " · "))
                .font(.subheadline.monospaced())
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
