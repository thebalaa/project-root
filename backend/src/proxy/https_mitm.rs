use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio_rustls::{
    rustls::{Certificate, PrivateKey, ServerConfig},
    TlsAcceptor,
};
use std::sync::Arc;
use crate::utils::logger;

pub struct HttpsMitm {
    tls_acceptor: TlsAcceptor,
}

impl HttpsMitm {
    /// Create from a root certificate and matching private key.
    pub fn new(root_cert: Certificate, key: PrivateKey) -> Self {
        let mut cfg = ServerConfig::new(rustls::NoClientAuth::new());
        cfg.set_single_cert(vec![root_cert], key)
           .expect("Invalid cert or key");
        let tls_acceptor = TlsAcceptor::from(Arc::new(cfg));

        HttpsMitm { tls_acceptor }
    }

    /// Handle CONNECT request
    pub async fn handle_connect(
        &self,
        mut inbound: tokio::net::TcpStream,
        dest_host: &str,
        dest_port: u16,
    ) -> anyhow::Result<()> {
        // Let browser know we "connected"
        inbound.write_all(b"HTTP/1.1 200 Connection Established\r\n\r\n").await?;
        
        // Upgrade inbound to TLS as if we were the target
        let inbound_tls = self.tls_acceptor.accept(inbound).await?;

        // Then connect out to the real server, do client TLS handshake...
        logger::info(&format!(
            "MITM established for {}:{}",
            dest_host, dest_port
        ));

        // Next steps: forward data between inbound_tls <-> real TLS server, capturing as needed.

        Ok(())
    }
} 