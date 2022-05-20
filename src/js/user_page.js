import "regenerator-runtime/runtime"
import * as nearAPI from "near-api-js"
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'
import inspect from 'browser-util-inspect';
import { utils } from "near-api-js";
import { create } from 'ipfs-http-client';
import { findSeatPrice } from "near-api-js/lib/validators";
import 'fs';
import { async } from "regenerator-runtime/runtime";
import * as grapesjs from "grapesjs";

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

        viewMethods: ["get_donations", "is_register", "get_profile_full"],
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
        projects_array_lenght = projects_array.length;
        document.getElementById("commertial_projects").innerHTML = '';
        document.getElementById("nonprofit_projects").innerHTML = '';
        for (let i = 0; i < projects_array.length; i++) {
            if (projects_array[i].receiver == window.accountId) {
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
                document.getElementById("myprojects").innerHTML='<h4>'+projects_array[i].project_name+'</h4><p>ammount: '+projects_array[i].amount+', donated: '+projects_array[i].donated+'</p>'
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

async function signedInFlow() {

    document.getElementById('sign-out').style.display = ' ';
    document.getElementById('account_id').style.display = '';
    document.getElementById('sign-in').style.display = 'none';

    // Displaying current account name.
    document.getElementById('account_id').innerText = window.accountId;
    document.getElementById('account').innerText = window.accountId;
    let account_data = await window.contract.get_profile_full({ "user": window.accountId });
    document.getElementById('full_name').innerText = account_data.full_name;
    document.getElementById('full_name2').innerText = account_data.full_name;
    document.getElementById('country').innerText = account_data.country;
    document.getElementById('website').innerText = account_data.website;
    document.getElementById('github').innerText = account_data.github;
    document.getElementById('twitter').innerText = account_data.twitter;
    document.getElementById('instagramm').innerText = account_data.instagram;
    document.getElementById('facebook').innerText = account_data.facebook;
    document.getElementById('telegram').innerText = account_data.telegram;
    document.getElementById('email').innerText = account_data.email;
    document.getElementById('phone').innerText = account_data.phone;
    document.getElementById('adress_f1').innerText = account_data.adress_f1;
    document.getElementById('adress_f2').innerText = account_data.adress_f2;
    document.getElementById('posstal_index').innerText = account_data.postal_index;
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

var editor = grapesjs.init({
    container: '#gjs',
    components: '<div class="txt-red">Hello world!</div>',
    style: '.txt-red{color: red}',
});

document.getElementById("create_project_modal").onclick = function() {
    if (window.walletAccount.isSignedIn()) {
        document.getElementById("create_pro").style.display = "block";
        loadJSON("https://helper.testnet.near.org/fiat", NEAR_exchange, error);

    } else {
        document.getElementById("modalSignIn").style.display = "block";
    }
}

document.getElementById("sign_in_btn_modal").onclick = async() => {

    await window.walletAccount.requestSignIn(window.nearConfig.contractName);
    if (window.walletAccount.isSignedIn()) {
        document.getElementById("modalSignin").style.display = "none";
        document.getElementById("create_pro").style.display = "block";
        loadJSON("https://helper.mainnet.near.org/fiat", NEAR_exchange, error);
    }
}
document.getElementById("btn-close-pro-create").onclick = function() {
    document.getElementById("create_pro").style.display = "none";
}

var img_number = 1;
document.getElementById("add_img_btn").onclick = function() {
    if ('content' in document.createElement('template')) {
        img_number = img_number + 1;
        // Находим элемент tbody таблицы
        // и шаблон строки
        let input_place = document.getElementById("img_add");
        let template = document.getElementById("img_form");


        let clone = template.content.cloneNode(true);

        document.getElementById("remove_img_btn").style.display = "block";
        input_place.appendChild(clone);




    }
}

document.getElementById("floatingShortInfo").onchange = function() {

}



document.getElementById("remove_img_btn").onclick = function() {
    let div_list = document.getElementsByName("image");

    let div_bonus_remove = div_list[div_list.length - 1];
    div_bonus_remove.parentNode.removeChild(div_bonus_remove);
    img_number = img_number - 1;
    if (img_number === 1) {
        document.getElementById("remove_img_btn").style.display = "none";
    }
}

var bonus_number = 0;
document.getElementById("add_nft_button").onclick = function() {
    if ('content' in document.createElement('template')) {
        bonus_number = bonus_number + 1;
        // Находим элемент tbody таблицы
        // и шаблон строки
        var input_place = document.getElementById("NFT_create_place");
        var template = document.getElementById("create_nft_template");


        var clone = template.content.cloneNode(true);
        clone.getElementById("nft_number").innerText = "Bonus " + bonus_number;
        document.getElementById("remove-nft_button").style.display = "block";
        input_place.appendChild(clone);




    }
}

document.getElementById("Near_amount").onkeyup = function() {
    document.getElementById("dolar_amount").value = document.getElementById("Near_amount").value * NEAR_exchange_data.near.usd;
}

document.getElementById("dolar_amount").onkeyup = function() {
    document.getElementById("Near_amount").value = document.getElementById("dolar_amount").value / NEAR_exchange_data.near.usd;
}
document.getElementById("remove-nft_button").onclick = function() {
    var div_list = document.getElementsByClassName("div_create_nft");

    var div_bonus_remove = div_list[div_list.length - 1];
    div_bonus_remove.parentNode.removeChild(div_bonus_remove);
    bonus_number = bonus_number - 1;
    if (bonus_number === 0) {
        document.getElementById("remove-nft_button").style.display = "none";
    }
}

document.getElementById("profilebutton").onclick = async function() {
    await window.contract.register({
        "full_name": document.getElementById("full_name_input").value,
        "email": document.getElementById("email_input").value,
        "phone": document.getElementById("tel_input").value,
        "adress_f1": document.getElementById("adress_f1_input").value,
        "adress_f2": document.getElementById("adress_f2_input").value,
        "country": document.getElementById("country_input").value,
        "postal_index": document.getElementById("postal_input").value,
        "web_site": document.getElementById("website_input").value,
        "github": document.getElementById("github_input").value,
        "twitter": document.getElementById("twitter_input").value,
        "instagram": document.getElementById("instagramm_input").value,
        "telegram": document.getElementById("telegram_input").value,
        "facebook": document.getElementById("facebook_input").value
    })
}

document.getElementById("edit_profile").onclick = function() {
    document.getElementById("change_profile").style.display = "block";
}

document.getElementById("btn-close-profile").onclick = function() {
    document.getElementById("change_profile").style.display = "none";
}


window.nearInitPromise = initContract()
    .then(doWork)
    .catch(console.error);