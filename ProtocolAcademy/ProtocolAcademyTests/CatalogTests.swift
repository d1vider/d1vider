import XCTest
@testable import ProtocolAcademy

/// Content integrity. The catalog is data, and data rots silently — these tests fail
/// loudly if an edit breaks decoding, duplicates an identifier, or leaves a quiz
/// question pointing at an option that no longer exists.
final class CatalogTests: XCTestCase {

    /// The app bundle, not the test bundle: the JSON is a resource of the host app.
    private var appBundle: Bundle { Bundle(for: ProgressStore.self) }

    private func loadCatalog() throws -> ProtocolCatalog {
        try ProtocolCatalog.load(from: appBundle)
    }

    func testEveryCatalogFileIsPresentAndDecodes() throws {
        for name in ProtocolCatalog.resourceNames {
            XCTAssertNotNil(
                appBundle.url(forResource: name, withExtension: "json"),
                "\(name).json is missing from the app bundle"
            )
        }
        XCTAssertNoThrow(try loadCatalog())
    }

    func testCatalogSizeAndTierSplit() throws {
        let catalog = try loadCatalog()
        XCTAssertEqual(catalog.protocols.count, 25)
        XCTAssertEqual(catalog.freeProtocols.count, 6)
        XCTAssertEqual(catalog.premiumProtocols.count, 19)
    }

    func testIdentifiersAreUnique() throws {
        let catalog = try loadCatalog()
        let ids = catalog.protocols.map(\.id)
        XCTAssertEqual(Set(ids).count, ids.count, "Duplicate protocol identifier")
    }

    func testDuplicateIdentifiersAreRejected() throws {
        let catalog = try loadCatalog()
        let first = try XCTUnwrap(catalog.protocols.first)
        XCTAssertThrowsError(try ProtocolCatalog(protocols: [first, first]))
    }

    func testEveryCategoryHasContent() throws {
        let catalog = try loadCatalog()
        for category in ProtocolCategory.allCases {
            XCTAssertFalse(
                catalog.protocols(in: category).isEmpty,
                "\(category.rawValue) has no protocols"
            )
        }
    }

    func testEveryProtocolHasCompleteContent() throws {
        let catalog = try loadCatalog()
        for entry in catalog.protocols {
            XCTAssertFalse(entry.name.isEmpty, "\(entry.id): empty name")
            XCTAssertFalse(entry.tagline.isEmpty, "\(entry.id): empty tagline")
            XCTAssertGreaterThan(entry.overview.count, 120, "\(entry.id): overview too thin")
            XCTAssertGreaterThanOrEqual(entry.howItWorks.count, 4, "\(entry.id): needs 4+ steps")
            XCTAssertGreaterThanOrEqual(entry.keyConcepts.count, 4, "\(entry.id): needs 4+ concepts")
            XCTAssertFalse(entry.protects.isEmpty, "\(entry.id): nothing in protects")
            XCTAssertFalse(entry.weaknesses.isEmpty, "\(entry.id): nothing in weaknesses")
            XCTAssertFalse(entry.realWorldUse.isEmpty, "\(entry.id): nothing in realWorldUse")
            XCTAssertFalse(entry.standards.isEmpty, "\(entry.id): no standards listed")
            XCTAssertGreaterThan(entry.readingMinutes, 0, "\(entry.id): reading time not set")
        }
    }

    func testTrainingModulesAreWellFormed() throws {
        let catalog = try loadCatalog()
        for entry in catalog.protocols {
            let training = entry.training
            XCTAssertGreaterThanOrEqual(training.lessons.count, 3, "\(entry.id): fewer than 3 lessons")
            XCTAssertGreaterThanOrEqual(training.quiz.count, 3, "\(entry.id): fewer than 3 questions")
            XCTAssertEqual(training.stepCount, training.lessons.count + training.quiz.count)

            for lesson in training.lessons {
                XCTAssertFalse(lesson.title.isEmpty, "\(lesson.id): empty title")
                XCTAssertGreaterThan(lesson.body.count, 200, "\(lesson.id): body too short to teach anything")
                XCTAssertFalse(lesson.takeaway.isEmpty, "\(lesson.id): missing takeaway")
            }

            for question in training.quiz {
                XCTAssertEqual(question.options.count, 4, "\(question.id): expected 4 options")
                XCTAssertTrue(
                    question.options.indices.contains(question.answerIndex),
                    "\(question.id): answerIndex out of range"
                )
                XCTAssertEqual(
                    Set(question.options).count, question.options.count,
                    "\(question.id): duplicate options"
                )
                XCTAssertFalse(question.explanation.isEmpty, "\(question.id): missing explanation")
                XCTAssertTrue(question.isCorrect(question.answerIndex))
                let wrong = question.options.indices.first { $0 != question.answerIndex }
                XCTAssertFalse(question.isCorrect(try XCTUnwrap(wrong)))
            }

            let lessonIDs = training.lessons.map(\.id)
            XCTAssertEqual(Set(lessonIDs).count, lessonIDs.count, "\(entry.id): duplicate lesson id")
            let quizIDs = training.quiz.map(\.id)
            XCTAssertEqual(Set(quizIDs).count, quizIDs.count, "\(entry.id): duplicate question id")
        }
    }

    func testFreeTierCoversTheFundamentals() throws {
        let catalog = try loadCatalog()
        let freeIDs = Set(catalog.freeProtocols.map(\.id))
        // Someone who never pays should still leave understanding the basics.
        for id in ["tls13", "https", "ssh"] {
            XCTAssertTrue(freeIDs.contains(id), "\(id) should be free")
        }
    }

    func testSortingPutsFreeProtocolsFirst() throws {
        let catalog = try loadCatalog()
        let firstPremiumIndex = try XCTUnwrap(catalog.protocols.firstIndex { $0.tier == .premium })
        let lastFreeIndex = try XCTUnwrap(catalog.protocols.lastIndex { $0.tier == .free })
        XCTAssertLessThan(lastFreeIndex, firstPremiumIndex)
    }

    func testSearchMatchesNameAcronymAndStandard() throws {
        let catalog = try loadCatalog()
        XCTAssertTrue(catalog.search("kerberos").contains { $0.id == "kerberos" })
        XCTAssertTrue(catalog.search("WPA3").contains { $0.id == "wpa3" })
        XCTAssertTrue(catalog.search("rfc 8446").contains { $0.id == "tls13" })
        XCTAssertTrue(catalog.search("passkey").contains { $0.id == "fido2" })
        XCTAssertEqual(catalog.search("   ").count, catalog.protocols.count)
        XCTAssertTrue(catalog.search("zzzznotaprotocol").isEmpty)
    }

    func testSubscriptLookup() throws {
        let catalog = try loadCatalog()
        XCTAssertEqual(catalog["wireguard"]?.acronym, "WireGuard")
        XCTAssertNil(catalog["does-not-exist"])
    }
}
