import SwiftUI

@main
struct iOSApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    
    var body: some Scene {
        WindowGroup {
            NavigationView {
                if authViewModel.isAuthenticated {
                    DeviceLinkerView()
                } else {
                    LoginView()
                }
            }
            .environmentObject(authViewModel)
        }
    }
} 