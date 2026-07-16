use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    OrderExists = 2,
    OrderNotFound = 3,
    AlreadySettled = 4,
    InvalidAmount = 5,
    InvalidDiscount = 6,
    Unauthorized = 7,
}
