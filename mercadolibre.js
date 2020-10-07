
const debug = 0

const Vue = require('vue')
const axios = require('axios').default;


var bodyParser = require('body-parser')

var express = require('express')
const cors = require('cors')
var fs = require('fs')

const render = require('vue-server-renderer').createRenderer()

var process = require('./process.json')

var app = express()


app.use(bodyParser.json({limit: '5000mb'}));
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true}));
app.use(express.json({limit: '5000mb'}));
app.use(express.urlencoded({limit: '5000mb'}));
app.use(cors({ origin: true }))
app.use(express.static(__dirname));


Vue.prototype.$axios = 'axios'

fs.readFile('html/product_template.html', 'utf8', function(err, datahtml) {
    if (err){
    	console.log("ERROR reading files   "+err)
    	throw err
    } 

    //console.log("test   "+JSON.stringify(data.results[0].seller.seller_reputation))


    Vue.component('product_item', {
		data: function () {
			return {
			}
		},
		methods:{

			formatPrice(value) {
		        let val = (value/1).toFixed(2).replace('.', ',')
		        return "$"+val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
		    }

		},
		props: ['product'],
		template: datahtml
	  
	})

})





app.get('/product', async function (req, res) {

	
   	var parameter = req.query

  	var data = await getResponseGet('http://localhost:8899/api/items',parameter)


	fs.readFile('html/item.html', 'utf8', function(err, datahtml) {
	    if (err){
	    	console.log("ERROR reading files   "+err)
	    	throw err
	    } 


	    var product_vue = new Vue({
			data(){
				return{
					data:data
				}
				
			},
		  	template: datahtml
		})

		render.renderToString(product_vue,(err,html) =>{
			if (err) {
				console.log("ERROR XXXX     "+err)
			  res.status(500).end('Internal Server Error')
			  return
			}


			res.send(html)


		
			
		})
	})


	


})

app.get('/search', async function (req, res) {


	fs.readFile('html/search.html', 'utf8', function(err, datahtml) {
	    if (err){
	    	console.log("ERROR reading files   "+err)
	    	throw err
	    } 



	    const search_vue = new Vue({
			data(){
				return{

				}
				
			},

		  	template: datahtml
		})

		render.renderToString(search_vue,(err,html) =>{
			//console.log("html     "+html)
			if (err) {
				console.log("ERROR XXXX     "+err)
			  res.status(500).end('Internal Server Error')
			  return
			}

			//console.log("html   "+html)

			res.send(html)


		
			
		})
	})

})

app.get('/single_product', async function (req, res) {

	console.log("id   "+req.query.id)

	console.log('https://api.mercadolibre.com/items/'+req.query.id)

	var data = await getResponseGet('http://localhost:8899/api/items/'+req.query.id,null)


	fs.readFile('html/single_product.html', 'utf8', function(err, datahtml) {
	    if (err){
	    	//console.log("ERROR reading files   "+err)
	    	throw err
	    } 



	    const single_product_vue = new Vue({
			data(){
				return{
					data:data
				}
				
			},
			methods:{

				formatPrice(value) {
			        let val = (value/1).toFixed(2).replace('.', ',')
			        return "$"+val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
			    }

			},
		  	template: datahtml
		})

		render.renderToString(single_product_vue,(err,html) =>{
			//console.log("html     "+html)
			if (err) {
				console.log("ERROR XXXX     "+err)
			  res.status(500).end('Internal Server Error')
			  return
			}

			//console.log("html   "+html)

			res.send(html)


		
			
		})
	})

})

app.get('/', async function (req, res) {

	var htmlproduct

	
	var htmlsearch = await getResponseGet('http://localhost:8899/search',null)
	
	fs.readFile('html/index.html', 'utf8', function(err, datahtml) {
	    if (err){
	    	console.log("ERROR reading files   "+err)
	    	throw err
	    } 


	    const index_vue = new Vue({
			data(){
				return{
					htmlsearch:htmlsearch,
					htmlproduct:htmlproduct
				}
				
			},
			
		  	template: datahtml
		})

		render.renderToString(index_vue,(err,html) =>{
			//console.log("html     "+html)
			if (err) {
				console.log("ERROR XXXX     "+err)
			  res.status(500).end('Internal Server Error')
			  return
			}

			//console.log("html   "+html)

			res.send(html)


		
			
		})
	})

})

