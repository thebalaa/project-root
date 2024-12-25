use reqwest::{Client, Proxy};
use std::time::Duration;

/// Creates an HTTP client configured to route traffic through Tor (SOCKS5 proxy).
pub fn create_tor_http_client_from_config(config: &Config) -> Client {
    let proxy_url = config.get_str("tor.proxyUrl").unwrap_or_else(|_| "socks5h://127.0.0.1:9050".to_string());
    let timeout_sec = config.get_int("tor.timeoutSec").unwrap_or(60);

    let proxy = Proxy::all(proxy_url).expect("Failed to create socks5 proxy for Tor");
    reqwest::Client::builder()
        .proxy(proxy)
        .timeout(Duration::from_secs(timeout_sec as u64))
        .build()
        .expect("Failed to build Tor HTTP client")
}
