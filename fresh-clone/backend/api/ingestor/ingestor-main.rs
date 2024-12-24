use axum::{routing::post, Json, Router};
use serde::Deserialize;
use tokio::sync::mpsc;
use std::net::SocketAddr;

mod queue; // Import the queue module

#[derive(Debug, Deserialize)]
struct CapturedData {
    id: String,
    url: String,
    headers: serde_json::Value,
    body: serde_json::Value,
    timestamp: u64,
    sensitive_data: bool,
}

#[tokio::main]
async fn main() {
    // Create a channel for background processing
    let (tx, rx) = mpsc::channel(100);

    // Spawn background worker
    tokio::spawn(async move {
        queue::process_queue(rx).await;
    });

    // Create the Axum router
    let app = Router::new()
        .route("/ingest", post(move |Json(payload): Json<Vec<CapturedData>>| {
            queue::ingest_data(payload, tx.clone())
        }));

    // Define the address for the server
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("Ingestor service running on {}", addr);

    // Start the server
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
