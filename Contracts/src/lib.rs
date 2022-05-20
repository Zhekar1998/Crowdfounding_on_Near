use near_contract_standards::non_fungible_token::metadata::TokenMetadata;
use near_sdk::{borsh};
use near_sdk::borsh::BorshDeserialize;
use near_sdk::borsh::BorshSerialize;
use near_sdk::BorshStorageKey;
use near_sdk::env;
use near_sdk::ext_contract;
use near_sdk::log;
use near_sdk::near_bindgen;
use near_sdk::AccountId;
use near_sdk::PanicOnDefault;
use near_sdk::Promise;
use near_sdk::collections::Vector;
use near_sdk::collections::LookupMap;
use serde_json::json;
use near_sdk::serde::{Deserialize, Serialize};



pub const TGAS: u64 = 1_000_000_000_000;
pub const BASE_GAS: u64 = 25 * TGAS;
pub const CREATOR_ROYALTY_ID: &str ="ylukatsky.testnet";
pub const CREATOR_ROYALTY: u128 = 1;
pub const ROYALTY_ID: &str = "us_association.testnet";
pub const ROYALTY: u128 = 4;
pub const NFTCONTRACT: &str = "nft.crowndfound.testnet";
pub const USN_CONTRACT:  &str = "usdn.testnet"
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
    project_name: String,
    create_time: u64,
    type_found: bool,
    status: u8, //1-- base, 2-- premium, 3 association
    metadata: Metadata,
    nft_data: Vec<TokenMetadata>,
    nft_price: Vec<u128>,
    donate_base: Vec<DonateBase>,
    active: bool,
    near: bool //true -- near, false -- USN
}

#[derive(
    Debug, Serialize, Deserialize, BorshDeserialize, BorshSerialize, PanicOnDefault,
)]
#[serde(crate = "near_sdk::serde")]
pub struct UserProfile{
    full_name: String,
    email: String,
    phone: String,
    adress_f1: String,
    adress_f2: String,
    country: String,
    postal_index: String,
    web_site: String,
    github: String,
    twitter: String,
    instagram: String,
    telegram: String,
    facebook: String
}    

#[derive(Debug, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Metadata {
    name: String,
    short_info: String,
    image: Vec<String>,
    video: String,
    type_pro: bool, //true for commertial false for non-profit
    project_tags: String,
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
   metadata: Metadata,
    status: u8,
    nft_data: Vec<TokenMetadata>,
    nft_price: Vec<u128>,
    active: bool

}
#[derive(
    Debug, Serialize, Deserialize, BorshDeserialize, BorshSerialize, PanicOnDefault,
)]
#[serde(crate = "near_sdk::serde")]
pub struct UserProfileView{
    full_name: String,
    country: String,
    web_site: String,
    github: String,
    twitter: String,
    instagram: String,
    telegram: String,
    facebook: String
}    
#[derive(
Debug, BorshDeserialize, BorshSerialize, PanicOnDefault,
)]
pub struct AssociationMember{
    account_id: String,
}
#[derive(
    Debug, Serialize, Deserialize, BorshDeserialize, BorshSerialize, PanicOnDefault,
)]
#[serde(crate = "near_sdk::serde")]
pub struct Isreg{
    reg: bool
}

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]

pub struct Donation {
    donations: Vec<DonationItem>,
    association: Vector<AssociationMember>,
    users: LookupMap<String, UserProfile> 
}
#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    Users,
    Assotiation,
}

