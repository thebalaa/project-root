import Vapor

public func configure(_ app: Application) throws {
    // Middleware, logging, etc.
    app.middleware.use(FileMiddleware(publicDirectory: app.directory.publicDirectory))
    // Additional app configuration, database setup, etc.
} 