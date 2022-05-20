import "regenerator-runtime/runtime"
import * as nearAPI from "near-api-js"
import "./main_page.js"
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'
import inspect from 'browser-util-inspect';
import { utils } from "near-api-js";
import { create } from 'ipfs-http-client';
import { findSeatPrice } from "near-api-js/lib/validators";
import 'fs';
import { async } from "regenerator-runtime/runtime";




window.nearConfig = {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    contractName: 'crowndfound.testnet',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org'
};

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEM3MDQ0ZjcyRkExYTQzMmZiRjE1ZUE2MkIyNTc2MzlCRjQ0NUY5QUQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDE1NjM3Nzg1MzUsIm5hbWUiOiIxIn0.l33kUNtDs5irZj40uCh2WHoUgCl31T9WSbSSkbxV1_I";


function makeStorageClient() { return new Web3Storage({ token }) }

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
    window.contract = new nearAPI.Contract(window.walletAccount.account(), "crowfound.crowndfound.testnet", {
        // NOTE: This configuration only needed while NEAR is still in development
        // View methods are read only. They don't modify the state, but usually return some value.
        // Sender is the account ID to initialize transactions.

        viewMethods: ["get_donations", "is_register", "get_profile_part"],
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: ["add_donation", "donate", "register"],
        sender: window.accountId,
    });

}

async function doWork() {
    // Based on whether you've authorized, checking which flow we should go.


    if (!window.walletAccount.isSignedIn()) {
        signedOutFlow();
    } else {
        signedInFlow();
    }
    await update_project_list();
}


var projects_array = [];
var projects_array_lenght = 0;
async function update_project_list() {
    projects_array = [];
    projects_array = await get_projects();
    if (projects_array.length > 0) {
        if (projects_array_lenght != projects_array.length) {
            projects_array_lenght = projects_array.length;
            document.getElementById("commertial_projects").innerHTML = '';
            document.getElementById("nonprofit_projects").innerHTML = '';
            for (let i = 0; i < projects_array.length; i++) {
                let img_link = [];
                for (let y = 0; y < projects_array[i].metadata.image.length; y++) {

                    let client = makeStorageClient();
                    console.log(projects_array[i].metadata.image[y])
                    const res = await client.get(projects_array[i].metadata.image[y])
                    console.log(`Got a response! [${res.status}] ${res.statusText}`)
                    if (!res.ok) {
                        throw new Error(`failed to get` + projects_array[i].metadata.image[y])
                    }
                    const files = await res.files()
                    console.log(files);
                    let name = files[0].name;
                    img_link.push('https://' + projects_array[i].metadata.image[y] + '.ipfs.dweb.link/' + name);
                }
                console.log('type_pro:');
                console.log(projects_array[i].status);
                project_list(i, projects_array[i].project_name, img_link, projects_array[i].metadata.short_info, projects_array[i].amount, projects_array[i].donated, projects_array[i].time_past, projects_array[i].status, projects_array[i].active, projects_array[i].receiver, projects_array[i].metadata.type_pro);

            }
        }
    }
}

