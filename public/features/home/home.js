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
.directive('analysisItem', function($window) {
  return {
    templateUrl: 'features/home/analysisBox.html',
    link: function(scope, element, attr) {


      var renderSources = function(trends, index) {

        //Remove any old svg in the sources div
        if(index === '0') {
          d3.selectAll('.sources').selectAll('svg')
            .filter(function(d, i) {
              return i > 0;
            }).remove();
        }

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
            .attr("class", 'sourcesSVG')
            .attr("viewBox", "0 0 " + width + " " + height)
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

      var renderGraph = function(dataObj, index) {
        //Remove any old svg in the timeline div
        if(index === '0') {
          d3.selectAll('.timeline').selectAll('svg')
            .filter(function(d, i) {
              return i > 0;
            }).remove();
        }

        data = dataObj.timeSeries;

        // set graph dimensions and margins
        var margin = { top: 0, right: 50, bottom: 50, left: 50 };

        // fixed size graph. These values are shorter than true innerWidth / innerHeight:
        var graph = document.getElementById('graph1');
        var width = 1200;
        var height = 200;

        // parse UTC date/time
        var parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');
        // set X & Y range
        // range is the raw data values scaled to fit the graph dimensions
        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);
        var svg = d3.selectAll('.timeline')
          .filter(function(d, i) {
            return i === +index;
          })
          .append('div')
          .append('svg')
          .attr('viewBox', '0 0 ' + (width+100) + ' ' + (height + 40))
          // append group element
          .append('g')
          // center group element on page by subtracting viewbox length from viewport length, halving, and spacing that many pixels
          .attr('transform', 'translate(40, 0)');

        // div element for tooltip
        var div = d3.selectAll('.timeline')
          .filter(function(d, i) {
            return i === +index;
          })
          .append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        // format data
        data.forEach(function(d) {
          d.date = parseTime(d.publishedAt);
          d.value = d.count;
        });

        // create line and set x/y values
        var valueline = d3.line()
          .x(function(d) {
            return x(d.date);
          })
          .y(function(d) {
            return y(d.value);
          });

        // filled area definition
        var dataFill = d3.area()
          .x(function(d) { return x(d.date); })
          .y0(height)
          .y1(function(d) { return y(d.value); });

        // set min and max values of data
        x.domain(d3.extent(data, function(d) {
          return d.date;
        }));
        y.domain([0, d3.max(data, function(d) {
          return d.value;
        })]);

        // create filled area
        svg.append('path')
          .datum(data)
          .attr('class', 'datafill')
          .attr('d', dataFill);

        // add valueline path to graph
        svg.append('path')
          .data([data])
          .attr('class', 'line')
          .attr('d', valueline);

        svg.selectAll('rect')
          .data(data)
          .enter().append('rect')
          .attr('width', width / data.length)
          .attr('height', height)
          .attr('x', function(d) {
            return x(d.date) - (width / data.length / 2);
          })
          .attr('y', 0)
          .attr('class', 'tooltip-target')
        // add x-axis labels
        svg.append('g')
          .attr('class', 'axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(d3.axisBottom(x));

        // add y-axis labels
        svg.append('g')
          .attr('class', 'axis')
          .attr('transform', 'translate(0,' + '0' + ')')
          .call(d3.axisLeft(y));
      };

      var renderSentiment = function(data, index) {
        //Remove any old svg in the sentiment div
        if(index === '0') {
          d3.selectAll('.sentiment').selectAll('svg')
            .filter(function(d, i) {
              return i > 0;
            }).remove();
        }

        var chartWidth = 300;
        var barHeight = 80;
        var groupHeight = barHeight * data.length;
        var gapBetweenGroups = 10;
        var spaceForLabels = 0; // no label to the left
        var spaceForLegend = 150;

        // Zip the series data together (first values, second values, etc.)
        var zippedData = [];

        var sum = 0;

        var sortSentiment = function (data) {
          var sorted = [{value: 'Positive'}, {value: 'Neutral'}, {value: 'Negative'}];
          
          for (var i = 0; i < data.length; i++) {
            var current = data[i];
            if (current.value === 'positive') {
              sorted[0].count = current.count;
            } else if (current.value === 'neutral') {
              sorted[1].count = current.count;
            } else if (current.value === 'negative') {
              sorted[2].count = current.count;
            }
            
          }

          for (var i = 0; i < sorted.length; i++) {
            sorted[i].count = sorted[i].count || 1;
            sum += sorted[i].count;
          }
          return sorted;
        };

        data = sortSentiment(data);

        for (var i = 0; i < data.length; i++) {
          zippedData.push(data[i].count / sum);
        }
        // Color scale

        var color = d3.scaleOrdinal()
        .range(['#70C1B3', '#FFE066', '#F25F5C']);
        var chartHeight = barHeight * zippedData.length + gapBetweenGroups;

        var x = d3.scaleLinear()
          .domain([0, d3.max(zippedData)])
          .range([0, chartWidth]);

        var y = d3.scaleLinear()
          .range([chartHeight + gapBetweenGroups, 0]);

        var yAxis = d3.axisLeft(y);

        // Specify the chart area and dimensions
        var chart = d3.selectAll('.sentiment')
          .filter(function(d, i) {
            return i === +index;
          })
          .append('svg')
          .attr('viewBox', '0 0 ' + (spaceForLabels + chartWidth + spaceForLegend) + ' ' + chartHeight);

        // Create bars
        var bar = chart.selectAll('g')
          .data(zippedData)
          .enter().append('g')
          .attr('transform', function(d, i) {
            return 'translate(' + spaceForLabels + ',' + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i / data.length))) + ')';
          });

        // Create rectangles of the correct width
        bar.append('rect')
          .attr('fill', function(d, i) {
            return color(i % data.length);
          })
          .attr('class', 'bar')
          .attr('width', x)
          .attr('height', barHeight - 1);

        // Add text label in bar
        bar.append('text')
          .attr('x', function(d) {
            return x(d) - 10;
          })
          .attr('y', barHeight / 2)
          .attr('fill', 'white')
          .attr('dy', '.35em')
          .text(function(d) {
            return Math.floor(d * 100) + '%';
          });

        chart.append('g')
          .attr('class', 'y axis')
          .attr('transform', 'translate(' + spaceForLabels + ', ' + -gapBetweenGroups / 2 + ')')
          .call(yAxis);

        // Draw legend
        var legendRectSize = barHeight / 3;
        var legendSpacing = 8;

        var legend = chart.selectAll('.legend')
          .data(data)
          .enter()
          .append('g')
          .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = -gapBetweenGroups / 2;
            var horz = spaceForLabels + chartWidth + 40 - legendRectSize;
            var vert = i * height - offset + groupHeight / 3;
            return 'translate(' + horz + ',' + vert + ')';
          });

        legend.append('rect')
          .attr('width', legendRectSize)
          .attr('height', legendRectSize)
          .style('fill', function(d, i) {
            return color(i);
          })
          .style('stroke', function(d, i) {
            return color(i);
          });

        legend.append('text')
          .attr('class', 'legend')
          .attr('x', legendRectSize + legendSpacing)
          .attr('y', legendRectSize - legendSpacing)
          .text(function(d) {
            return d.value;
          });
      };

      var renderCloud = function(words, index) {
        var size = {width: 300, height: 180};
        //Remove any old svg in the renderCloud div
        if(index === '0') {
          d3.selectAll('.wordCloud').selectAll('svg')
            .filter(function(d, i) {
              return i > 0;
            }).remove();
        }  

        var total = words.reduce(function(accum, item) {
          return accum + item.count;
        }, 0);

        var color = d3.scaleLinear()
          .domain([0, 1, 2, 3, 4, 5, 6, 10, 15, 20, 100])
          .range(['#222', '#333', '#444', '#555', '#666', '#777', '#888', '#999', '#aaa', '#bbb', '#ccc', '#ddd']);

        words = words.map(function(d) {
          return {text: d.value, size: (total / d.count) / 1.4};
        });

        var svg = d3.selectAll('.wordCloud')
          .filter(function(d, i) {
            return i === +index;
          })
          .append('svg')
          // .attr('width', size.width)
          // .attr('height', size.height)
          .attr('viewBox', '0 0 ' + size.width + ' ' + size.height)
          .append('g')
          .attr('transform', 'translate(' + size.width / 2 + ',' + size.height / 2 + ')');

        var drawCloud = function(words) {
          var cloud = svg.selectAll('g text')
            .data(words, function(d) { return d.text; });

          cloud.enter()
            .append('text')
            .attr('text-anchor', 'middle')
            .text(function(d) { return d.text; })
            .style('font-size', function(d) { return d.size + 'px'; })
            .style("fill", function(d, i) { return color(i); })
            .attr('transform', function(d) {
              return 'translate(' + [d.x, d.y] + ')';
            });
        };

        d3.layout.cloud().size([size.width, size.height])
          .words(words)
          .rotate(0)
          .fontSize(function(d) { return d.size; })
          .on('end', drawCloud)
          .start();
      };


      /////////////above are render functions

      attr.$observe('index', function(index) {
        renderSources(scope.dummy.sources, index);
        renderGraph(scope.dummy.timeline, index);
        renderSentiment(scope.dummy.sentiment, index);
        renderCloud(scope.dummy.keywords, index);

      });


    }
  };
})

// Home Controller
.controller('HomeCtrl', function($scope, getFrontPage, $rootScope) {
  $scope.test = 'Home View';
  $scope.rowshow = {};

  //Calls the renderView function with the given topic.
  //We needed to pull the searchCtrl's renderView to $rootScope and also let it accept a parameter
  $scope.rendView = function (topic) {
    $rootScope.renderView(topic);
  }
  $scope.clickRow = function(index) {
    if($scope.rowshow[index] === undefined) {
      $scope.rowshow[index] = false;
    }
    $scope.rowshow[index] = !$scope.rowshow[index];
  }
  //getFrontPage is from the resolve of loading this template and homectrl
  $scope.front = getFrontPage;

  $scope.addnewSearch = function(data) {

    data['traffic'] = " ";
    $scope.rowshow = {};
    $scope.front.unshift(data);


  };

  $rootScope.addnewSearch = $scope.addnewSearch;


});
