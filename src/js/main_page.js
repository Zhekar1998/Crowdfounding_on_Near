//import "./near-work"
import "regenerator-runtime/runtime"


var NEAR_exchange_data;

function error() {
    console.error("data not find");
}

function NEAR_exchange(Data) {

    // Output only the details on the first post
    console.log(Data);
    NEAR_exchange_data = Data;
    // output the details of first three posts

    // output the id field of first five elements.

}



document.getElementById("create_project_modal").onclick = function() {
    if (window.walletAccount.isSignedIn()) {
        document.getElementById("create_pro").style.display = "block";
        loadJSON("https://helper.testnet.near.org/fiat", NEAR_exchange, error);

    } else {
        document.getElementById("modalSignIn").style.display = "block";
    }
}

function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                success(JSON.parse(xhr.responseText));
            } else {
                error(xhr);
            }
        }
    };
    xhr.open('GET', path, true);
    xhr.send();
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
document.getElementById("btn-close_singin").onclick = function() {
    document.getElementById("modalSignIn").style.display = "none";
}

document.getElementById("btn-close_donateBox").onclick = function() {
    document.getElementById("donateBox").style.display = "none";
}
document.getElementById("btn-close_createpage").onclick = function() {
    document.getElementById("create_page").style.display = "none";
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

/*window.document.onload = function () {
    let i =0;
    document.getElementsByName("dolar_NFT_price").forEach((el)=>{
        el.onkeyup = function () {
            document.getElementsByName("nft_price_create")[i].value = el.value/NEAR_exchange_data.near.usd;
        }
        i++;
    })
    i=0
    document.getElementsByName("nft_price_create").forEach((el)=>{
        el.onkeyup = function () {
            document.getElementsByName("dolar_NFT_price")[i].value = el.value*NEAR_exchange_data.near.usd;
        }
        i++;
    })
}*/

function near_to_dollar() {
    for (let i = 0; i < document.getElementsByName("dolar_NFT_price").length; i++) {
        document.getElementsByName("dolar_NFT_price")[i].value = document.getElementsByName("nft_price_create")[i].value * NEAR_exchange_data.near.usd;
    }
}

function dollar_to_near() {
    for (let i = 0; i < document.getElementsByName("dolar_NFT_price").length; i++) {
        document.getElementsByName("nft_price_create")[i].value = document.getElementsByName("dolar_NFT_price")[i].value / NEAR_exchange_data.near.usd;
    }
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