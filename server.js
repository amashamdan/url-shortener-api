/* load dependendies. */
var express = require("express");
var valid = require("url-valid");
var mongodb = require("mongodb");
var app = express();

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
/* This is the url to the database, it includes username and password so it is stored as an enviroment variable. It is set in both windows and in heroku. */
var url = process.env.MLAB_LINK;
/* get request for the root folder. An html file will be delivered. */
app.get("/", function(req, res) {
	res.end("Enter a url");
});
/* get request for a url, url param can be a new url to store, or a number to load already saved website. The '*' after :url is used to read forward slashes and not assume that a new root is called. */
app.get("/:url*", function(req, res) {
	/* originalUrl read everything after root. slice(1) because the first character will be '/'. */
	var requestedUrl = req.originalUrl.slice(1);
	/* The result json */
	var result = {};
	/* Connection to mongo is initiaited using the url stored in env. variables. */
	MongoClient.connect(url, function(err, db) {
		/* If connection fails, error is logged. */
		if (err) {
			console.log("No connect " + err);
		} else {
			/* a message is logged if the connection is successful. */
			console.log("connection established");
			/* collection sites is created and saved in varialbe collection. */
			var collection = db.collection("sites");
			/* The url is validated. */
			valid(requestedUrl, function(err, valid) {
				/* If the url is not valid and it's not a number, an error message is sent as response. */
				if (!valid && !Number(requestedUrl)) {
					result.error = "URL entered is not valid, please make sure it is entered in the correct format and try again.";
					res.send(result);
					res.end();
				/* If the url is not valid but it is a number, then the user is using a shortened url and the number is the key to a stored website */
				} else if (!valid && Number(requestedUrl)) {
					/* loadWebsite function is called to load the website. */
					loadWebsite(db, collection, requestedUrl, res, result);
				/* If the url is valid, then the user wants to get a shortened link. */
				} else {
					/* The entered url is saved to be displayed to the user at a later point. */
					result.entered_Url = requestedUrl;
					/* addWebsite function is called to generate a short link. */
					addWebsite(db, collection, requestedUrl, res, result);
				}
			});
		}
	});	
})

/* This function "gerentaes" a short url for thr provided website by assigning a key to each added website. */
function addWebsite(db, collection, requestedUrl, res, result) {
	/* The key is not generated randomly. It dependes on the current number of saved websites, so that number is found. then executes the statements when the number of saved websites is loaded... rememeber this is async. code */
	collection.count().then(function(currentCount) {
		/* The current number of documents is increased by 1 which will be the key for the new website. */
		var index = currentCount + 1;
		/* A new document is inserted, it contains the website key and the url. */
		collection.insert({
			"key": index,
			"website": requestedUrl
		});
		/* The shortened url is added to result json using the index. */
		result.shortened_Url = "https://amer-url-short.herokuapp.com/" + index;
		/* response json is sent to the client. */
		res.send(result);
		res.end();
	}); 
}

/* This function loads a website if the entered url is a number. */
function loadWebsite(db, collection, requestedUrl, res, result) {
	/* The entered key is looked up */
	collection.find({"key": Number(requestedUrl)}).toArray(function(err, result) {
		/* This err is a connection error */
		if (err) {
			res.end("Error connecting to database: " + err);
		} else {
			/* If no results are found (key not found), the result json contains an error message which is sent with the response. */
			if (result.length == 0) {
				result = {"error": "The requested webite could not be found in our database."};
				res.send(result);
				res.end();
			} else {
				/* If the website is found, the page is redirected to the corresponding website. */
				res.writeHead(301, {Location: result[0].website});
				res.end();		
			}
		}
	});

}

// port 3000 used for localhost during development.
var port = Number(process.env.PORT || 3000)
app.listen(port);
