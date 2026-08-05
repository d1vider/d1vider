import SwiftUI

struct LessonCardView: View {
    let lesson: Lesson
    let index: Int
    let total: Int
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Lesson \(index + 1) of \(total)")
                .font(.caption.weight(.semibold))
                .foregroundStyle(tint)

            Text(lesson.title)
                .font(.title2.bold())
                .fixedSize(horizontal: false, vertical: true)

            Text(lesson.body)
                .font(.body)
                .lineSpacing(3)
                .fixedSize(horizontal: false, vertical: true)

            VStack(alignment: .leading, spacing: 6) {
                Label("Takeaway", systemImage: "lightbulb.fill")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(tint)
                Text(lesson.takeaway)
                    .font(.subheadline.weight(.medium))
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardStyle(tint: tint)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 8)
    }
}

struct QuizQuestionView: View {
    let question: QuizQuestion
    let index: Int
    let total: Int
    let tint: Color
    let selection: Int?
    let isRevealed: Bool
    let onSelect: (Int) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Question \(index + 1) of \(total)")
                .font(.caption.weight(.semibold))
                .foregroundStyle(tint)

            Text(question.prompt)
                .font(.title3.bold())
                .fixedSize(horizontal: false, vertical: true)

            VStack(spacing: 10) {
                ForEach(Array(question.options.enumerated()), id: \.offset) { optionIndex, option in
                    OptionRow(
                        text: option,
                        state: state(for: optionIndex),
                        tint: tint
                    ) {
                        onSelect(optionIndex)
                    }
                    .disabled(isRevealed)
                }
            }

            if isRevealed {
                VStack(alignment: .leading, spacing: 6) {
                    Label(
                        selection.map(question.isCorrect) == true ? "Correct" : "Not quite",
                        systemImage: selection.map(question.isCorrect) == true
                            ? "checkmark.circle.fill" : "xmark.circle.fill"
                    )
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(selection.map(question.isCorrect) == true ? .green : .orange)

                    Text(question.explanation)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .cardStyle()
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 8)
    }

    private func state(for optionIndex: Int) -> OptionRow.State {
        guard isRevealed else {
            return selection == optionIndex ? .selected : .idle
        }
        if optionIndex == question.answerIndex { return .correct }
        if selection == optionIndex { return .incorrect }
        return .idle
    }
}

struct OptionRow: View {
    enum State { case idle, selected, correct, incorrect }

    let text: String
    let state: State
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: symbol)
                    .font(.body)
                    .foregroundStyle(foreground)
                    .accessibilityHidden(true)
                Text(text)
                    .font(.subheadline)
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color(.secondarySystemGroupedBackground))
                    .overlay {
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .strokeBorder(foreground.opacity(state == .idle ? 0 : 0.7), lineWidth: 1.5)
                    }
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel(text)
        .accessibilityValue(accessibilityValue)
        .accessibilityAddTraits(state == .selected ? [.isSelected, .isButton] : .isButton)
    }

    private var symbol: String {
        switch state {
        case .idle: "circle"
        case .selected: "largecircle.fill.circle"
        case .correct: "checkmark.circle.fill"
        case .incorrect: "xmark.circle.fill"
        }
    }

    private var foreground: Color {
        switch state {
        case .idle: .secondary
        case .selected: tint
        case .correct: .green
        case .incorrect: .orange
        }
    }

    private var accessibilityValue: String {
        switch state {
        case .idle: ""
        case .selected: "Selected"
        case .correct: "Correct answer"
        case .incorrect: "Your answer, incorrect"
        }
    }
}

struct TrainingResultView: View {
    @Environment(\.showPaywall) private var showPaywall
    @Environment(\.dismiss) private var dismiss
    @Environment(EntitlementStore.self) private var entitlements

    let entry: SecurityProtocol
    let result: QuizResult
    let tint: Color
    let onRetry: () -> Void

    var body: some View {
        VStack(spacing: 22) {
            ZStack {
                Circle()
                    .stroke(Color(.tertiarySystemFill), lineWidth: 12)
                Circle()
                    .trim(from: 0, to: result.score)
                    .stroke(tint, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 2) {
                    Text(result.percentText)
                        .font(.largeTitle.bold().monospacedDigit())
                    Text("\(result.correct) of \(result.total)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(width: 160, height: 160)
            .padding(.top, 24)
            .accessibilityElement()
            .accessibilityLabel("Quiz score")
            .accessibilityValue("\(result.correct) of \(result.total) correct")

            VStack(spacing: 8) {
                Text(headline)
                    .font(.title2.bold())
                Text(subhead)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Button("Retake the quiz", action: onRetry)
                .font(.subheadline.weight(.semibold))

            if !entitlements.hasFullLibrary {
                // Close the training cover first — a sheet presented over it is dropped.
                Button {
                    dismiss()
                    afterDismissal(showPaywall)
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: "lock.open")
                            .foregroundStyle(Theme.accent)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Keep going")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(.primary)
                            Text("19 more protocols with full training modules")
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
                .padding(.top, 8)
            }
        }
    }

    private var headline: String {
        switch result.correct {
        case result.total: "Perfect run"
        case _ where result.passed: "Passed"
        default: "Worth another pass"
        }
    }

    private var subhead: String {
        switch result.correct {
        case result.total:
            "You've got \(entry.acronym) down cold — every question correct."
        case _ where result.passed:
            "Solid understanding of \(entry.acronym). Review the explanations you missed and try again for a clean sweep."
        default:
            "Re-read the lessons — the explanations under each question point at exactly what to revisit."
        }
    }
}
