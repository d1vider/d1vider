import Foundation

/// A single cybersecurity protocol entry, decoded from the bundled catalog JSON.
struct SecurityProtocol: Identifiable, Codable, Hashable, Sendable {
    let id: String
    let name: String
    let acronym: String
    let category: ProtocolCategory
    let tier: AccessTier
    let difficulty: Difficulty
    let readingMinutes: Int
    let yearIntroduced: Int?
    let ports: [String]
    let standards: [String]
    let tagline: String
    let overview: String
    let howItWorks: [Step]
    let keyConcepts: [KeyConcept]
    let protects: [String]
    let weaknesses: [String]
    let realWorldUse: [String]
    let training: TrainingModule

    struct Step: Codable, Hashable, Identifiable, Sendable {
        let title: String
        let detail: String
        var id: String { title }
    }

    struct KeyConcept: Codable, Hashable, Identifiable, Sendable {
        let term: String
        let definition: String
        var id: String { term }
    }
}

enum ProtocolCategory: String, Codable, CaseIterable, Identifiable, Sendable {
    case transport
    case network
    case identity
    case wireless
    case messaging
    case infrastructure

    var id: String { rawValue }

    var title: String {
        switch self {
        case .transport: "Transport & Web"
        case .network: "Network & VPN"
        case .identity: "Identity & Access"
        case .wireless: "Wireless & Ports"
        case .messaging: "Messaging & Email"
        case .infrastructure: "Infrastructure"
        }
    }

    /// SF Symbol used on category chips and cards.
    var symbolName: String {
        switch self {
        case .transport: "globe.americas"
        case .network: "network"
        case .identity: "person.badge.key"
        case .wireless: "wifi"
        case .messaging: "envelope.badge.shield.half.filled"
        case .infrastructure: "server.rack"
        }
    }
}

enum AccessTier: String, Codable, Sendable {
    /// Available to everyone, including users who have not purchased anything.
    case free
    /// Requires the full-library entitlement.
    case premium
}

enum Difficulty: String, Codable, CaseIterable, Sendable {
    case foundational
    case core
    case advanced

    var title: String {
        switch self {
        case .foundational: "Foundational"
        case .core: "Core"
        case .advanced: "Advanced"
        }
    }
}
