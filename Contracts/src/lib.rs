use near_contract_standards::non_fungible_token::metadata::TokenMetadata;
use near_sdk::{borsh};
use near_sdk::borsh::BorshDeserialize;
use near_sdk::borsh::BorshSerialize;
use near_sdk::env;
use near_sdk::ext_contract;
use near_sdk::log;
use near_sdk::near_bindgen;
use near_sdk::AccountId;
use near_sdk::PanicOnDefault;
use near_sdk::Promise;
use near_sdk::collections::Vector;
use serde_json::json;
use near_sdk::serde::{Serialize, Deserialize};



pub const TGAS: u64 = 1_000_000_000_000;
pub const BASE_GAS: u64 = 25 * TGAS;
pub const CREATOR_ROYALTY_ID: &str ="zhekar1998.testnet";
pub const CREATOR_ROYALTY: u128 = 1;
pub const ROYALTY_ID: &str = "us_association.testnet";
pub const ROYALTY: u128 = 4;
pub const NFTCONTRACT: &str = "nft.crowndfounding.testnet";
#[ext_contract(ext_staking_pool)]
pub trait ExtUser {
    fn send(&mut self, amount: u128);
}

#[near_bindgen]
#[derive(
Debug, BorshDeserialize, BorshSerialize, PanicOnDefault,
)]

pub struct DonationItem {
    amount: u128,
    donated: u128,
    receiver: String,
    project_name: String,
    create_time: u64,
    type_found: bool,
    status: u8, //1-- base, 2-- premium, 3 association
    data_path: String,
    nft_data: Vec<TokenMetadata>,
    nft_price: Vec<u128>,
    donate_base: Vec<DonateBase>
}

#[derive(Debug, BorshDeserialize, BorshSerialize)]

pub struct DonateBase {
    donator_id: AccountId,
    donate_near:    u128,
}

#[derive(
    Debug, Serialize, Deserialize, BorshDeserialize, BorshSerialize, PanicOnDefault,
)]
#[serde(crate = "near_sdk::serde")]
pub struct DonationItemView {
    amount: u128,
    donated: u128,
    receiver: String,
    project_name: String,
    time_past: u64,
   data_path: String,
    status: u8,
    nft_data: Vec<TokenMetadata>,
    nft_price: Vec<u128>

}
#[derive(
Debug, BorshDeserialize, BorshSerialize, PanicOnDefault,
)]
pub struct AssociationMember{
    account_id: String,
}

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]

pub struct Donation {
    donations: Vector<DonationItem>,
    association: Vector<AssociationMember>
}

#[near_bindgen]
impl Donation {
    #[init]
    pub fn new() -> Self {
        let this = Self { donations: Vector::new(b"d"), association: Vector::new(b"a") };
        this
    }
    #[payable]
    pub fn add_donation(&mut self, amount: u128, receiver: String, projectname: String, nftdata: Vec<TokenMetadata>, nftprice: Vec<u128>, type_found_param: bool, data_path_var: String ) -> bool {
        let status_var: u8;
        if env::attached_deposit()>=10u128.pow(24) {
            status_var = 2;
        }else {
           let mut assoc: bool = false;
             self.association.iter().for_each(|el|{
                    if receiver == el.account_id{
                       assoc = true;
                    }
            });
                if assoc {status_var = 3;}else {status_var = 1;}
        }

        self.donations.push( &DonationItem {
            amount: amount * 10u128.pow(24),
            receiver,
            project_name: projectname,
            donated: 0,
            create_time: env::block_timestamp(),
            type_found: type_found_param,
            status: status_var,
            data_path: data_path_var,
            nft_data: nftdata,
            nft_price: nftprice,
            donate_base: Vec::new()
        });
        true
    }




    #[payable]
    pub fn donate(&mut self, receiver: String, projectname: String) -> bool {
        log!(
            "User sent {} nears for {}",
            env::attached_deposit(),
            receiver
        );
        // self.dontaions.push(DonationItem { amount, receiver, donated: 0 });
         self.donations.iter().for_each(|mut el| {
            if el.receiver == receiver && el.project_name == projectname {
                el.donated += env::attached_deposit();
                let mut i:i8 = -1;
                el.nft_price.iter_mut().for_each(|price|{
                    if env::attached_deposit()> price.clone() {
                        i = i+1;
                    }
                });
                if i>(-1){
                    let b: usize = i as usize;
                    Promise::new(AccountId::new_unchecked(String::from(NFTCONTRACT).clone())).function_call(
                        "nft_mint".to_string(),
                        json!({"token_id" : el.project_name+&el.donate_base.len().to_string(), "receiver_id": env::signer_account_id(), "metadata": el.nft_data[b]}).to_string().into_bytes(),
                         10_000_000_000_000_000_000_000,
                        near_sdk::Gas(5_000_000_000_000));
                }



                el.donate_base.push(DonateBase{
                    donator_id:     env::signer_account_id(),
                    donate_near:    env::attached_deposit(),
                })
            }

            if  !el.type_found {
                if el.donated >= el.amount {
                    Promise::new(AccountId::new_unchecked(String::from(ROYALTY_ID).clone())).transfer(el.donated*(ROYALTY));
                    Promise::new(AccountId::new_unchecked(String::from(CREATOR_ROYALTY_ID).clone())).transfer(el.donated*(CREATOR_ROYALTY));
                    Promise::new(AccountId::new_unchecked(el.receiver.clone())).transfer(el.donated*(100-ROYALTY-CREATOR_ROYALTY)/100);
                }else {
                    if env::block_timestamp()-el.create_time >= 2592000000000000{
                        el.donate_base.iter().for_each(|don|{
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
                       el.donate_base.iter().for_each(|don|{
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
                amount: el.amount,
                donated: el.donated,
                receiver: el.receiver.clone(),
                project_name: el.project_name,
                time_past: 2592000000000000-env::block_timestamp()-el.create_time,
                status: el.status,
                data_path: el.data_path,
                nft_data: el.nft_data,
                nft_price: el.nft_price,

            })
            .collect()
    }
}
