use hyper::{
    client::HttpConnector,
    server::conn::AddrStream,
    service::{make_service_fn, service_fn},
    Body, Client, Request, Response, Uri,
};
use std::convert::TryFrom;
use std::net::SocketAddr;
use tokio::net::TcpListener;

use crate::utils::logger;

/// Spawns an HTTP proxy server on listen_addr.
/// This approach logs inbound requests and full response bodies.
pub async fn run_http_proxy(listen_addr: &str) -> anyhow::Result<()> {
    let http_connector = HttpConnector::new();
    let client = Client::builder().build::<_, Body>(http_connector);

    // This "make_service" is used to create a new service for each connection.
    let make_svc = make_service_fn(move |_conn: &AddrStream| {
        let client = client.clone();
        async move {
            Ok::<_, hyper::Error>(service_fn(move |req: Request<Body>| {
                let client = client.clone();
                async move {
                    // Log inbound request
                    logger::info(&format!("Incoming request: {} {}", req.method(), req.uri()));

                    // Create a new outbound request
                    // We combine the host from the request with the path/query
                    let uri_str = format!(
                        "{}://{}{}",
                        req.uri().scheme_str().unwrap_or("http"),
                        req.uri().host().unwrap_or(""),
                        req.uri().path_and_query().map(|pq| pq.as_str()).unwrap_or("")
                    );
                    let mut out_req = Request::builder()
                        .method(req.method())
                        .uri(Uri::try_from(uri_str)?);

                    // Copy headers
                    for (k, v) in req.headers() {
                        out_req = out_req.header(k, v);
                    }

                    let out_req = out_req.body(req.into_body())?;

                    // Send to the upstream server
                    let response = client.request(out_req).await?;

                    // Intercept the response body
                    let (parts, body) = response.into_parts();
                    let bytes = hyper::body::to_bytes(body).await?;
                    let body_str = String::from_utf8_lossy(&bytes);

                    logger::debug(&format!("Upstream response: {}", body_str));

                    // Construct a new response to send back
                    let new_resp = Response::from_parts(parts, Body::from(bytes));
                    Ok::<_, hyper::Error>(new_resp)
                }
            }))
        }
    });

    let addr: SocketAddr = listen_addr.parse()?;
    let listener = TcpListener::bind(addr).await?;
    logger::info(&format!("HTTP proxy listening on {}", addr));

    loop {
        let (stream, remote_addr) = listener.accept().await?;
        let svc = make_svc.call(&AddrStream::new(stream.try_clone()?, remote_addr)).await?;
        
        tokio::spawn(async move {
            if let Err(e) = hyper::server::conn::Http::new()
                .serve_connection(stream, svc)
                .await
            {
                logger::error(&format!("Connection error: {}", e));
            }
        });
    }
} 