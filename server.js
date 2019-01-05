var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";
var express = require('express')
var bodyParser = require('body-parser');
var Q = require('q');
var app = express();
var cors = require('cors');
var ObjectId = require('mongodb').ObjectID;
app.use(cors());
app.use(bodyParser.json());
var database;
   
MongoClient.connect(url,{ useNewUrlParser: true },function(err, db) {
    if (err){
        throw err;
    }
    else{
        database = db
    }
});

app.get('/menu', function (req, res) {
    Q().then(() => {
        return database.db("faasos").collection("menu").find().project().toArray()
    }).then(response => {
        res.json(response);
    }).catch(error => {
        console.log(error)
    })
});


app.post('/placeOrder/:totalCost', function (req, res) {
    Q().then(() => {
        return database.db("faasos").collection("order").insertOne({"date":new Date(),"totalAmount":req.params.totalCost,"order":[req.body], "status":0})
    }).then(response => {
        res.json(response);
    }).catch(error => {
        console.log(error)
    })
});

app.post('/predicted', function (req, res) {
    let date = new Date()
    Q().then(() => {
        return [database.db("faasos").collection("prediction").findOne({"date" : {$gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 5, 30, 0, 0)}}), req]
    }).spread((response,req) => {
        if(response == null){
            return database.db("faasos").collection("prediction").insertOne({"date":new Date(),"order":[req.body]})
        }
        else{
            return database.db("faasos").collection("prediction").updateOne({"date" : {$gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 5, 30, 0, 0)}
        },{$set:{"date":new Date(),"order":[req.body]}})
        }
    }).then(response => {
        res.json(response);
    }).catch(error => {
        console.log(error)
    })
});

app.get('/predicted', function (req, res) {
    Q().then(() => {
        let date = new Date()
        return database.db("faasos").collection("prediction").find({"date" : {$gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 5, 30, 0, 0)}
    }).project().toArray()
    }).then(response => {
        res.json(response);
    }).catch(error => {
        console.log(error)
    })
});

app.get('/todayOrders', function (req, res) {
    Q().then(() => {
        let date = new Date()
        return database.db("faasos").collection("order").find({"date" : {$gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 5, 30, 0, 0)}
        ,status:1}).project().toArray()
    }).then(response => {
        res.json(response);
    }).catch(error => {
        console.log(error)
    })
});

app.get('/orders', function (req, res) {
    Q().then(() => {
        return database.db("faasos").collection("order").find({status:0}).project().toArray()
    }).then(response => {
        res.json(response);
    }).catch(error => {
        console.log(error)
    })
});

app.put('/orderFinished/:id', function (req, res) {
    Q().then(() => {
        return database.db("faasos").collection("order").updateOne({"_id":ObjectId(req.params.id)},{$set:{"status":1}})
    }).then(response => {
        res.json(response);
    }).catch(error => {
        console.log(error)
    })
});
var server = app.listen(5000)