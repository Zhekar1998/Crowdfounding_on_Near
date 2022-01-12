use near_sdk::borsh;
use near_sdk::borsh::BorshDeserialize;
use near_sdk::borsh::BorshSerialize;
use near_sdk::env;
use near_sdk::ext_contract;
use near_sdk::log;
use near_sdk::near_bindgen;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::json_types::Base64VecU8;
use near_sdk::AccountId;
use near_sdk::PanicOnDefault;
use near_sdk::Promise;
use near_sdk::collections::LazyOption;
use near_sdk::collections::Vector;


pub const TGAS: u64 = 1_000_000_000_000;
pub const BASE_GAS: u64 = 25 * TGAS;
pub const CREATOR_ROYALTY_ID: &str ="zhekar1998.testnet";
pub const CREATOR_ROYALTY: u128 = 1;
pub const ROYALTY_ID: &str = "us_association.testnet";
pub const ROYALTY: u128 = 4;
#[ext_contract(ext_staking_pool)]
pub trait ExtUser {
    fn send(&mut self, amount: u128);
}

#[near_bindgen]
#[derive(
  BorshDeserialize, BorshSerialize, PanicOnDefault,
)]
pub struct DonationItem {
    amount: u128,
    donated: u128,
    receiver: String,
    create_time: u64,
    type_found: bool,
    status: u8, //1-- base, 2-- premium, 3 association
    data_path: String,
    donate_base: Vec<DonateBase>
}

#[derive(Debug, Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct DonateBase {
    donator_id: AccountId,
    donate_near:    u128,
  //  nft_id: String
}

#[derive(
    Debug, Serialize, Deserialize, BorshDeserialize, BorshSerialize, PanicOnDefault,
)]
#[serde(crate = "near_sdk::serde")]
pub struct DonationItemView {
    amount: u128,
    donated: u128,
    receiver: String,
    time_past: u64,
   data_path: String,
    status: u8,

}
#[derive(
Debug, Serialize, Deserialize, BorshDeserialize, BorshSerialize, PanicOnDefault,
)]
#[serde(crate = "near_sdk::serde")]
pub struct AssociationMember{
    account_id: String,
}

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]

pub struct Donation {
    donations: Vec<DonationItem>,
    association: Vec<AssociationMember>
}

#[near_bindgen]
impl Donation {
    #[init]
    pub fn new() -> Self {
        let mut this = Self { donations: vec![], association: vec![] };
        this
    }
    #[payable]
    pub fn add_donation(&mut self, amount: u128, receiver: String, type_found_param: bool, data_path_var: String ) -> bool {
        let status_var: u8;
        if env::attached_deposit()>=10u128.pow(24) {
            status_var = 2;
        }else {
           let mut assoc: bool = false;
             self.association.iter_mut().for_each(|el|{
                    if receiver == el.account_id{
                       assoc = true;
                    }
            });
                if assoc {status_var = 3; }else {status_var = 1;}
        }

        self.donations.push(DonationItem {
            amount: amount * 10u128.pow(24),
            receiver,
            donated: 0,
            create_time: env::block_timestamp(),
            type_found: type_found_param,
            status: status_var,
            data_path: data_path_var,
            donate_base: Vec::new()
        });
        true
    }




    #[payable]
    pub fn donate(&mut self, receiver: String) -> bool {
        log!(
            "User sent {} nears for {}",
            env::attached_deposit(),
            receiver
        );
        // self.dontaions.push(DonationItem { amount, receiver, donated: 0 });
        self.donations.iter_mut().for_each(|el| {
            if el.receiver == receiver {
                el.donated += env::attached_deposit();
                el.donate_base.push(DonateBase{
                    donator_id: env::signer_account_id(),
                    donate_near:    env::attached_deposit(),
                   // nft_id:               //TODO add NFT_ID.
                })
            }

            if  !el.type_found {
                if el.donated >= el.amount {
                    Promise::new(AccountId::new_unchecked(String::from(ROYALTY_ID).clone())).transfer(el.donated*(ROYALTY));
                    Promise::new(AccountId::new_unchecked(String::from(CREATOR_ROYALTY_ID).clone())).transfer(el.donated*(CREATOR_ROYALTY));
                    Promise::new(AccountId::new_unchecked(el.receiver.clone())).transfer(el.donated*(100-ROYALTY-CREATOR_ROYALTY)/100);
                }else {
                    if env::block_timestamp()-el.create_time >= 2592000000000000{
                        el.donate_base.iter_mut().for_each(|don|{
                            Promise::new(don.donator_id.clone()).transfer(don.donate_near);
                        })
                    }
                }
            }else{
               if env::block_timestamp()-el.create_time >= 2592000000000000{
                   if el.donated >= el.amount {
                       Promise::new(AccountId::new_unchecked(String::from(ROYALTY_ID).clone())).transfer(el.donated*(ROYALTY)/100);
                       Promise::new(AccountId::new_unchecked(String::from(CREATOR_ROYALTY_ID).clone())).transfer(el.donated*(CREATOR_ROYALTY)/100);
                       Promise::new(AccountId::new_unchecked(el.receiver.clone())).transfer(el.donated*(100-ROYALTY-CREATOR_ROYALTY)/100);
                   }else{
                       el.donate_base.iter_mut().for_each(|don|{
                           Promise::new(don.donator_id.clone()).transfer(don.donate_near);
                       })
                   }
               }
            }
        });

        true
    }

    pub fn get_donations(&self) -> Vec<DonationItemView> {
        self.donations
            .iter()
            .map(|el| DonationItemView {
                amount: el.amount.to_string(),
                donated: el.donated.to_string(),
                receiver: el.receiver.clone(),
                time_past: 2592000000000000-env::block_timestamp()-el.create_time,
                status: String,
                data_path: String
            })
            .collect()
    }
}
