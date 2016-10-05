var express = require("express");
var valid = require("url-valid");
var mongodb = require("mongodb");
var app = express();

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
var url = process.env.MLAB_LINK;

app.get("/", function(req, res) {
	res.end("Enter a url");
});
app.get("/:url*", function(req, res) {
	var requestedUrl = req.originalUrl.slice(1);
	var result = {};
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log("No connect " + err);
		} else {
			console.log("connection established");
			var collection = db.collection("sites");
			valid(requestedUrl, function(err, valid) {
				if (!valid && !Number(requestedUrl)) {
					result.error = "URL entered is not valid, please make sure it is entered in the correct format and try again.";
					res.send(result);
					res.end();
				} else if (!valid && Number(requestedUrl)) {
					loadWebsite(db, collection, requestedUrl, res, result);
				} else {
					result.entered_Url = requestedUrl;
					addWebsite(db, collection, requestedUrl, res, result);
				}
			});
		}
	});	
})

function addWebsite(db, collection, requestedUrl, res, result) {
	collection.count().then(function(currentCount) {
		var index = currentCount + 1;
		collection.insert({
			"key": index,
			"website": requestedUrl
		});
		result.shortened_Url = "https://amer-url-short.herokuapp.com/" + index;
		res.send(result);
		res.end();
	}); 
}

function loadWebsite(db, collection, requestedUrl, res, result) {
	collection.find({"key": Number(requestedUrl)}).toArray(function(err, result) {
		if (err) {
			res.end("Error connecting to database: " + err);
		} else {
			if (result.length == 0) {
				result = {"error": "The requested webite could not be found in our database."};
				res.send(result);
				res.end();
			} else {
				res.writeHead(301, {Location: result[0].website});
				res.end();		
			}
		}
	});

}

// port 3000 used for localhost during development.
var port = Number(process.env.PORT || 3000)
app.listen(port);

/* TO DO
	add index.html
	hide username and password from code
 */