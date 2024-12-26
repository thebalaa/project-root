// swift-tools-version:5.7
import PackageDescription

let package = Package(
    name: "iOSBackendServer",
    platforms: [
        .macOS(.v12)
    ],
    products: [
        .executable(name: "Run", targets: ["App"]),
    ],
    dependencies: [
        // Vapor web framework
        .package(url: "https://github.com/vapor/vapor.git", from: "4.60.0"),
        // For bridging with any additional Keychain or cryptographic libs as needed
    ],
    targets: [
        .target(name: "App", dependencies: [.product(name: "Vapor", package: "vapor")]),
        .executableTarget(name: "Run", dependencies: ["App"]),
        .testTarget(name: "AppTests", dependencies: ["App"])
    ]
) 