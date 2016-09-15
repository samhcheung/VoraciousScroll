var app = require('../server.js');
var routes = require('express').Router();
var passport = require('./passport.js');
var aylien = require('../news-apis/aylien-helpers.js');
var googleTrends = require('../news-apis/google-trends-helpers.js');
var request = require('request');
var db = require('./db.controller.js');
var path = require('path');
var async = require('async');

var preFetch = {
    'date': '',
    'list': [],
    'data': [{'topic':''},{'topic':''},{'topic':''},{'topic':''},{'topic':''}]
};

module.exports = function(app, express) {

/**************** AUTOCOMPLETE *****************/
  app.route('/input/:input')
    .get(function(req, res) {
      var url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=pageprops%7Cpageimages%7Cpageterms&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=80&pilimit=5&wbptterms=description&gpssearch=' + req.params.input + '&gpsnamespace=0&gpslimit=5';
      request(url, function(err, resp, body) {
        if (err) {
          console.log('there was an error requesting via express', err);
        } else {
          console.log('<<<<<<<<<<- congrats!!!');
          res.status(200).send(body);
        }
      });
    });

/**************** USER AUTH FACEBOOK *****************/
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/enter', function(req, res) {
    console.log(__dirname);
    res.sendFile(path.join(__dirname + '/../../public/layout.html'));
  });

  app.get('/auth/facebook',
    passport.authenticate('facebook'));

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
      function(req, res) {
      // Successful authentication, redirect home.
        res.cookie('authenticate', req.session.passport);
        // console.log('cookie being set', req.session.passport)
        res.redirect('/enter');
      });

  app.route('/results/:input')
    .get(function(req, res) {
      console.log('Received get on /results/:input from app.route on routes.js');
      var data = {};
      var input = req.params.input;
      aylien.getAnalysis(data, input, function() {
        res.send(data);
      });
    });

  // see-article?input=obama&start=[startdate]&end=[enddate]
  app.route('/seearticle')
    .get(function(req, res) {
      aylien.articleImport(req.query.input, res, req.query.start, req.query.end, req.query.limit);
    });

  /************************ GOOGLE TRENDS **********************************/
  // Top trends pull top # of trends from specified country
    // googleTrends.hotTrends(resultLimit, country, res)
      // resultLimit: Number
      // country: String, ex: 'US', default is US

  app.route('/api/news/topTrends')
    .get(function(req, res) {
      googleTrends.hotTrends(res, 10, 'US');
    });

  app.route('/api/news/topTrendsDetail')
    .get(function(req, res) {
      googleTrends.hotTrendsDetail(res, 10, 'US');
    });

  /************************ PREFETCH DATA**********************************/

  app.route('/api/news/fetchData')
    .get(function(req, res) {
        // get trends, then data
      var current = new Date();
      // check date within the hour
      var last = preFetch.date || current;
      var hourDiff = Math.abs(current.getTime() - last.getTime()) / 3600000;
      if (hourDiff > 0) {
         res.send(preFetch);
      } else {
        googleTrends.hotTrendsDetail(null, 5, 'US', function(list) {
          preFetch.list = list;
          //preFetch.date = current;
          preFetch.count = 0;
          // for each topic get keywords, sentiment, sources, timeline
          for (var i = 0; i < 5; i++) {
            preFetch.data[i].topic == preFetch.list[i].title[0];
            preFetch.data[i].img = 'http://' + preFetch.list[i]['ht:picture'][0].slice(2);
            preFetch.data[i].traffic = preFetch.list[i]['ht:approx_traffic'][0]
            aylien.getAnalysis(preFetch.data[i], list[i].title[0], function (data) {
              //back from getAnalysis - preFetch is populated(?)
              preFetch.count = preFetch.count + 1;
            });
          }
        });
        // wait for done
        var waitForIt = setInterval(function() {
          // Do something every 10 seconds
          if (preFetch.count === 5) {
            clearInterval(waitForIt);
            preFetch.count = 0; //send only once
            res.send(preFetch);
          }
        }, 5000);
      }
    });

  /************************ SAVE ARTICLE **********************************/
  app.route('/article')
    .post(function(req, res) {
      db.saveArticle.post(req, function(error, success) {
        if (error) {
          res.sendStatus(501);
        } else {
          res.send({article: success});
        }
      });
    });

  app.route('/unsaveArticle/:id')
    .delete(function(req, res) {
      db.unsaveArticle.delete(req, function(err, success) {
        res.send(success);
      });
    });

  app.route('/profile')
    .get(function(req, res) {
      db.profile.get(req, function(error, success) {
        res.send(success);
      });
    });

  // Error handling: send log the error and send status 500. This handles one error.
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

};
