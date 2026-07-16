#![cfg(test)]

use soroban_sdk::{testutils::Address as _, token, Address, BytesN, Env};

use crate::{EscrowContract, EscrowContractClient};

fn setup_token(env: &Env) -> Address {
    let issuer = Address::generate(env);
    env.register_stellar_asset_contract_v2(issuer).address()
}

fn order_id(env: &Env, n: u8) -> BytesN<16> {
    let mut bytes = [0u8; 16];
    bytes[15] = n;
    BytesN::from_array(env, &bytes)
}

#[test]
fn confirm_delivery_pays_farmer_in_full() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let farmer = Address::generate(&env);

    let token_addr = setup_token(&env);
    token::StellarAssetClient::new(&env, &token_addr).mint(&buyer, &1_000);
    let token_client = token::TokenClient::new(&env, &token_addr);

    let contract_id = env.register(EscrowContract, (&admin, &token_addr));
    let client = EscrowContractClient::new(&env, &contract_id);

    let oid = order_id(&env, 1);
    client.create_order(&oid, &buyer, &farmer, &1_000);
    assert_eq!(token_client.balance(&buyer), 0);
    assert_eq!(token_client.balance(&contract_id), 1_000);

    client.confirm_delivery(&oid);
    assert_eq!(token_client.balance(&farmer), 1_000);
    assert_eq!(token_client.balance(&contract_id), 0);
}

#[test]
fn settle_with_discount_splits_and_refunds() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let farmer = Address::generate(&env);

    let token_addr = setup_token(&env);
    token::StellarAssetClient::new(&env, &token_addr).mint(&buyer, &1_000);
    let token_client = token::TokenClient::new(&env, &token_addr);

    let contract_id = env.register(EscrowContract, (&admin, &token_addr));
    let client = EscrowContractClient::new(&env, &contract_id);

    let oid = order_id(&env, 2);
    client.create_order(&oid, &buyer, &farmer, &1_000);

    client.settle_with_discount(&oid, &2_000);
    assert_eq!(token_client.balance(&farmer), 800);
    assert_eq!(token_client.balance(&buyer), 200);
    assert_eq!(token_client.balance(&contract_id), 0);
}

#[test]
fn duplicate_order_is_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let farmer = Address::generate(&env);

    let token_addr = setup_token(&env);
    token::StellarAssetClient::new(&env, &token_addr).mint(&buyer, &2_000);

    let contract_id = env.register(EscrowContract, (&admin, &token_addr));
    let client = EscrowContractClient::new(&env, &contract_id);

    let oid = order_id(&env, 3);
    client.create_order(&oid, &buyer, &farmer, &1_000);
    assert!(client
        .try_create_order(&oid, &buyer, &farmer, &1_000)
        .is_err());
}

#[test]
fn double_settle_is_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let farmer = Address::generate(&env);

    let token_addr = setup_token(&env);
    token::StellarAssetClient::new(&env, &token_addr).mint(&buyer, &1_000);

    let contract_id = env.register(EscrowContract, (&admin, &token_addr));
    let client = EscrowContractClient::new(&env, &contract_id);

    let oid = order_id(&env, 4);
    client.create_order(&oid, &buyer, &farmer, &1_000);
    client.confirm_delivery(&oid);
    assert!(client.try_confirm_delivery(&oid).is_err());
    assert!(client.try_settle_with_discount(&oid, &2_000).is_err());
}
