#![no_std]

mod error;
mod events;
mod storage;
mod types;

#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, token, Address, BytesN, Env};

use crate::error::Error;
use crate::types::{Config, Order, Status};

const BPS_DENOMINATOR: i128 = 10_000;

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    // records admin and token once at deploy
    pub fn __constructor(env: Env, admin: Address, token: Address) {
        storage::set_config(&env, &Config { admin, token });
        storage::bump_instance(&env);
    }

    // buyer funds escrow; the contract custodies until a release
    pub fn create_order(
        env: Env,
        order_id: BytesN<16>,
        buyer: Address,
        farmer: Address,
        amount: i128,
    ) -> Result<(), Error> {
        buyer.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        if storage::has_order(&env, &order_id) {
            return Err(Error::OrderExists);
        }

        let config = storage::get_config(&env).ok_or(Error::NotInitialized)?;
        let token_client = token::TokenClient::new(&env, &config.token);
        token_client.transfer(&buyer, &env.current_contract_address(), &amount);

        let order = Order {
            buyer: buyer.clone(),
            farmer: farmer.clone(),
            amount,
            status: Status::Escrowed,
        };
        storage::set_order(&env, &order_id, &order);
        storage::bump_instance(&env);

        events::escrow_locked(&env, &order_id, &buyer, &farmer, amount);
        Ok(())
    }

    // happy path; releases the full escrow to the recorded farmer
    pub fn confirm_delivery(env: Env, order_id: BytesN<16>) -> Result<(), Error> {
        let config = storage::get_config(&env).ok_or(Error::NotInitialized)?;
        config.admin.require_auth();

        let mut order = storage::get_order(&env, &order_id).ok_or(Error::OrderNotFound)?;
        if order.status != Status::Escrowed {
            return Err(Error::AlreadySettled);
        }

        let token_client = token::TokenClient::new(&env, &config.token);
        token_client.transfer(
            &env.current_contract_address(),
            &order.farmer,
            &order.amount,
        );

        order.status = Status::Settled;
        storage::set_order(&env, &order_id, &order);
        storage::bump_instance(&env);

        events::settled(&env, &order_id, order.amount, 0, false);
        Ok(())
    }

    // breach path; pays the farmer amount minus discount and refunds the remainder to the buyer
    pub fn settle_with_discount(
        env: Env,
        order_id: BytesN<16>,
        discount_bps: u32,
    ) -> Result<(), Error> {
        let config = storage::get_config(&env).ok_or(Error::NotInitialized)?;
        config.admin.require_auth();

        if discount_bps as i128 > BPS_DENOMINATOR {
            return Err(Error::InvalidDiscount);
        }

        let mut order = storage::get_order(&env, &order_id).ok_or(Error::OrderNotFound)?;
        if order.status != Status::Escrowed {
            return Err(Error::AlreadySettled);
        }

        let keep_bps = BPS_DENOMINATOR - discount_bps as i128;
        let farmer_amount = order.amount * keep_bps / BPS_DENOMINATOR;
        let buyer_refund = order.amount - farmer_amount;

        let token_client = token::TokenClient::new(&env, &config.token);
        let contract = env.current_contract_address();
        if farmer_amount > 0 {
            token_client.transfer(&contract, &order.farmer, &farmer_amount);
        }
        if buyer_refund > 0 {
            token_client.transfer(&contract, &order.buyer, &buyer_refund);
        }

        order.status = Status::Settled;
        storage::set_order(&env, &order_id, &order);
        storage::bump_instance(&env);

        events::settled(&env, &order_id, farmer_amount, buyer_refund, true);
        Ok(())
    }
}
