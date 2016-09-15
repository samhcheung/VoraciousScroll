angular.module('smartNews.home', ['smartNews.services', 'smartNews.timeline'])

// Sub-Views
.directive('primaryarticle', function(){
  return {
    templateUrl: 'features/home/primaryArticle.html',
    controller: 'PrimaryArticleCtrl'
  };
})
.directive('toptrends', function(){
  return {
    templateUrl: 'features/home/trends.html',
    controller: 'TopTrendsCtrl'
  };
})
.directive('analysisItem', function() {
  return {
    templateUrl: 'features/home/analysisBox.html',
    link: function(scope, element, attr) {


      var renderSources = function(trends, index) {
        d3.selectAll(".sources")
          .filter(function(d, i) {
            return i === index;
          }).remove();
        size = {width: 430, height: 250};
        index = +index || 0;

        var width = size.width,
            height = size.height,
            radius = Math.min(width, height) / 2;

        var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", '9B5600', '893806', '66221B']);

        var arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(radius - 70);

        var pie = d3.pie()
            .sort(null)
            .value(function(d) { return d.count; });

        var svg = d3.selectAll(".sources")
          .filter(function(d, i) {
            return i === index;
          })
          .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", 'sourcesSVG')
            .append("g")
            .attr("transform", "translate(130," + height / 2 + ")")
            .attr('class', 'donut');

        var g = svg.selectAll(".arc")
            .data(pie(trends))
          .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", function(d) { return color(d.data.value); });

        var ordinal = d3.scaleOrdinal()
          .domain(trends.map(function(item) {
            return item.value;
          }))
          .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", '9B5600', '893806', '66221B']);

        var donut = d3.selectAll(".donut")
          .filter(function(d, i) {
            return i === index;
          });

        donut.append("g")
          .attr("class", "legendOrdinal")
          .attr("transform", "translate(150,-100)");

        var legendOrdinal = d3.legendColor()
          .shape("path", d3.symbol().type(d3.symbolCircle).size(100)())
          .shapePadding(10)
          .scale(ordinal);

        donut.select(".legendOrdinal")
          .call(legendOrdinal);
      
      };

      attr.$observe('index', function(index) {
        renderSources(scope.dummy.trends, index);
      });
    }
  };
})

// Home Controller
.controller('HomeCtrl', function($scope) {
  $scope.test = 'Home View';
  d3.select('.sources').remove();

  $scope.dummies = [
    {
      'trends': [
        {
          "value": "News Vine",
          "count": 1000
        },
        {
          "value": "Huffington Post",
          "count": 3958
        },
        {
          "value": "Washington Post",
          "count": 3843
        },
        {
          "value": "News Max",
          "count": 2674
        },
        {
          "value": "Real Clear Politics",
          "count": 2507
        },
        {
          "value": "TPM",
          "count": 2378
        },
        {
          "value": "Raw Story",
          "count": 2346
        },
        {
          "value": "MSNBC",
          "count": 2343
        },
        {
          "value": "CNN",
          "count": 2219
        },
        {
          "value": "Fox News",
          "count": 2062
        }
      ]
    },
     {
      "trends": [
        {
          "value": "News Vine",
          "count": 1978
        },
        {
          "value": "Washington Post",
          "count": 1686
        },
        {
          "value": "Real Clear Politics",
          "count": 1425
        },
        {
          "value": "Fox News",
          "count": 1381
        },
        {
          "value": "Huffington Post",
          "count": 1182
        },
        {
          "value": "CNN",
          "count": 1148
        },
        {
          "value": "ABC News",
          "count": 1120
        },
        {
          "value": "Inquisitr",
          "count": 1048
        },
        {
          "value": "CBS News",
          "count": 1035
        },
        {
          "value": "MSNBC",
          "count": 1022
        }
      ]
    }
  ];

  


});
