import SwiftUI

/// Guided training: read the lessons, then answer the quiz, then see the result.
///
/// The flow is modal and never interrupted by advertising — an interstitial is only
/// offered by `AdCoordinator` after the module has finished and the sheet is closing.
struct TrainingFlowView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(ProgressStore.self) private var progress
    @Environment(AdCoordinator.self) private var ads

    let entry: SecurityProtocol

    @State private var stage: Stage = .lesson(0)
    @State private var answers: [String: Int] = [:]
    @State private var revealedQuestionIDs: Set<String> = []

    enum Stage: Equatable {
        case lesson(Int)
        case question(Int)
        case result
    }

    private var lessons: [Lesson] { entry.training.lessons }
    private var questions: [QuizQuestion] { entry.training.quiz }
    private var tint: Color { Theme.categoryTint(entry.category) }

    private var stepIndex: Int {
        switch stage {
        case .lesson(let i): i
        case .question(let i): lessons.count + i
        case .result: entry.training.stepCount
        }
    }

    private var result: QuizResult {
        let correct = questions.filter { question in
            answers[question.id].map(question.isCorrect) ?? false
        }.count
        return QuizResult(protocolID: entry.id, correct: correct, total: questions.count)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ProgressBar(
                    value: Double(stepIndex) / Double(max(1, entry.training.stepCount)),
                    tint: tint,
                    height: 4
                )
                .padding(.horizontal)
                .padding(.bottom, 12)

                ScrollView {
                    Group {
                        switch stage {
                        case .lesson(let index):
                            LessonCardView(lesson: lessons[index], index: index, total: lessons.count, tint: tint)
                        case .question(let index):
                            let question = questions[index]
                            QuizQuestionView(
                                question: question,
                                index: index,
                                total: questions.count,
                                tint: tint,
                                selection: answers[question.id],
                                isRevealed: revealedQuestionIDs.contains(question.id),
                                onSelect: { select($0, for: question) }
                            )
                        case .result:
                            TrainingResultView(entry: entry, result: result, tint: tint) { restart() }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 24)
                }

                footer
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle(entry.acronym)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { finish() }
                }
            }
        }
        .interactiveDismissDisabled(stage != .result)
    }

    // MARK: - Footer controls

    @ViewBuilder
    private var footer: some View {
        VStack(spacing: 10) {
            switch stage {
            case .lesson(let index):
                primaryButton(index + 1 == lessons.count ? "Start the quiz" : "Next lesson") {
                    progress.markLessonComplete(lessons[index].id, in: entry.id)
                    advance()
                }
            case .question(let index):
                let question = questions[index]
                if revealedQuestionIDs.contains(question.id) {
                    primaryButton(index + 1 == questions.count ? "See results" : "Next question") {
                        advance()
                    }
                } else {
                    primaryButton("Check answer", isEnabled: answers[question.id] != nil) {
                        withAnimation(.snappy) { revealedQuestionIDs.insert(question.id) }
                    }
                }
            case .result:
                primaryButton("Done") { finish() }
            }

            if case .lesson(let index) = stage, index > 0 {
                Button("Back") { stage = .lesson(index - 1) }
                    .font(.subheadline)
            }
        }
        .padding(.horizontal)
        .padding(.top, 8)
        .padding(.bottom, 12)
        .background(.bar)
    }

    private func primaryButton(_ title: String, isEnabled: Bool = true, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(
                    isEnabled ? AnyShapeStyle(Theme.brandGradient) : AnyShapeStyle(Color(.tertiarySystemFill)),
                    in: RoundedRectangle(cornerRadius: 14, style: .continuous)
                )
                .foregroundStyle(isEnabled ? .white : Color.secondary)
        }
        .buttonStyle(.plain)
        .disabled(!isEnabled)
    }

    // MARK: - Flow

    private func select(_ index: Int, for question: QuizQuestion) {
        guard !revealedQuestionIDs.contains(question.id) else { return }
        answers[question.id] = index
    }

    private func advance() {
        withAnimation(.snappy) {
            switch stage {
            case .lesson(let index):
                stage = index + 1 < lessons.count ? .lesson(index + 1) : .question(0)
            case .question(let index):
                if index + 1 < questions.count {
                    stage = .question(index + 1)
                } else {
                    progress.record(result)
                    stage = .result
                }
            case .result:
                break
            }
        }
    }

    private func restart() {
        withAnimation(.snappy) {
            answers = [:]
            revealedQuestionIDs = []
            stage = .question(0)
        }
    }

    private func finish() {
        let completed = stage == .result
        dismiss()
        // Queued after dismissal so the interstitial never covers the training itself.
        if completed {
            ads.trainingModuleCompleted(protocolID: entry.id)
        }
    }
}
