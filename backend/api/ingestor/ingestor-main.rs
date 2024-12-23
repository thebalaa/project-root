//service to ingest data from the front end
use axum::{routing::post, Router};
use tokio::sync::mpsc;
use std::net::SocketAddr;

mod queue;

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
        .route("/ingest", post(move |payload| queue::ingest_data(payload, tx.clone())));

    // Define the address for the server
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("Ingestor service running on {}", addr);

    // Start the server
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
