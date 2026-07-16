use soroban_sdk::{contracttype, Address, BytesN};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Config,
    Order(BytesN<16>),
}

#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Status {
    Escrowed,
    Settled,
}

#[contracttype]
#[derive(Clone)]
pub struct Config {
    pub admin: Address,
    pub token: Address,
}

#[contracttype]
#[derive(Clone)]
pub struct Order {
    pub buyer: Address,
    pub farmer: Address,
    pub amount: i128,
    pub status: Status,
}
