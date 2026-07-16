use soroban_sdk::{BytesN, Env};

use crate::types::{Config, DataKey, Order};

// ttl bumps keep demo-day entries from being archived mid-event
const DAY_LEDGERS: u32 = 17280;
const BUMP_AMOUNT: u32 = DAY_LEDGERS * 30;
const BUMP_THRESHOLD: u32 = DAY_LEDGERS * 25;

// config

pub fn set_config(env: &Env, config: &Config) {
    env.storage().instance().set(&DataKey::Config, config);
}

pub fn get_config(env: &Env) -> Option<Config> {
    env.storage().instance().get(&DataKey::Config)
}

pub fn bump_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(BUMP_THRESHOLD, BUMP_AMOUNT);
}

// orders

pub fn has_order(env: &Env, order_id: &BytesN<16>) -> bool {
    env.storage()
        .persistent()
        .has(&DataKey::Order(order_id.clone()))
}

pub fn get_order(env: &Env, order_id: &BytesN<16>) -> Option<Order> {
    env.storage()
        .persistent()
        .get(&DataKey::Order(order_id.clone()))
}

pub fn set_order(env: &Env, order_id: &BytesN<16>, order: &Order) {
    let key = DataKey::Order(order_id.clone());
    env.storage().persistent().set(&key, order);
    env.storage()
        .persistent()
        .extend_ttl(&key, BUMP_THRESHOLD, BUMP_AMOUNT);
}
