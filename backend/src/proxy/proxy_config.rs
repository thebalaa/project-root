/// Holds configuration options for the local proxy.
#[derive(Debug)]
pub struct ProxyConfig {
    pub listen_addr: String,
    pub enable_https_mitm: bool,
}

impl Default for ProxyConfig {
    fn default() -> Self {
        ProxyConfig {
            listen_addr: "127.0.0.1:8080".to_string(),
            enable_https_mitm: false,
        }
    }
} 