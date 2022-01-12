import "regenerator-runtime/runtime"
import * as nearAPI from "near-api-js"
import "./main_page.js"
import { Web3Storage } from 'web3.storage'
import inspect from 'browser-util-inspect';

import getConfig from "./config"
import {utils} from "near-api-js";




window.nearConfig = getConfig(process.env.NODE_ENV || "development");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEM3MDQ0ZjcyRkExYTQzMmZiRjE1ZUE2MkIyNTc2MzlCRjQ0NUY5QUQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDE1NjM3Nzg1MzUsIm5hbWUiOiIxIn0.l33kUNtDs5irZj40uCh2WHoUgCl31T9WSbSSkbxV1_I";


function makeStorageClient() {  return new Web3Storage({ token })}

async function storeFiles(files) {
    const client = makeStorageClient();
    const cid = await client.put(files);
    console.log('stored files with cid:', cid);
    return cid;
}

async function initContract() {
    // Initializing connection to the NEAR node.

    window.near = await nearAPI.connect(Object.assign({ deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() } }, nearConfig));

    // Initializing Wallet based Account. It can work with NEAR TestNet wallet that
    // is hosted at https://wallet.testnet.near.org
    window.walletAccount = new nearAPI.WalletAccount(window.near);

    // Getting the Account ID. If unauthorized yet, it's just empty string.
    window.accountId = window.walletAccount.getAccountId();


    // Initializing our contract APIs by contract name and configuration.
    window.contract = new nearAPI.Contract(window.walletAccount.account(), "crowndfound.testnet", {
        // NOTE: This configuration only needed while NEAR is still in development
        // View methods are read only. They don't modify the state, but usually return some value.
        // Sender is the account ID to initialize transactions.

        viewMethods: ["get_donations"],
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: ["add_donation", "donate"],
        sender: window.accountId,
    });
    await update_project_list();
}

async function doWork() {
    // Based on whether you've authorized, checking which flow we should go.


    if (!window.walletAccount.isSignedIn()) {
        signedOutFlow();
    } else {
        signedInFlow();
    }

}

var projects_array_lenght = 0
async function update_project_list(){
    let projects_array = [];
    projects_array = await get_projects();
    if (projects_array_lenght !== projects_array.length){
        projects_array_lenght = projects_array.length;

    }

}

let timerID = setInterval(()=> update_project_list(), 30000);


function signedInFlow(){

    document.getElementById('sign-out').style.display = ' ';
    document.getElementById('account_id').style.display = '';
    document.getElementById('sign-in').style.display = 'none';

    // Displaying current account name.
    document.getElementById('account_id').innerText = window.accountId;
    document.getElementById('sign-out').addEventListener('click', e => {
        e.preventDefault();
        walletAccount.signOut();
        // Forcing redirect.
        window.location.replace(window.location.origin + window.location.pathname);
    });
}


function signedOutFlow(){
    document.getElementById('sign-out').style.display = 'none';
    document.getElementById('account_id').style.display = 'none';
    document.getElementById('sign-in').style.display = ' ';
    // Adding an event to a sing-in button.
    document.getElementById('sign-in').addEventListener('click', () => {
        window.walletAccount.requestSignIn(
            // The contract name that would be authorized to be called by the user's account.
            window.nearConfig.contractName
        );
});
}

async function get_projects() {
    const response = await window.contract.get_donations();
    console.log(response);
    return response;
}



var premium_payment = utils.format.parseNearAmount("20");
async function add_donation(amount, type_found, name, file_cid){
    console.log(inspect({
        "amount": amount,
        "receiver": window.accountId,
        "type_found_param": type_found,
        "data_path_var": file_cid

    }));
    if (document.getElementById("premium_check").checked) {
        const account = await window.walletAccount.account();
        const balance = await account.getAccountBalance();

        if( balance > premium_payment) {
            await window.contract.add_donation(
                {
                    "amount": amount,
                    "receiver": window.accountId,
                    "type_found_param": type_found,
                    "data_path_var": file_cid

                },
                300000000000000,
                premium_payment
            )
        }else{
            //TODO errorState
        }
    }else{
        await window.contract.add_donation(
            {
                "amount": amount,
                "receiver": window.accountId,
                "type_found_param": type_found,
                "data_path_var": file_cid
            }

        )
    }

}

var  type_found, name, short_info, image_array, video, type_pro, tags, nft_number;
var amount;
var nft_image_array = [];

document.getElementById("create_btn").onclick = async () =>{
    name =document.getElementById("pro_name").value
    if (document.getElementById("inlineRadio1_1").checked){
        type_pro = true;
    }else if(document.getElementById("inlineRadio1_2").checked){
        type_pro = false;
    }
    if (document.getElementById("inlineRadio2_1").checked){
        type_found = true;
    }else if(document.getElementById("inlineRadio2_2").checked){
        type_found = false;
    }
    short_info = document.getElementById("floatingShortInfo").value;

    video = document.getElementById("formVideoURL").value;
    var image=document.getElementsByName("image");
    image_array = await load_to_nft_storage(image);
    tags = document.getElementById("Project_tags").value;
    nft_number = document.getElementsByClassName("div_create_nft").length;
    var nftName = [];
    var nftPrice = [];
    var NFT_Short_info = [];

    var id_number = [];
    nft_number = Number(nft_number);
    amount = document.getElementById("Near_amount").value; //in NEAR

    amount = Number(amount);
    if(nft_number>0) {

        let el = document.getElementsByName("nftName_create");
        let el1 = document.getElementsByName("img_nft_create");
        let el2 = document.getElementsByName("short_info_nft_create");
        let el3 = document.getElementsByName("nft_price_create");
        for (let i = 0; i < el.length; i++) {
            nftName.push(el[i].value);
            NFT_Short_info.push(el2[i].value);
            nftPrice.push(Number(el3[i].value));
            id_number.push(Number(0));
        }

        nft_image_array = await load_to_nft_storage(el1);
    }

    var pro_data_create = {
        "metadata": {
            "name": name,
            "short_info": short_info,
            "image": image_array,
            "video": video,
            "type_pro": type_pro,
            "project_tags": tags,


        },
        "nft_data": {
            "nft_number": nft_number,
            "name": nftName,
            "img": nft_image_array,
            "price": nftPrice, //in $NEAR
            "short_info": NFT_Short_info,
            "id_number": id_number
        }
    }

    const blob = new Blob([JSON.stringify(pro_data_create)], {type: 'application/json'});
    const files = [new File([blob], name+'.json')];
    let file_cid = await storeFiles(files);

    await add_donation(amount, type_found, name, file_cid);
}



async function load_to_nft_storage(image){
    var img_array = [];

    for (let i=0; i< image.length; i++){
        var img = image[i].files;
        var cid = await storeFiles(img);

        img_array.push(cid);
    }
    return img_array;
}



window.nearInitPromise = initContract()
    .then(doWork)
    .catch(console.error);

