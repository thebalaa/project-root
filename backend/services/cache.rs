//! cache.rs
//! 
//! Provides a caching interface, e.g., Redis or in-memory.

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, Duration};

/// Simple in-memory cache entry
#[derive(Clone)]
pub struct CacheEntry {
    pub value: String,
    pub expires_at: Option<SystemTime>,
}

/// In-memory cache for demonstration. For production, you'd integrate with Redis.
pub struct SimpleCache {
    store: Arc<Mutex<HashMap<String, CacheEntry>>>,
}

impl SimpleCache {
    /// Create a new, empty cache
    pub fn new() -> Self {
        Self {
            store: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Insert a key-value pair with an optional TTL in seconds.
    pub fn set(&self, key: &str, value: &str, ttl: Option<u64>) {
        let mut map = self.store.lock().unwrap();
        let entry = CacheEntry {
            value: value.to_string(),
            expires_at: ttl.map(|seconds| SystemTime::now() + Duration::new(seconds, 0)),
        };
        map.insert(key.to_string(), entry);
    }

    /// Retrieve a value if it hasn't expired.
    pub fn get(&self, key: &str) -> Option<String> {
        let mut map = self.store.lock().unwrap();
        if let Some(entry) = map.get(key) {
            if let Some(expire_time) = entry.expires_at {
                if SystemTime::now() > expire_time {
                    // key expired
                    map.remove(key);
                    return None;
                }
            }
            return Some(entry.value.clone());
        }
        None
    }

    /// Remove a key from the cache
    pub fn delete(&self, key: &str) -> bool {
        let mut map = self.store.lock().unwrap();
        map.remove(key).is_some()
    }
}
