/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var MongoClient = require('mongodb').MongoClient
var password = process.env.MONGO_PASSWORD

var APP_PATH = path.join(__dirname, 'dist');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(APP_PATH));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

MongoClient.connect('mongodb://cs336:' + password + '@ds227674.mlab.com:27674/cs336', function (err, client) {
    if (err) throw err;

    var db = client;

    // Additional middleware which will set headers that we need on each request.
    app.use(function(req, res, next) {
        // Set permissive CORS header - this allows this server to be used only as
        // an API server in conjunction with something like webpack-dev-server.
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Disable caching so we'll always get the latest comments.
        res.setHeader('Cache-Control', 'no-cache');
        next();
    });

    app.get('/api/comments', function(req, res) {
        var collection = db.collection('commentCollection');

        collection.find({}).toArray(function(err, docs) {
            // console.log(docs);
            res.json(docs);
        });      
    });

    app.post('/api/comments', function(req, res) {
        var collection = db.collection('commentCollection');

        var newComment = {
            id: Date.now(),
            author: req.body.author,
            text: req.body.text,
        };

        collection.insertOne(newComment, function(err, result) {
            if (err) throw err;
        });

    });

    app.get('/api/comments/:id', function(req, res) {
        db.collection("commentCollection").find({"id": Number(req.params.id)}).toArray(function(err, docs) {
            if (err) throw err;
            res.json(docs);
        });
    });

    app.put('/api/comments/:id', function(req, res) {
        var updateId = Number(req.params.id);
        var update = req.body;
        db.collection('commentCollection').updateOne(
            { id: updateId },
            { $set: update },
            function(err, result) {
                if (err) throw err;
                db.collection("commentCollection").find({}).toArray(function(err, docs) {
                    if (err) throw err;
                    res.json(docs);
                });
            });
    });

    app.delete('/api/comments/:id', function(req, res) {
        db.collection("commentCollection").deleteOne(
            {'id': Number(req.params.id)},
            function(err, result) {
                if (err) throw err;
                db.collection("commentCollection").find({}).toArray(function(err, docs) {
                    if (err) throw err;
                    res.json(docs);
                });
            });
    });


    app.use('*', express.static(APP_PATH));

    app.listen(app.get('port'), function() {
        console.log('Server started: http://localhost:' + app.get('port') + '/');
    });


    db.collection('commentCollection').find().toArray(function (err, result) {
        if (err) throw err;
    })
})