app.get('/items', async function (req, res) {

	var htmlproduct

	if(req.query.search){

		var param = {}
		param['q'] = req.query.search

		htmlproduct = await getResponseGet('http://localhost:8899/product',param)

	}
	else{
		htmlproduct = ""
	}
		

	
	var htmlsearch = await getResponseGet('http://localhost:8899/search',null)
	
	fs.readFile('html/index.html', 'utf8', function(err, datahtml) {
	    if (err){
	    	console.log("ERROR reading files   "+err)
	    	throw err
	    } 


	    const index_vue = new Vue({
			data(){
				return{
					htmlsearch:htmlsearch,
					htmlproduct:htmlproduct
				}
				
			},
			
		  	template: datahtml
		})

		render.renderToString(index_vue,(err,html) =>{
			if (err) {
				console.log("ERROR XXXX     "+err)
			  res.status(500).end('Internal Server Error')
			  return
			}

			//console.log("html   "+html)

			res.send(html)


		
			
		})
	})


})

app.get('/api/items', async function (req, res) {

	var htmlproduct

	if(req.query.q){


		var api_response = await getResponseGet('https://api.mercadolibre.com/sites/MLA/search',req.query)

		var response = await getResponseFormatted(api_response);

		res.send(response)


	}
	else{
		res.send(null)
	}



})

app.get('/items/:id', async function (req, res) {

	var htmlproduct


	if(req.params.id){

		htmlproduct = await getResponseGet('http://localhost:8899/single_product',req.params)

	}

	var htmlsearch = await getResponseGet('http://localhost:8899/search',null)
	
	fs.readFile('html/index.html', 'utf8', function(err, datahtml) {
	    if (err){
	    	console.log("ERROR reading files   "+err)
	    	throw err
	    } 


	    const index_vue = new Vue({
			data(){
				return{
					htmlsearch:htmlsearch,
					htmlproduct:htmlproduct
				}
				
			},
			
		  	template: datahtml
		})

		render.renderToString(index_vue,(err,html) =>{
			//console.log("html     "+html)
			if (err) {
				console.log("ERROR XXXX     "+err)
			  res.status(500).end('Internal Server Error')
			  return
			}

			//console.log("html   "+html)

			res.send(html)


		
			
		})
	})

})

app.get('/api/items/:id', async function (req, res) {

	var htmlproduct

	if(req.params.id){

		var data = await getResponseGet('https://api.mercadolibre.com/items/'+req.params.id,null)
		var data2 = await getResponseGet('https://api.mercadolibre.com/items/'+req.params.id+"/description",null)

		var response = await getResponseFormatted2(data,data2)

		res.send(response)


	}
	else{
		res.send(null)
	}

})


async function getResponseGet(url,param){

	
	var returned = await axios.get(url,{ params:param })
	  .then(response => {

	  	return response.data

	  	})
		.catch(error => {

		  	//console.log(error)

		  	this.errored=true

		  	return null
	  	})
	  	.finally(() => {
		  	this.ready = true

		  	//console.log("returned  "+JSON.stringify(returned))


	  	})

  	return returned

}

async function getResponseFormatted(api_response){

	var returned = {}
	var cnt = 0

	returned["autor"]={
		name:"Juan Diego",
		lastname:"Trochez Montoya"
	}

	returned["categories"] = []

	returned["items"] = []

	for(var key in api_response.results){

		if(cnt>3){
			break
		}

		var item = {}
		item["id"] = api_response.results[key].id
		item["title"] = api_response.results[key].title
		item["price"] = {
			amount:api_response.results[key].price,
			currency:api_response.results[key].currency_id,
			decimals:0
		}
		item["picture"] = api_response.results[key].thumbnail
		item["condition"] = api_response.results[key].condition
		item["free_shipping"] = api_response.results[key].shipping.free_shipping
		returned["items"].push(item)

		cnt++

	}

	//console.log("returned in function  "+JSON.stringify(returned))

	return returned

}

async function getResponseFormatted2(data,data2){

	var returned = {}

	returned["autor"]={
		name:"Juan Diego",
		lastname:"Trochez Montoya"
	}

	returned["item"] = {}

	returned["item"]["id"] = data.id
	returned["item"]["title"] = data.title
	returned["item"]["price"] = {
		amount:data.price,
		currency:data.currency_id,
		decimals:0
	}

	returned["item"]["picture"] = data.pictures[0].url
	returned["item"]["condition"] = data.condition
	returned["item"]["free_shipping"] = data.shipping.free_shipping
	returned["item"]["sold_quantity"] = data.sold_quantity
	returned["item"]["description"] = data2.plain_text

	return returned

}


app.get('/main.css', function(req, res) {
  res.sendFile(__dirname+"/css/" + "main.css");
});

app.listen(process.env.port, function () {
  console.log('Example app listening on port '+process.env.port+'!')
})
