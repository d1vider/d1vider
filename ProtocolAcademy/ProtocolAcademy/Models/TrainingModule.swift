import Foundation

/// The guided training attached to each protocol: read the lessons, then answer the quiz.
struct TrainingModule: Codable, Hashable, Sendable {
    let lessons: [Lesson]
    let quiz: [QuizQuestion]

    /// Total number of steps in the training flow — every lesson plus every question.
    var stepCount: Int { lessons.count + quiz.count }
}

struct Lesson: Codable, Hashable, Identifiable, Sendable {
    let id: String
    let title: String
    let body: String
    let takeaway: String
}

struct QuizQuestion: Codable, Hashable, Identifiable, Sendable {
    let id: String
    let prompt: String
    let options: [String]
    let answerIndex: Int
    let explanation: String

    func isCorrect(_ index: Int) -> Bool { index == answerIndex }
}

/// The outcome of one completed quiz attempt.
struct QuizResult: Hashable, Sendable {
    let protocolID: String
    let correct: Int
    let total: Int

    var score: Double { total == 0 ? 0 : Double(correct) / Double(total) }
    var passed: Bool { score >= 0.7 }

    var percentText: String { "\(Int((score * 100).rounded()))%" }
}
