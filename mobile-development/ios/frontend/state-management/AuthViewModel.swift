import SwiftUI
import Combine

class AuthViewModel: ObservableObject {
    @Published var isAuthenticated: Bool = false
    
    func login(username: String, password: String) {
        // Example: Make a network request to Vapor server
        // This is the local or remote endpoint: "http://localhost:8080/api/login"
        // On success, set isAuthenticated = true
        // For demonstration:
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.isAuthenticated = true
        }
    }
    
    func logout() {
        isAuthenticated = false
    }
} 