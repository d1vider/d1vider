import SwiftUI

struct ProtocolCard: View {
    let entry: SecurityProtocol
    let progress: ProtocolProgress
    let isLocked: Bool

    private var tint: Color { Theme.categoryTint(entry.category) }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: entry.category.symbolName)
                    .font(.title3)
                    .foregroundStyle(tint)
                    .frame(width: 40, height: 40)
                    .background {
                        RoundedRectangle(cornerRadius: 11, style: .continuous)
                            .fill(tint.opacity(0.14))
                    }
                    .accessibilityHidden(true)

                VStack(alignment: .leading, spacing: 3) {
                    Text(entry.acronym)
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Text(entry.name)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }

                Spacer(minLength: 0)

                if isLocked {
                    Image(systemName: "lock.fill")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .accessibilityHidden(true)
                } else if progress.isMastered {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.footnote)
                        .foregroundStyle(.green)
                        .accessibilityHidden(true)
                } else if progress.isQuizPassed {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.footnote)
                        .foregroundStyle(tint)
                        .accessibilityHidden(true)
                }
            }

            Text(entry.tagline)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.leading)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 6) {
                TagChip(text: entry.category.title, tint: tint)
                TagChip(text: entry.difficulty.title, tint: Theme.difficultyTint(entry.difficulty))
                if isLocked {
                    TagChip(text: "Locked", systemImage: "lock.fill", tint: .secondary)
                }
                Spacer(minLength: 0)
                Text("\(entry.readingMinutes) min")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }

            if !isLocked && progress.quizTotal > 0 {
                VStack(alignment: .leading, spacing: 5) {
                    ProgressBar(value: progress.bestScore, tint: tint)
                    Text("Best quiz score \(Int((progress.bestScore * 100).rounded()))%")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .cardStyle(tint: tint)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityLabel)
        .accessibilityAddTraits(.isButton)
    }

    private var accessibilityLabel: String {
        var parts = ["\(entry.acronym), \(entry.name)", entry.tagline, entry.difficulty.title]
        if isLocked {
            parts.append("Locked. Requires the full library upgrade.")
        } else if progress.isQuizPassed {
            parts.append("Quiz passed with \(Int((progress.bestScore * 100).rounded())) percent")
        }
        return parts.joined(separator: ". ")
    }
}