function project_list(number, name, img, shortinfo, ammount, money, time, status, active, receiver, type_pro) {
    console.log(active);
    let carusel = '';
    let card_body = '';
    let project_cart = '';
    console.log('image:');
    console.log(img.length);
    ammount = ammount / Math.pow(10, 24);
    money = money / Math.pow(10, 24);
    console.log(time);
    time = time / 1000000000;
    let days = Math.floor(time / 86400);
    let hours = Math.floor((time - days * 86400) / 3600);
    console.log(status);
    if (days == 0) {
        let minute = Math.floor((time - hours * 3600) / 60);
    }
    if (img.length > 1) {
        carusel += '<div id="carousel' + number + '" class="carousel slide" data-bs-ride="carousel"><div class="carousel-indicators"> <button type="button" data-bs-target="#carousel" data-bs-slide-to=0 class="active" aria-current="true" aria-label="Slide 1"></button>';
        for (let i = 1; i < img.length; i++) {
            let b = i + 1;
            carusel += '<button type="button" data-bs-target="#carousel' + number + '" data-bs-slide-to="' + i + '" aria-label="Slide ' + b + '"></button>';
        }
        carusel += '</div><div class="carousel-inner"><div class = "carousel-item active"><img src="' + img[0] + '" class = "d-block rounded-top w-100 carusel_img" alt = "loadError"/></div>';
        for (let i = 1; i < img.length; i++) {
            carusel += '<div class = "carousel-item"><img src="' + img[i] + '" class = "carusel_img rounded-top d-block w-100" alt = "loadError" /></div>';
        }
        carusel += '</div><button class = "carousel-control-prev" type = "button" data-bs-target = "#carousel' + number + '" data-bs-slide = "prev" > <span class = "carousel-control-prev-icon" aria-hidden = "true" > <span class = "visually-hidden" > Previous < /span> </span></button > <button class = "carousel-control-next" type = "button" data-bs-target = "#carousel' + number + '" data-bs-slide = "next"> <span class = "carousel-control-next-icon" aria-hidden = "true"><span class = "visually-hidden" > Next </span> </span></button></div> <div class="img_top_text">' + name + '</div>';
    } else carusel += '<div><img src="' + img[0] + '" class = "d-block carusel_img rounded-top w-100" alt = "loadError" /><div class="img_top_text">' + name + '</div>';
    if (status == 2) {
        project_cart = '<div class="col"><div class="card shadow-sm"> <span class="position-absolute top-0 start-50 translate-middle p-2 bg-premium"><span class="visually-hidden">New alerts</span></span>' + carusel;
    } else if (status == 1) {
        project_cart = '<div class="col"><div class="card shadow-sm"> ' + carusel;
    } else if (status == 3) {
        project_cart = '<div class="col"><div class="card shadow-sm"> <span class="position-absolute top-0 start-50 translate-middle p-2 bg-asocc"><span class="visually-hidden">New alerts</span></span>' + carusel;
    }
    card_body += '<div class = "card-body" > <p class = "card-text" >' + shortinfo + '</p> <div class = "progress"><div class="progress-bar bg-success" style="width:' + money / ammount * 100 + '%" role = "progressbar"  aria-valuemin = "0"  aria-valuemax = "' + ammount + '" aria-valuenow = "' + money + '">' + money + '</div></div><div class="pt-1 pb-3"><p class="alignleft">0</p><p class="alignright">' + ammount + '</p></div>'
    if (active == true) {
        if (days == 0) {
            card_body += '<div class = "d-flex pt-3 justify-content-between align-items-center"> <div class = "btn-group"><button type = "button" class = "btn btn-sm btn-outline-secondary" onclick="view_pro(\'' + name + '\')"> View </button> <button type = "button" class = "btn btn-sm btn-outline-secondary" onclick="donate(\'' + name + '\',\'' + receiver + '\')" > Donate </button> </div ><small class = "text-muted" > ' + receiver + ' </small> <small class = "text-muted" >' + hours + 'hours' + minute + 'minutes </small> </div > </div> </div>';
        } else {
            card_body += '<div class = "d-flex pt-3 justify-content-between align-items-center"> <div class = "btn-group"><button type = "button" class = "btn btn-sm btn-outline-secondary" onclick="view_pro(\'' + name + '\')"> View </button> <button type = "button" class = "btn btn-sm btn-outline-secondary" onclick="donate(\'' + name + '\',\'' + receiver + '\')" > Donate </button> </div > <small class = "text-muted" > ' + receiver + ' </small> <small class = "text-muted" >' + days + ' days ' + hours + ' hours </small> </div > </div> </div>'
        }
    } else {
        card_body += '<div class = "d-flex pt-3 justify-content-between align-items-center"> <div class = "btn-group"><button type = "button" class = "btn btn-sm btn-outline-secondary" onclick="view_pro(\'' + name + '\')"> View </button> </div > <small class = "text-muted" > ' + receiver + ' </small><small class = "text-muted" > "Found end" </small> </div > </div> </div>';
    }
    project_cart += card_body + '</div>';
    if (type_pro == true) {
        document.getElementById("commertial_projects").innerHTML += project_cart;
    } else {
        document.getElementById("nonprofit_projects").innerHTML += project_cart;
    }
}


let timerID = setInterval(() => update_project_list(), 60000);


var old_maxprice = 0;
document.getElementById("near_donate_summ").onchange = async function() {
    let index;
    for (let i = 0; i < projects_array.length; i++) {
        if (projects_array[i].project_name == document.getElementById("donate_pro_name").innerText) {
            index = i;
        }
    }

    let max_price = 0;
    let nft_index;
    for (let i = 0; i < projects_array[index].nft_price.length; i++) {
        if (document.getElementById("near_donate_summ").value > projects_array[index].nft_price[i]) {
            if (projects_array[index].nft_price[i] > max_price) {
                max_price = projects_array[index].nft_price[i];
                nft_index = i;
            }
        }
    }
    if (max_price != old_maxprice) {
        document.getElementById("bonus-name-db").innerText = projects_array[index].nft_data[nft_index].title;
        let client = makeStorageClient();
        console.log(projects_array[index].nft_data[nft_index].media);
        const res = await client.get(projects_array[index].nft_data[nft_index].media);
        console.log(`Got a response! [${res.status}] ${res.statusText}`);
        if (!res.ok) {
            throw new Error(`failed to get` + projects_array[index].nft_data[nft_index].media);
        }
        const files = await res.files()
        console.log(files);
        let name = files[0].name;
        let img_src = 'https://' + projects_array[index].nft_data[nft_index].media + '.ipfs.dweb.link/' + name;
        document.getElementById("bonus-img").src = img_src;
        old_maxprice = max_price;
    }
}

document.getElementById("donate-btn").onclick = async function() {
    let donation_summ = document.getElementById("near_donate_summ").value;
    let proj_name = document.getElementById("donate_pro_name").innerText;
    let receiver = document.getElementById("receiver_donate").innerText;
    donation_summ = utils.format.parseNearAmount(donation_summ);
    await window.contract.donate({
            "receiver": receiver,
            "projectname": proj_name
        },
        300000000000000,
        donation_summ
    );
    document.getElementById("donateBox").style.display = "none";
}


