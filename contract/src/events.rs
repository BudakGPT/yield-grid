use soroban_sdk::{symbol_short, Address, BytesN, Env};

// published when a buyer funds an order into escrow
pub fn escrow_locked(
    env: &Env,
    order_id: &BytesN<16>,
    buyer: &Address,
    farmer: &Address,
    amount: i128,
) {
    let topics = (symbol_short!("locked"), order_id.clone());
    env.events()
        .publish(topics, (buyer.clone(), farmer.clone(), amount));
}

// published when an order settles, on both the full and discounted paths
pub fn settled(
    env: &Env,
    order_id: &BytesN<16>,
    farmer_amount: i128,
    buyer_refund: i128,
    discounted: bool,
) {
    let topics = (symbol_short!("settled"), order_id.clone());
    env.events()
        .publish(topics, (farmer_amount, buyer_refund, discounted));
}
