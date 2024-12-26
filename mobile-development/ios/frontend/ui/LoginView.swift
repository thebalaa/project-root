import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var username = ""
    @State private var password = ""

    var body: some View {
        VStack(spacing: 16) {
            Text("Login with Web2 Credentials")
                .font(.title2)
            TextField("Username", text: $username)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .autocapitalization(.none)
            SecureField("Password", text: $password)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            Button("Login") {
                authViewModel.login(username: username, password: password)
            }
            .padding()
        }
        .padding()
    }
} 