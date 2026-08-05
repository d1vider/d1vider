import Foundation

/// Loads and indexes the bundled protocol content.
///
/// Content ships as one JSON file per category so entries can be edited without
/// touching Swift code. `CatalogFile` mirrors the on-disk shape exactly.
struct ProtocolCatalog: Sendable {
    let protocols: [SecurityProtocol]

    private let byID: [String: SecurityProtocol]

    /// Filenames (without extension) of the bundled catalog files.
    static let resourceNames = [
        "catalog-transport",
        "catalog-network",
        "catalog-identity",
        "catalog-wireless",
        "catalog-messaging",
        "catalog-infrastructure",
    ]

    private struct CatalogFile: Decodable {
        let category: ProtocolCategory
        let protocols: [SecurityProtocol]
    }

    enum LoadError: LocalizedError {
        case missingResource(String)
        case duplicateIdentifier(String)

        var errorDescription: String? {
            switch self {
            case .missingResource(let name):
                "Catalog file \(name).json is missing from the app bundle."
            case .duplicateIdentifier(let id):
                "Two protocols share the identifier '\(id)'."
            }
        }
    }

    init(protocols: [SecurityProtocol]) throws {
        var index: [String: SecurityProtocol] = [:]
        for entry in protocols {
            guard index[entry.id] == nil else { throw LoadError.duplicateIdentifier(entry.id) }
            index[entry.id] = entry
        }
        // Free entries first, then by category order, then alphabetically — this is the
        // order the catalog list uses when no filter is applied.
        self.protocols = protocols.sorted { lhs, rhs in
            if lhs.tier != rhs.tier { return lhs.tier == .free }
            let lhsCategory = ProtocolCategory.allCases.firstIndex(of: lhs.category) ?? 0
            let rhsCategory = ProtocolCategory.allCases.firstIndex(of: rhs.category) ?? 0
            if lhsCategory != rhsCategory { return lhsCategory < rhsCategory }
            return lhs.name < rhs.name
        }
        self.byID = index
    }

    static func load(from bundle: Bundle = .main) throws -> ProtocolCatalog {
        let decoder = JSONDecoder()
        var all: [SecurityProtocol] = []
        for name in resourceNames {
            guard let url = bundle.url(forResource: name, withExtension: "json") else {
                throw LoadError.missingResource(name)
            }
            let file = try decoder.decode(CatalogFile.self, from: Data(contentsOf: url))
            all.append(contentsOf: file.protocols)
        }
        return try ProtocolCatalog(protocols: all)
    }

    subscript(id: String) -> SecurityProtocol? { byID[id] }

    func protocols(in category: ProtocolCategory) -> [SecurityProtocol] {
        protocols.filter { $0.category == category }
    }

    var freeProtocols: [SecurityProtocol] { protocols.filter { $0.tier == .free } }
    var premiumProtocols: [SecurityProtocol] { protocols.filter { $0.tier == .premium } }

    /// Case- and diacritic-insensitive search across the fields a learner would type.
    func search(_ query: String) -> [SecurityProtocol] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return protocols }
        return protocols.filter { entry in
            let haystack = [entry.name, entry.acronym, entry.tagline, entry.category.title]
                + entry.standards + entry.keyConcepts.map(\.term)
            return haystack.contains { $0.localizedCaseInsensitiveContains(trimmed) }
        }
    }
}
