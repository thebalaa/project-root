use anyhow::Result;

mod proxy;
mod utils;
// If you want to keep old modules, you can import them here or not, e.g.:
// mod services;
// mod db;

use proxy::proxy_config::ProxyConfig;
use proxy::proxy_server::run_http_proxy;
use utils::logger;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    logger::init_logger();

    // Build a minimal proxy config
    let config = ProxyConfig::default(); // e.g. "127.0.0.1:8080"

    log::info!("Starting local proxy on {}", config.listen_addr);

    // Launch basic HTTP proxy
    run_http_proxy(&config.listen_addr).await?;

    Ok(())
} 