async function signedInFlow() {

    document.getElementById('sign-out').style.display = ' ';
    document.getElementById('account_id').style.display = '';
    document.getElementById('sign-in').style.display = 'none';
    document.getElementById('account_id').innerText = window.accountId;
    let reg = await window.contract.is_register({ "user": window.accountId });
    if (!reg) {
        await window.contract.register({
            "full_name": "",
            "email": "",
            "phone": "",
            "adress_f1": "",
            "adress_f2": "",
            "country": "",
            "postal_index": "",
            "web_site": "",
            "github": "",
            "twitter": "",
            "instagram": "",
            "telegram": "",
            "facebook": ""
        });
    }
    // Displaying current account name.
    document.getElementById('sign-out').addEventListener('click', e => {
        e.preventDefault();
        walletAccount.signOut();
        // Forcing redirect.
        window.location.replace(window.location.origin + window.location.pathname);
    });
}


function signedOutFlow() {
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
async function add_donation(amount, type_found, name, metadata, nft_data, nft_price, neart) {
    console.log(inspect({
        "amount": amount,
        "receiver": window.accountId,
        "projectname": name,
        "nftdata": nft_data,
        "nftprice": nft_price,
        "type_found_param": type_found,
        "metadata": metadata


    }));
    if (document.getElementById("premium_check").checked) {
        const account = await window.walletAccount.account();
        const balance = await account.getAccountBalance();

        if (balance > premium_payment) {
            await window.contract.add_donation({
                    "amount": amount,
                    "receiver": window.accountId,
                    "projectname": name,
                    "nftdata": nft_data,
                    "nftprice": nft_price,
                    "type_found_param": type_found,
                    "near": neart,
                    "metadata_var": metadata


                },
                300000000000000,
                premium_payment
            )
        } else {
            //TODO errorState
        }
    } else {
        await window.contract.add_donation({
                "amount": amount,
                "receiver": window.accountId,
                "projectname": name,
                "nftdata": nft_data,
                "nftprice": nft_price,
                "type_found_param": type_found,
                "near": neart,
                "metadata_var": metadata
            }

        )
    }

}

var type_found, name, short_info, image_array, video, type_pro, tags, nft_number, neart;
var amount;
var nft_image_array = [];

document.getElementById("create_btn").onclick = async() => {
    name = document.getElementById("pro_name").value
    if (document.getElementById("inlineRadio1_1").checked) {
        type_pro = true;
    } else if (document.getElementById("inlineRadio1_2").checked) {
        type_pro = false;
    }
    if (document.getElementById("inlineRadio2_1").checked) {
        type_found = true;
    } else if (document.getElementById("inlineRadio2_2").checked) {
        type_found = false;
    }
    if (document.getElementById("inlineRadio3_1").checked) {
        neart = true;
    } else if (document.getElementById("inlineRadio3_2").checked) {
        neart = false;
    }
    short_info = document.getElementById("floatingShortInfo").value;

    video = document.getElementById("formVideoURL").value;
    var image = document.getElementsByName("image");
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
    if (nft_number > 0) {

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

    let pro_data_create = {
        "name": name,
        "short_info": short_info,
        "image": image_array,
        "video": video,
        "type_pro": type_pro,
        "project_tags": tags,


    };
    let nft_data = [];
    if (nft_number > 0) {
        for (let i = 0; i < nft_number; i++) {
            nft_data.push({
                "title": nftName[i], // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
                "description": NFT_Short_info[i], // free-form description
                "media": nft_image_array[i], // URL to associated media, preferably to decentralized, content-addressed storage
                "media_hash": null, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
                "copies": null, // number of copies of this set of metadata in existence when token was minted.
                "issued_at": null, // When token was issued or minted, Unix epoch in milliseconds
                "expires_at": null, // When token expires, Unix epoch in milliseconds
                "starts_at": null, // When token starts being valid, Unix epoch in milliseconds
                "updated_at": null, // When token was last updated, Unix epoch in milliseconds
                "extra": null, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
                "reference": null, // URL to an off-chain JSON file with more info.
                "reference_hash": null
            });
        }
    }
    /*,
            "nft_data": {
                "nft_number": nft_number,
                "name": nftName,
                "img": nft_image_array,
                "price": nftPrice, //in $NEAR
                "short_info": NFT_Short_info,
                "id_number": id_number
            }
        }*/

    /*    const blob = new Blob([JSON.stringify(pro_data_create)], { type: 'application/json' });
        const files = [new File([blob], name + '.json')];
        let file_cid = await storeFiles(files);*/

    await add_donation(amount, type_found, name, pro_data_create, nft_data, nftPrice, neart);
    document.getElementById("create_pro").style.display = "none";
    document.getElementById("create_page").style.display = "block";
    document.getElementById("pro_name").innerHTML = name;
}





async function load_to_nft_storage(image) {
    var img_array = [];

    for (let i = 0; i < image.length; i++) {
        var img = image[i].files;
        var cid = await storeFiles(img);

        img_array.push(cid);
    }
    return img_array;
}



window.nearInitPromise = initContract()
    .then(doWork)
    .catch(console.error);