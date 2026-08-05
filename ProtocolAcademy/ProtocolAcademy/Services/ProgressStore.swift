import Foundation
import Observation

/// Per-protocol learning record.
struct ProtocolProgress: Codable, Hashable, Sendable {
    var viewed = false
    var completedLessonIDs: Set<String> = []
    var bestCorrect = 0
    var quizTotal = 0
    var attempts = 0
    var lastStudied: Date?

    var bestScore: Double { quizTotal == 0 ? 0 : Double(bestCorrect) / Double(quizTotal) }
    var isQuizPassed: Bool { quizTotal > 0 && bestScore >= 0.7 }
    var isMastered: Bool { quizTotal > 0 && bestCorrect == quizTotal }
}

/// Stores learning progress locally.
///
/// Deliberately on-device only: the app collects no account and sends nothing to a
/// server, which is what lets the privacy manifest declare no data collection for
/// the app itself.
@MainActor
@Observable
final class ProgressStore {
    private static let storageKey = "progress.v1"

    private let defaults: UserDefaults
    private(set) var records: [String: ProtocolProgress] = [:]

    /// Counts training modules finished this session — drives interstitial pacing.
    private(set) var completionsThisSession = 0

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        load()
    }

    subscript(protocolID: String) -> ProtocolProgress {
        records[protocolID] ?? ProtocolProgress()
    }

    // MARK: - Mutations

    func markViewed(_ protocolID: String) {
        var record = self[protocolID]
        guard !record.viewed else { return }
        record.viewed = true
        record.lastStudied = .now
        write(record, for: protocolID)
    }

    func markLessonComplete(_ lessonID: String, in protocolID: String) {
        var record = self[protocolID]
        guard !record.completedLessonIDs.contains(lessonID) else { return }
        record.completedLessonIDs.insert(lessonID)
        record.lastStudied = .now
        write(record, for: protocolID)
    }

    func record(_ result: QuizResult) {
        var record = self[result.protocolID]
        record.attempts += 1
        record.quizTotal = result.total
        record.bestCorrect = max(record.bestCorrect, result.correct)
        record.lastStudied = .now
        write(record, for: result.protocolID)
        completionsThisSession += 1
    }

    func reset() {
        records = [:]
        completionsThisSession = 0
        defaults.removeObject(forKey: Self.storageKey)
    }

    // MARK: - Aggregates

    func completedCount(in catalog: ProtocolCatalog) -> Int {
        catalog.protocols.filter { self[$0.id].isQuizPassed }.count
    }

    func masteredCount(in catalog: ProtocolCatalog) -> Int {
        catalog.protocols.filter { self[$0.id].isMastered }.count
    }

    func lessonsRead(in catalog: ProtocolCatalog) -> Int {
        catalog.protocols.reduce(0) { $0 + self[$1.id].completedLessonIDs.count }
    }

    /// Fraction of the accessible library the learner has passed, 0...1.
    func overallProgress(in catalog: ProtocolCatalog, unlockedOnly: Bool, hasFullLibrary: Bool) -> Double {
        let pool = unlockedOnly && !hasFullLibrary ? catalog.freeProtocols : catalog.protocols
        guard !pool.isEmpty else { return 0 }
        let passed = pool.filter { self[$0.id].isQuizPassed }.count
        return Double(passed) / Double(pool.count)
    }

    /// The next protocol worth studying: unfinished, unlocked, easiest first.
    func suggestedNext(in catalog: ProtocolCatalog, hasFullLibrary: Bool) -> SecurityProtocol? {
        let pool = hasFullLibrary ? catalog.protocols : catalog.freeProtocols
        return pool
            .filter { !self[$0.id].isQuizPassed }
            .min { lhs, rhs in
                let order: [Difficulty] = [.foundational, .core, .advanced]
                let l = order.firstIndex(of: lhs.difficulty) ?? 0
                let r = order.firstIndex(of: rhs.difficulty) ?? 0
                return l == r ? lhs.name < rhs.name : l < r
            }
    }

    // MARK: - Persistence

    private func write(_ record: ProtocolProgress, for protocolID: String) {
        records[protocolID] = record
        save()
    }

    private func load() {
        guard let data = defaults.data(forKey: Self.storageKey) else { return }
        records = (try? JSONDecoder().decode([String: ProtocolProgress].self, from: data)) ?? [:]
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(records) else { return }
        defaults.set(data, forKey: Self.storageKey)
    }
}
