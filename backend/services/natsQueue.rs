//! natsQueue.rs
//! 
//! Provides an interface to the NATS messaging system for async queues or pub-sub.

use std::error::Error;
use nats::Connection;

pub struct NatsQueue {
    pub connection: Connection,
}

impl NatsQueue {
    /// Creates a new NATS connection.
    pub fn new(nats_url: &str) -> Result<Self, Box<dyn Error>> {
        let connection = nats::connect(nats_url)?;
        Ok(Self { connection })
    }

    /// Publishes a message to a specified subject.
    pub fn publish_message(&self, subject: &str, payload: &str) -> Result<(), Box<dyn Error>> {
        self.connection.publish(subject, payload)?;
        Ok(())
    }

    /// Subscribes to a subject and processes messages with a callback.
    pub fn subscribe<F>(&self, subject: &str, callback: F) -> Result<(), Box<dyn Error>>
    where
        F: Fn(String) + Send + Sync + 'static,
    {
        let sub = self.connection.subscribe(subject)?;
        for msg in sub.messages() {
            let data = String::from_utf8_lossy(&msg.data).to_string();
            callback(data);
        }
        Ok(())
    }
}
