// Initial page load
var productQueue = 0, //number of products fetched
    productsListed = 0, //number of products rendered
    heldProducts = "", //string value of JSON products
    waitToCall = false, //boolean that prevents AJAX from being fired more than once
    lastRandom = 0, //stores last random number for ad images
    showNextProducts = false, //boolean than changes if user has scrolled to bottom but products were not ready yet
    theEnd = false; //switches to true when there are no more products to display


// initial api parameters
var limit = 25, 
    sort = '';

function getProducts(hold){
	if(!theEnd){
		var request = new XMLHttpRequest();
		request.open('GET', '/api/products?limit=' + limit + '&skip=' + productsListed + '&sort=' + sort, true);

		request.onload = function() {
		  if (request.status >= 200 && request.status < 400) {
		  	if(!hold){
		    	showProducts( parseProducts(request.responseText) );
		  	}else if(hold && showNextProducts == true){
		  		showNextProducts = false;
		  		showProducts( parseProducts(request.responseText) );
		  	}else{
		  		heldProducts = request.responseText;
		  		waitToCall = false;
		  	}
		  } else {
			console.log('getProduct error');
		  }
		};
		request.send();
	}
};


function parseProducts (products){
	var prodArray = [];
	products.split(/(\r\n|\n|\r)/gm)
		.forEach(function(obj,idx,arr){
			if(obj.length > 1){
				prodArray.push(JSON.parse(obj));
				productQueue += 1;
			}
			if(idx == arr.length && prodArray.length < limit){ //if the response is less than the limit, the end of the catalogue has been reached
				theEnd = true;
				if(document.getElementById("progress")){document.getElementById("progress").remove()};
				var html = '<div class="product-box"><span> ~ end of catalogue ~ </span></div>';
				var productHtml = document.createElement('div');
				productHtml.innerHTML = html;
				document.getElementById("product-bound").appendChild(productHtml);
			}
		});
	return prodArray;
};

function checkDate(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);
    interval = Math.floor(seconds / 86400);
    if (interval > 1 && interval <= 7) {
        return interval + " days ago";
    }else{
    	return date
    }
};

function showProducts (products) {

	products.forEach(function(obj,idx,arr){
		var html = '<div class="product-box">';
			html += '<span class="face" style="font-size:' + obj.size + 'px;">' + obj.face + '</span>';
			html += '<span class="id">ID: ' + obj.id + '</span>';
			html += '<span class="price">Price: $' + (obj.price/100).toFixed( 2 ) + '</span>';
			html += '<span class="size">Size: ' + obj.size + 'px</span>';
			html += '<span class="date">Added: ' + checkDate( new Date(obj.date) ) + '</span>';
		html += '</div>';
		if(document.getElementById("progress")){document.getElementById("progress").remove()};
		var productHtml = document.createElement('div');
		productHtml.innerHTML = html;
		document.getElementById("product-bound").appendChild(productHtml);
		productsListed += 1;
		if(productsListed % 20 === 0){
			nonDoubleRandom();
		}
	});
	if(!document.getElementById("progress")){
		var html = '<div id="progress"  class="product-box"><div class="loader"></div></div>';
		var productHtml = document.createElement('div');
		productHtml.innerHTML = html;
		document.getElementById("product-bound").appendChild(productHtml);
	}
	if(productsListed == productQueue){
		getProducts(true,productsListed);
	}
};

function nonDoubleRandom(){
	if (lastRandom === 0) {
    	random = Math.floor(Math.random() * 1000);
	}
	while (random === lastRandom) {
	    random = Math.floor(Math.random() * 1000);
	}
	lastRandom = random;
	var html = '<div class="product-box"><img class="ad" src="/ad/?r=' + random + '"></img></div>';
	var productHtml = document.createElement('div');
	productHtml.innerHTML = html;
	document.getElementById("product-bound").appendChild(productHtml);
};
	
getProducts();

// infinite scroll load
var body = document.body,
    html = document.documentElement;

function checkPageBottom(ev){
	var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
    if ((window.innerHeight + document.body.scrollTop) >= height && waitToCall == false) {
    	waitToCall = true;
    	showNextProducts = true;
        showProducts( parseProducts(heldProducts) );
    }
}
window.onscroll = checkPageBottom;

// filter buttons
function resetInitialValues(){
	productQueue = 0,
	productsListed = 0,
	heldProducts = "",
	waitToCall = false,
	lastRandom = 0,
	showNextProducts = false;
};

var nodeList = document.getElementsByClassName('filter-button');
for (var i = 0; i < nodeList.length; i += 1) {
	var item = nodeList[i];
	item.onclick=function(e){
		resetInitialValues();
		sort = e.currentTarget.name;
		document.getElementById("product-bound").innerHTML = '';
		getProducts();
	};
};