#[near_bindgen]
impl Donation {
    #[init]
    pub fn new() -> Self {
        let this = Self { donations: Vec::new(), association: Vector::new(StorageKey::Assotiation), users: LookupMap::new(StorageKey::Users)};
        this
    }
    #[payable]
    pub fn add_donation(&mut self, amount: u128, receiver: String, projectname: String, nftdata: Vec<TokenMetadata>, nftprice: Vec<u128>, type_found_param: bool, near: bool, metadata_var: Metadata ) -> bool {
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

        self.donations.push( DonationItem {
            amount: amount * 10u128.pow(24),
            receiver,
            project_name: projectname,
            donated: 0,
            create_time: env::block_timestamp(),
            type_found: type_found_param,
            status: status_var,
            metadata: metadata_var,
            nft_data: nftdata,
            nft_price: nftprice,
            donate_base: Vec::new(),
            active: true,
            near: near
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
        
         self.donations.iter_mut().for_each(|el| {
            if el.receiver == receiver && el.project_name == projectname {
                if el.near == true {
                el.donated += env::attached_deposit();
                log!(el.donated.to_string());
                let mut i:i8 = -1;
                el.nft_price.iter_mut().for_each(|price|{
                    if env::attached_deposit()> price.clone() {
                        i = i+1;
                    }
                });
                if i>(-1){
                    let b: usize = i as usize;
                    log!(b.to_string());
                    Promise::new(AccountId::new_unchecked(String::from(NFTCONTRACT).clone())).function_call(
                        "nft_mint".to_string(),
                        json!({"token_id" : el.project_name.clone()+&el.donate_base.len().to_string(), "receiver_id": env::signer_account_id(), "token_metadata": el.nft_data[b]}).to_string().into_bytes(),
                         10_000_000_000_000_000_000_000,
                        near_sdk::Gas(5_000_000_000_000));
                }

            }else{
                Promise::new(AccountId::new_unchecked(String::from(USN_CONTRACT).clone())).function_call(
                    "buy".to_string(),
                    json!({"to": "crowfund.crowndfounding.testnet"}),
                    env::attached_deposit(),
                    near_sdk::Gas(5_000_000_000_000));
                );//TODO add callback and ammount
            }

                el.donate_base.push(DonateBase{
                    donator_id:     env::signer_account_id(),
                    donate_near:    env::attached_deposit(),
                });
            }

            if  !el.type_found {
                if el.donated >= el.amount {
                    Promise::new(AccountId::new_unchecked(String::from(CREATOR_ROYALTY_ID).clone())).transfer(el.donated*(CREATOR_ROYALTY));
                    Promise::new(AccountId::new_unchecked(el.receiver.clone())).transfer(el.donated*(100-ROYALTY-CREATOR_ROYALTY)/100);
                    el.active = false;
                }else {
                    if env::block_timestamp()-el.create_time >= 2592000000000000{
                        el.donate_base.iter().for_each(|don|{
                            Promise::new(don.donator_id.clone()).transfer(don.donate_near);
                        });
                        el.active = false;
                    }
                }
            }else{
               if env::block_timestamp()-el.create_time >= 2592000000000000{
                   if el.donated >= el.amount {
                       Promise::new(AccountId::new_unchecked(String::from(ROYALTY_ID).clone())).transfer(el.donated*(ROYALTY)/100);
                       Promise::new(AccountId::new_unchecked(String::from(CREATOR_ROYALTY_ID).clone())).transfer(el.donated*(CREATOR_ROYALTY)/100);
                       Promise::new(AccountId::new_unchecked(el.receiver.clone())).transfer(el.donated*(100-ROYALTY-CREATOR_ROYALTY)/100);
                       el.active = false;
                   }else{
                       el.donate_base.iter().for_each(|don|{
                           Promise::new(don.donator_id.clone()).transfer(don.donate_near);
                       });
                       el.active = false;
                   }
               }
            }
        });

        true
    }

    //TODO FT payment

    pub fn register(&mut self, user: UserProfile){
        self.users.insert(&env::signer_account_id().to_string(), &user);
    }

    pub fn get_donations(self) -> Vec<DonationItemView> {
        self.donations
            .iter()
            .map(|el| DonationItemView {
                amount: el.amount,
                donated: el.donated,                    //10^24YoctoNear = 1Near
                receiver: el.receiver.clone(),
                project_name: el.project_name.clone(),
                time_past: 2592000000000000-(env::block_timestamp()-el.create_time),//nano seconds (10^9 nanosec=1sec)
                metadata: el.metadata.clone(),
                status: el.status,
                nft_data: el.nft_data.clone(),
                nft_price: el.nft_price.clone(),
                active: el.active})
            .collect()
    }

    pub fn get_profile_full(self, user:String) -> UserProfile{
        match self.users.get(&user){ 
            Some(value) => {
            value
            },
            None => UserProfile{
                full_name: "".to_string(),
                email: "".to_string(),
                phone: "".to_string(),
                adress_f1: "".to_string(),
                adress_f2: "".to_string(),
                country: "".to_string(),
                postal_index: "".to_string(),
                web_site: "".to_string(),
                github: "".to_string(),
                twitter: "".to_string(),
                instagram: "".to_string(),
                telegram: "".to_string(),
                facebook: "".to_string()
            }
        }
    }

    pub fn get_profile_part(self, user:String) -> UserProfileView{
        match self.users.get(&user){ 
            Some(value) => UserProfileView{
                full_name: value.full_name,
                country: value.country,
                web_site: value.web_site,
                github: value.github,
                twitter: value.twitter,
                instagram: value.instagram,
                telegram: value.telegram,
                facebook: value.facebook
            },
            None => UserProfileView{
                full_name: "".to_string(),
                country: "".to_string(),
                web_site: "".to_string(),
                github: "".to_string(),
                twitter: "".to_string(),
                instagram: "".to_string(),
                telegram: "".to_string(),
                facebook: "".to_string()
            }
        }
    }

    pub fn is_register(self, user:String) -> Isreg{
        match self.users.contains_key(&user){
            value => Isreg{
                reg: value
            }
        }
    }

}
