import "./near-work"

function addProjectList() {

}

document.getElementById("create_project_modal").onclick = function(){
    if(window.walletAccount.isSignedIn()) {
        document.getElementById("create_pro").style.display = "block";
    }else{
        document.getElementById("modalSignIn").style.display = "block";
    }
}

document.getElementById("sign_in_btn_modal").onclick = async ()=> {

    await window.walletAccount.requestSignIn(window.nearConfig.contractName);
    if(window.walletAccount.isSignedIn()) {
        document.getElementById("modalSignin").style.display = "none";
        document.getElementById("create_pro").style.display = "block";
    }
}
document.getElementById("btn-close-pro-create").onclick = function () {
    document.getElementById("create_pro").style.display = "none";
}

var img_number = 1;
document.getElementById("add_img_btn").onclick = function(){
    if ('content' in document.createElement('template')) {
        img_number = img_number+1;
        // Находим элемент tbody таблицы
        // и шаблон строки
        let input_place = document.getElementById("img_add");
        let template = document.getElementById("img_form");


        let clone = template.content.cloneNode(true);

        document.getElementById("remove_img_btn").style.display = "block";
        input_place.appendChild(clone);




    }
}

document.getElementById("floatingShortInfo").onchange = function () {
    
}

document.getElementById("remove_img_btn").onclick = function(){
    let div_list = document.getElementsByName("image");

    let div_bonus_remove = div_list[div_list.length-1];
    div_bonus_remove.parentNode.removeChild(div_bonus_remove);
    img_number = img_number-1;
    if (img_number===1){
        document.getElementById("remove_img_btn").style.display ="none";
    }
}

var bonus_number = 0;
document.getElementById("add_nft_button").onclick = function(){
    if ('content' in document.createElement('template')) {
        bonus_number = bonus_number+1;
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

document.getElementById("remove-nft_button").onclick = function(){
    var div_list = document.getElementsByClassName("div_create_nft");

    var div_bonus_remove = div_list[div_list.length-1];
    div_bonus_remove.parentNode.removeChild(div_bonus_remove);
    bonus_number = bonus_number-1;
    if (bonus_number===0){
        document.getElementById("remove-nft_button").style.display ="none";
    }
}


