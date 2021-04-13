let config = require('../config/config.json');

var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var mime = require('mime');
var url = require('url');
var request = require('request');
const cors = require('cors');
const Sequelize = require('sequelize');
const appinfo = require('../models/appinfo');
const e = require('express');
const modelsPath = path.join(__dirname + "/../models");
const sequelize = new Sequelize(
    config["development"]["database"],
    config["development"]["username"],
    config["development"]["password"],
    {
        host: config["development"]["host"],
        dialect: config["development"]["dialect"]
    }
);
const model1 = require(`../models/appinfo`)(sequelize, Sequelize.DataTypes);
var db = {};

db[model1.name] = model1;

Object.keys(db).forEach(function(modelName){
    if("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;

var app = express();
app.use(cors());
app.set('port', 8082);

http.createServer(app).listen(app.get('port'), function(){});

app.use('/' + express.static('public'), function(req, res, next){
});

var router = express.Router();
  
router.route('/test').get(function(req, res){
    console.log("connect");
    db['sysInfo'].create({
        name: "test Univ",
        country1: "country1",
        country2: "country2",
        country3: "country3",
        logo: "testUnivLogo.jpg",
        lmsurl: "testUniv:7000/lms",
        subscribe: false,
        latlng: {
            type: "Point", 
            coordinates: [127.0, 36.0]
        }
    }).then(()=>{
        console.log("db insert instruction is completed");
        res.status(201).end();
    });
});
router.route('/getList/:X/:Y/:distance').get(function(req, res){
   let eps = 0;
   if(req.params.distance == 0){
       eps = 0.001;
   }
   else{
        eps = parseInt(req.params.distance) / 1000000
        if(eps > 100){
            eps = 100;
        }
   }
   
    sequelize.query('SELECT * FROM (SELECT * FROM "systemInfo") AS Target JOIN (SELECT MIN(A.id) AS id, clusterid, COUNT(clusterid) FROM (SELECT * FROM "systemInfo") AS A JOIN (SELECT id, ST_ClusterDBSCAN(latlng, :distance, 1) OVER() AS clusterid FROM "systemInfo") AS B ON A.id=B.id GROUP BY clusterid) AS ClusterTable ON Target.id=ClusterTable.id',{
        raw: true,
        replacements: { distance: eps }
    }
    ).then((results)=>{
        //console.log(results);
        results = results[0];

        let string = '{"list":[';
        for(let i = 0; i < results.length; i++){
            string += '{ "id": ' + results[i].id;
            string += ', "name": "' + results[i].name + '"';
            string += ', "country1": "' + results[i].country1 + '"';
            string += ', "country2": "' + results[i].country2 + '"';
            string += ', "country3":"' + results[i].country3 + '"';
            string += ', "logo": "' + results[i].logo + '"';
            string += ', "lmsurl": "' + results[i].lmsurl + '"';
            string += ', "subscribe": ' + results[i].subscribe;
            string += ', "latlng": "' + results[i].latlng.coordinates + '"';
            string += ', "clusterid": ' + results[i].clusterid;
            string += ', "count": ' + results[i].count;
            string += (i < results.length-1) ? '},' : '}';
        }
        string += ']}';

        res.json(JSON.parse(string));
    });
});
router.route('/getNextSectorData/:CATEGORY/:DATE/:STARTINDEX/:COUNT').get(function(req, res){
    let category = req.params.CATEGORY;
    let date = req.params.DATE;
    let startIndex = req.params.STARTINDEX;
    let count = req.params.COUNT;
    sequelize.query('SELECT * FROM (SELECT *, (ROW_NUMBER() OVER()) AS rownumber FROM (SELECT * FROM public."webgl_appInfo" WHERE category=:category AND id>:startIndex) AS a) AS b WHERE rownumber<=:count ORDER BY id ASC',{
        raw: true,
        replacements: { 
            category: category,
            date: date,
            startIndex: startIndex,
            count: count }
    }
    ).then((results)=>{
        results = results[0];

        let string = '{"list":[';
        for(let i = 0; i < results.length; i++){
            string += '{ "id": ' + results[i].id;
            string += ', "category": "' + results[i].category + '"';
            string += ', "date": "' + results[i].date + '"';
            string += ', "type": "' + results[i].type + '"';
            string += ', "content":' + JSON.stringify(results[i].content) + '';
            string += ', "url": "' + results[i].url + '"';
            string += (i < results.length-1) ? '},' : '}';
        }
        string += ']}';

        res.json(JSON.parse(string));
    });
});
router.route('/getPrevSectorData/:CATEGORY/:DATE/:STARTINDEX/:COUNT').get(function(req, res){
    let category = req.params.CATEGORY;
    let date = req.params.DATE;
    let startIndex = req.params.STARTINDEX;
    let count = req.params.COUNT;

    sequelize.query('SELECT * FROM (SELECT *, (ROW_NUMBER() OVER()) AS rownumber FROM (SELECT * FROM public."webgl_appInfo" WHERE category=:category AND id<:startIndex) AS a) AS b WHERE rownumber<=:count ORDER BY id DESC',{
        raw: true,
        replacements: { 
            category: category,
            date: date,
            startIndex: startIndex,
            count: count }
    }
    ).then((results)=>{
        results = results[0];

        let string = '{"list":[';
        for(let i = 0; i < results.length; i++){
            string += '{ "id": ' + results[i].id;
            string += ', "category": "' + results[i].category + '"';
            string += ', "date": "' + results[i].date + '"';
            string += ', "type": "' + results[i].type + '"';
            string += ', "content":' + JSON.stringify(results[i].content) + '';
            string += ', "url": "' + results[i].url + '"';
            string += (i < results.length-1) ? '},' : '}';
        }
        string += ']}';

        res.json(JSON.parse(string));
    });
});
app.use('/api/', router);