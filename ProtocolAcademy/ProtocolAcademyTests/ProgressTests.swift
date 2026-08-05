import XCTest
@testable import ProtocolAcademy

@MainActor
final class ProgressTests: XCTestCase {

    private var defaults: UserDefaults!
    private var suiteName: String!

    override func setUp() {
        super.setUp()
        suiteName = "progress.tests.\(UUID().uuidString)"
        defaults = UserDefaults(suiteName: suiteName)
    }

    override func tearDown() {
        defaults.removePersistentDomain(forName: suiteName)
        defaults = nil
        super.tearDown()
    }

    private func loadCatalog() throws -> ProtocolCatalog {
        try ProtocolCatalog.load(from: Bundle(for: ProgressStore.self))
    }

    func testDefaultRecordIsEmpty() {
        let store = ProgressStore(defaults: defaults)
        let record = store["tls13"]
        XCTAssertFalse(record.viewed)
        XCTAssertFalse(record.isQuizPassed)
        XCTAssertEqual(record.bestScore, 0)
        XCTAssertNil(record.lastStudied)
    }

    func testMarkViewedIsIdempotent() {
        let store = ProgressStore(defaults: defaults)
        store.markViewed("ssh")
        let firstTimestamp = store["ssh"].lastStudied
        store.markViewed("ssh")
        XCTAssertTrue(store["ssh"].viewed)
        XCTAssertEqual(store["ssh"].lastStudied, firstTimestamp, "A repeat view should not bump the timestamp")
    }

    func testLessonCompletionIsRecordedOnce() {
        let store = ProgressStore(defaults: defaults)
        store.markLessonComplete("ssh-l1", in: "ssh")
        store.markLessonComplete("ssh-l1", in: "ssh")
        store.markLessonComplete("ssh-l2", in: "ssh")
        XCTAssertEqual(store["ssh"].completedLessonIDs, ["ssh-l1", "ssh-l2"])
    }

    func testBestScoreOnlyImproves() {
        let store = ProgressStore(defaults: defaults)
        store.record(QuizResult(protocolID: "https", correct: 3, total: 3))
        store.record(QuizResult(protocolID: "https", correct: 1, total: 3))

        let record = store["https"]
        XCTAssertEqual(record.bestCorrect, 3, "A worse attempt must not lower the best score")
        XCTAssertEqual(record.attempts, 2)
        XCTAssertTrue(record.isMastered)
    }

    func testPassThreshold() {
        XCTAssertFalse(QuizResult(protocolID: "x", correct: 2, total: 3).passed, "2/3 is 66% — below the 70% bar")
        XCTAssertTrue(QuizResult(protocolID: "x", correct: 3, total: 3).passed)
        XCTAssertTrue(QuizResult(protocolID: "x", correct: 7, total: 10).passed)
        XCTAssertEqual(QuizResult(protocolID: "x", correct: 1, total: 4).percentText, "25%")
        XCTAssertEqual(QuizResult(protocolID: "x", correct: 0, total: 0).score, 0, "No divide-by-zero on an empty quiz")
    }

    func testProgressSurvivesReload() {
        let store = ProgressStore(defaults: defaults)
        store.record(QuizResult(protocolID: "ipsec", correct: 3, total: 3))
        store.markLessonComplete("ipsec-l1", in: "ipsec")

        let reloaded = ProgressStore(defaults: defaults)
        XCTAssertEqual(reloaded["ipsec"].bestCorrect, 3)
        XCTAssertEqual(reloaded["ipsec"].completedLessonIDs, ["ipsec-l1"])
    }

    func testResetClearsEverything() {
        let store = ProgressStore(defaults: defaults)
        store.record(QuizResult(protocolID: "dnssec", correct: 3, total: 3))
        store.reset()

        XCTAssertTrue(store.records.isEmpty)
        XCTAssertEqual(ProgressStore(defaults: defaults).records.count, 0, "Reset must clear the stored copy too")
    }

    func testAggregatesCountOnlyPassedProtocols() throws {
        let catalog = try loadCatalog()
        let store = ProgressStore(defaults: defaults)

        store.record(QuizResult(protocolID: "tls13", correct: 3, total: 3))
        store.record(QuizResult(protocolID: "https", correct: 2, total: 3))   // below threshold
        store.markLessonComplete("ssh-l1", in: "ssh")

        XCTAssertEqual(store.completedCount(in: catalog), 1)
        XCTAssertEqual(store.masteredCount(in: catalog), 1)
        XCTAssertEqual(store.lessonsRead(in: catalog), 1)
    }

    func testOverallProgressIsScopedToUnlockedContent() throws {
        let catalog = try loadCatalog()
        let store = ProgressStore(defaults: defaults)
        for entry in catalog.freeProtocols {
            store.record(QuizResult(protocolID: entry.id, correct: 3, total: 3))
        }

        XCTAssertEqual(
            store.overallProgress(in: catalog, unlockedOnly: true, hasFullLibrary: false), 1.0,
            accuracy: 0.001,
            "Passing every free protocol should read as 100% of the unlocked library"
        )
        XCTAssertLessThan(
            store.overallProgress(in: catalog, unlockedOnly: true, hasFullLibrary: true), 1.0,
            "With the library unlocked, the premium protocols count against the total"
        )
    }

    func testSuggestedNextRespectsLockingAndDifficulty() throws {
        let catalog = try loadCatalog()
        let store = ProgressStore(defaults: defaults)

        let first = try XCTUnwrap(store.suggestedNext(in: catalog, hasFullLibrary: false))
        XCTAssertEqual(first.tier, .free, "A locked protocol must never be suggested to a free user")

        store.record(QuizResult(protocolID: first.id, correct: 3, total: 3))
        let second = try XCTUnwrap(store.suggestedNext(in: catalog, hasFullLibrary: false))
        XCTAssertNotEqual(second.id, first.id, "A passed protocol should not be suggested again")
    }

    func testSuggestedNextIsNilWhenEverythingIsPassed() throws {
        let catalog = try loadCatalog()
        let store = ProgressStore(defaults: defaults)
        for entry in catalog.protocols {
            store.record(QuizResult(protocolID: entry.id, correct: 3, total: 3))
        }
        XCTAssertNil(store.suggestedNext(in: catalog, hasFullLibrary: true))
    }
}
