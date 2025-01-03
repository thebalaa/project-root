use log::{debug as log_debug, error as log_error, info as log_info};
use env_logger;

pub fn init_logger() {
    env_logger::init();
}

pub fn info(msg: &str) {
    log_info!("{}", msg);
}

pub fn error(msg: &str) {
    log_error!("{}", msg);
}

pub fn debug(msg: &str) {
    log_debug!("{}", msg);
} 