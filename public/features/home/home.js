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
            // .attr("width", width)
            // .attr("height", height)
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

        data = dataObj.timeSeries;
        //clear out contents of graph prior to rendering, to prevent stacking graphs
        // using 'window' is necessary here due to lexical scope.
        // if (window.graph.innerHTML !== undefined) {
        //   window.graph.innerHTML = '';
        // }

        // set graph dimensions and margins
        var margin = { top: 0, right: 50, bottom: 50, left: 50 };

        // fixed size graph. These values are shorter than true innerWidth / innerHeight:
        var graph = document.getElementById('graph1');
        var width = 1200;
        var height = 200;
        // var width = window.innerWidth - margin.left - margin.right;
        // var height = window.innerHeight * 0.5 - margin.top - margin.bottom;

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
          // .classed('svg-container', true) //container class to make it responsive
          .append('svg')
          // responsive SVG needs these two attr's and an absence of height and width attr's
          // .attr('preserveAspectRatio', 'xMinYMin meet') // preserves aspect ratio by 'fitting' the viewbox to the viewport, rather than filling
          // .attr('viewBox', '0 0 ' + (window.innerWidth) + ' ' + (window.innerHeight))
          .attr('viewBox', '0 0 ' + (width+200) + ' ' + (height + 40))
          // append group element
          .append('g')
          // center group element on page by subtracting viewbox length from viewport length, halving, and spacing that many pixels
          .attr('transform', 'translate(40, 0)');
          // .classed("svg-content-responsive", true);

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
          // .on('mouseover', function(d) {
          //   d3.select(this)
          //     .classed('tooltip-target-on', true);
          //   div.transition()
          //     .duration(100)
          //     .style('opacity', 0.75);
          //   div.html(
          //       '<span class="tooltip-date">' + moment(d.date).format("MM/DD/YYYY") + '<br/>' + '<span class="tooltip-value">' + d.value + ' articles'
          //     )
          //     .style('left', (d3.event.pageX) + 'px')
          //     .style('top', (d3.event.pageY - 28) + 'px');
          // })
          // .on('mouseout', function(d) {
          //   d3.select(this)
          //     .classed('tooltip-target-on', false);
          //   div.transition()
          //     .duration(250)
          //     .style('opacity', 0);
          // });

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
        var chartWidth = 300;
        var barHeight = 50;
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
            } else {
              if (current.value === 'neutral') {
                sorted[1].count = current.count;
              } else {
                sorted[2].count = current.count;
              }
            }
            sum += current.count;
          }
          return sorted;
        };

        data = sortSentiment(data);

        for (var i = 0; i < data.length; i++) {
          zippedData.push(data[i].count / sum);
        }

        // Color scale

        // var color = d3.scaleOrdinal(d3.schemeCategory20);
        var color = d3.scaleOrdinal()
        .range(['#70C1B3', '#FFE066', '#F25F5C']);
        // var color = d3.scale.category20(); // v3
        var chartHeight = barHeight * zippedData.length + gapBetweenGroups;

        var x = d3.scaleLinear()
          .domain([0, d3.max(zippedData)])
          .range([0, chartWidth]);

        var y = d3.scaleLinear()
          .range([chartHeight + gapBetweenGroups, 0]);

        var yAxis = d3.axisLeft(y);

          // .scale(y) // v3
          // .tickFormat('')
          // .tickSize(0)
          // .orient('left');

        // Specify the chart area and dimensions
        var chart = d3.selectAll('.sentiment')
          .filter(function(d, i) {
            return i === +index;
          })
          .append('svg')
          // .attr('width', spaceForLabels + chartWidth + spaceForLegend)
          // .attr('height', chartHeight);
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

        // Draw labels
        // bar.append('text')
        //   .attr('class', 'label')
        //   .attr('x', function(d) {
        //     return -10;
        //   })
        //   .attr('y', groupHeight / 2)
        //   .attr('dy', '.35em')
        //   .text(function(d, i) {
        //     if (i % data.length === 0) {
        //       return 'Sentiments';
        //     } else {
        //       return '';
        //     }
        //   });

        // chart.append('g')
        //   .attr('class', 'y axis')
        //   .attr('transform', 'translate(' + spaceForLabels + ', ' + -gapBetweenGroups / 2 + ')')
        //   .call(yAxis);

        // Draw legend
        var legendRectSize = barHeight / 3;
        var legendSpacing = 4;

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

      var renderCloud = function(words, index, size) {
        size = size || {width: 960, height: 500};

        var total = words.reduce(function(accum, item) {
      
          return accum + item.count;
        }, 0);

        var color = $window.d3.scaleLinear()
          .domain([0,1,2,3,4,5,6,10,15,20,100])
          .range(["#222", "#333", "#444", "#555", "#666", "#777", "#888", "#999", "#aaa", "#bbb", "#ccc", "#ddd"]);
          
        d3.layout.cloud().size([size.width - 100, size.height - 100]) // was 800x300
          .words(words)
          .rotate(0)
          .fontSize(function(d) { return total / d.count; })
          .on("end", draw)
          .start();

        function draw(words) {
          d3.selectAll(".wordCloud")
          .filter(function(d, i) {
            return i === +index;
          })

          .append("svg")
            // .attr("width", size.width /2) // was 850
            // .attr("height", size.height /2) // was 350
            .attr('viewBox', '0 0 ' + (size.width/2) + ' ' + (size.height/2))

            .attr("class", "wordcloud")
            .append("g")
            // without the transform, words words would get cutoff to the left and top, they would
            // appear outside of the SVG area
            .attr("transform", "translate(" + size.width/4 + "," + size.height/4 + ")")   // scale this?
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return total / d.count + "px"; })
            .style("fill", function(d, i) { return color(i); })
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.value; });
        }
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
  // d3.select('.sources').remove();

  //Calls the renderView function with the given topic.
  //We needed to pull the searchCtrl's renderView to $rootScope and also let it accept a parameter
  $scope.rendView = function (topic) {
    $rootScope.renderView(topic);
  }
  //getFrontPage is from the resolve of loading this template and homectrl
  $scope.front = getFrontPage;
  $scope.dummies = [
    {
  "topic": "anything",
  "img": 'http://www.goodlightscraps.com/content/good-day/good-day-7.jpg',
  "traffic": 'tons of hits!',
  "timeline": {
    "timeSeries": [
      {
        "publishedAt": "2016-03-24T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-03-25T19:00:52.626Z",
        "count": 10
      },
      {
        "publishedAt": "2016-03-26T19:00:52.626Z",
        "count": 8
      },
      {
        "publishedAt": "2016-03-27T19:00:52.626Z",
        "count": 9
      },
      {
        "publishedAt": "2016-03-28T19:00:52.626Z",
        "count": 8
      },
      {
        "publishedAt": "2016-03-29T19:00:52.626Z",
        "count": 9
      },
      {
        "publishedAt": "2016-03-30T19:00:52.626Z",
        "count": 9
      },
      {
        "publishedAt": "2016-03-31T19:00:52.626Z",
        "count": 11
      },
      {
        "publishedAt": "2016-04-01T19:00:52.626Z",
        "count": 2
      },
      {
        "publishedAt": "2016-04-02T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-04-03T19:00:52.626Z",
        "count": 13
      },
      {
        "publishedAt": "2016-04-04T19:00:52.626Z",
        "count": 11
      },
      {
        "publishedAt": "2016-04-05T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-04-06T19:00:52.626Z",
        "count": 12
      },
      {
        "publishedAt": "2016-04-07T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-04-08T19:00:52.626Z",
        "count": 12
      },
      {
        "publishedAt": "2016-04-09T19:00:52.626Z",
        "count": 4
      },
      {
        "publishedAt": "2016-04-10T19:00:52.626Z",
        "count": 10
      },
      {
        "publishedAt": "2016-04-11T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-04-12T19:00:52.626Z",
        "count": 17
      },
      {
        "publishedAt": "2016-04-13T19:00:52.626Z",
        "count": 14
      },
      {
        "publishedAt": "2016-04-14T19:00:52.626Z",
        "count": 17
      },
      {
        "publishedAt": "2016-04-15T19:00:52.626Z",
        "count": 11
      },
      {
        "publishedAt": "2016-04-16T19:00:52.626Z",
        "count": 2
      },
      {
        "publishedAt": "2016-04-17T19:00:52.626Z",
        "count": 6
      },
      {
        "publishedAt": "2016-04-18T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-04-19T19:00:52.626Z",
        "count": 17
      },
      {
        "publishedAt": "2016-04-20T19:00:52.626Z",
        "count": 17
      },
      {
        "publishedAt": "2016-04-21T19:00:52.626Z",
        "count": 14
      },
      {
        "publishedAt": "2016-04-22T19:00:52.626Z",
        "count": 10
      },
      {
        "publishedAt": "2016-04-23T19:00:52.626Z",
        "count": 4
      },
      {
        "publishedAt": "2016-04-24T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-04-25T19:00:52.626Z",
        "count": 16
      },
      {
        "publishedAt": "2016-04-26T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-04-27T19:00:52.626Z",
        "count": 13
      },
      {
        "publishedAt": "2016-04-28T19:00:52.626Z",
        "count": 11
      },
      {
        "publishedAt": "2016-04-29T19:00:52.626Z",
        "count": 2
      },
      {
        "publishedAt": "2016-04-30T19:00:52.626Z",
        "count": 11
      },
      {
        "publishedAt": "2016-05-01T19:00:52.626Z",
        "count": 9
      },
      {
        "publishedAt": "2016-05-02T19:00:52.626Z",
        "count": 19
      },
      {
        "publishedAt": "2016-05-03T19:00:52.626Z",
        "count": 11
      },
      {
        "publishedAt": "2016-05-04T19:00:52.626Z",
        "count": 11
      },
      {
        "publishedAt": "2016-05-05T19:00:52.626Z",
        "count": 19
      },
      {
        "publishedAt": "2016-05-06T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-05-07T19:00:52.626Z",
        "count": 9
      },
      {
        "publishedAt": "2016-05-08T19:00:52.626Z",
        "count": 14
      },
      {
        "publishedAt": "2016-05-09T19:00:52.626Z",
        "count": 23
      },
      {
        "publishedAt": "2016-05-10T19:00:52.626Z",
        "count": 16
      },
      {
        "publishedAt": "2016-05-11T19:00:52.626Z",
        "count": 16
      },
      {
        "publishedAt": "2016-05-12T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-05-13T19:00:52.626Z",
        "count": 13
      },
      {
        "publishedAt": "2016-05-14T19:00:52.626Z",
        "count": 12
      },
      {
        "publishedAt": "2016-05-15T19:00:52.626Z",
        "count": 12
      },
      {
        "publishedAt": "2016-05-16T19:00:52.626Z",
        "count": 7
      },
      {
        "publishedAt": "2016-05-17T19:00:52.626Z",
        "count": 14
      },
      {
        "publishedAt": "2016-05-18T19:00:52.626Z",
        "count": 19
      },
      {
        "publishedAt": "2016-05-19T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-05-20T19:00:52.626Z",
        "count": 7
      },
      {
        "publishedAt": "2016-05-21T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-05-22T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-05-23T19:00:52.626Z",
        "count": 22
      },
      {
        "publishedAt": "2016-05-24T19:00:52.626Z",
        "count": 13
      },
      {
        "publishedAt": "2016-05-25T19:00:52.626Z",
        "count": 13
      },
      {
        "publishedAt": "2016-05-26T19:00:52.626Z",
        "count": 7
      },
      {
        "publishedAt": "2016-05-27T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-05-28T19:00:52.626Z",
        "count": 6
      },
      {
        "publishedAt": "2016-05-29T19:00:52.626Z",
        "count": 11
      },
      {
        "publishedAt": "2016-05-30T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-05-31T19:00:52.626Z",
        "count": 17
      },
      {
        "publishedAt": "2016-06-01T19:00:52.626Z",
        "count": 11
      },
      {
        "publishedAt": "2016-06-02T19:00:52.626Z",
        "count": 21
      },
      {
        "publishedAt": "2016-06-03T19:00:52.626Z",
        "count": 7
      },
      {
        "publishedAt": "2016-06-04T19:00:52.626Z",
        "count": 7
      },
      {
        "publishedAt": "2016-06-05T19:00:52.626Z",
        "count": 11
      },
      {
        "publishedAt": "2016-06-06T19:00:52.626Z",
        "count": 17
      },
      {
        "publishedAt": "2016-06-07T19:00:52.626Z",
        "count": 24
      },
      {
        "publishedAt": "2016-06-08T19:00:52.626Z",
        "count": 12
      },
      {
        "publishedAt": "2016-06-09T19:00:52.626Z",
        "count": 12
      },
      {
        "publishedAt": "2016-06-10T19:00:52.626Z",
        "count": 11
      },
      {
        "publishedAt": "2016-06-11T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-06-12T19:00:52.626Z",
        "count": 16
      },
      {
        "publishedAt": "2016-06-13T19:00:52.626Z",
        "count": 21
      },
      {
        "publishedAt": "2016-06-14T19:00:52.626Z",
        "count": 12
      },
      {
        "publishedAt": "2016-06-15T19:00:52.626Z",
        "count": 14
      },
      {
        "publishedAt": "2016-06-16T19:00:52.626Z",
        "count": 17
      },
      {
        "publishedAt": "2016-06-17T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-06-18T19:00:52.626Z",
        "count": 8
      },
      {
        "publishedAt": "2016-06-19T19:00:52.626Z",
        "count": 9
      },
      {
        "publishedAt": "2016-06-20T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-06-21T19:00:52.626Z",
        "count": 13
      },
      {
        "publishedAt": "2016-06-22T19:00:52.626Z",
        "count": 17
      },
      {
        "publishedAt": "2016-06-23T19:00:52.626Z",
        "count": 12
      },
      {
        "publishedAt": "2016-06-24T19:00:52.626Z",
        "count": 6
      },
      {
        "publishedAt": "2016-06-25T19:00:52.626Z",
        "count": 7
      },
      {
        "publishedAt": "2016-06-26T19:00:52.626Z",
        "count": 6
      },
      {
        "publishedAt": "2016-06-27T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-06-28T19:00:52.626Z",
        "count": 8
      },
      {
        "publishedAt": "2016-06-29T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-06-30T19:00:52.626Z",
        "count": 9
      },
      {
        "publishedAt": "2016-07-01T19:00:52.626Z",
        "count": 4
      },
      {
        "publishedAt": "2016-07-02T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-07-03T19:00:52.626Z",
        "count": 8
      },
      {
        "publishedAt": "2016-07-04T19:00:52.626Z",
        "count": 13
      },
      {
        "publishedAt": "2016-07-05T19:00:52.626Z",
        "count": 10
      },
      {
        "publishedAt": "2016-07-06T19:00:52.626Z",
        "count": 11
      },
      {
        "publishedAt": "2016-07-07T19:00:52.626Z",
        "count": 18
      },
      {
        "publishedAt": "2016-07-08T19:00:52.626Z",
        "count": 3
      },
      {
        "publishedAt": "2016-07-09T19:00:52.626Z",
        "count": 7
      },
      {
        "publishedAt": "2016-07-10T19:00:52.626Z",
        "count": 10
      },
      {
        "publishedAt": "2016-07-11T19:00:52.626Z",
        "count": 13
      },
      {
        "publishedAt": "2016-07-12T19:00:52.626Z",
        "count": 6
      },
      {
        "publishedAt": "2016-07-13T19:00:52.626Z",
        "count": 12
      },
      {
        "publishedAt": "2016-07-14T19:00:52.626Z",
        "count": 10
      },
      {
        "publishedAt": "2016-07-15T19:00:52.626Z",
        "count": 9
      },
      {
        "publishedAt": "2016-07-16T19:00:52.626Z",
        "count": 6
      },
      {
        "publishedAt": "2016-07-17T19:00:52.626Z",
        "count": 7
      },
      {
        "publishedAt": "2016-07-18T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-07-19T19:00:52.626Z",
        "count": 17
      },
      {
        "publishedAt": "2016-07-20T19:00:52.626Z",
        "count": 10
      },
      {
        "publishedAt": "2016-07-21T19:00:52.626Z",
        "count": 13
      },
      {
        "publishedAt": "2016-07-22T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-07-23T19:00:52.626Z",
        "count": 3
      },
      {
        "publishedAt": "2016-07-24T19:00:52.626Z",
        "count": 14
      },
      {
        "publishedAt": "2016-07-25T19:00:52.626Z",
        "count": 20
      },
      {
        "publishedAt": "2016-07-26T19:00:52.626Z",
        "count": 35
      },
      {
        "publishedAt": "2016-07-27T19:00:52.626Z",
        "count": 36
      },
      {
        "publishedAt": "2016-07-28T19:00:52.626Z",
        "count": 10
      },
      {
        "publishedAt": "2016-07-29T19:00:52.626Z",
        "count": 8
      },
      {
        "publishedAt": "2016-07-30T19:00:52.626Z",
        "count": 8
      },
      {
        "publishedAt": "2016-07-31T19:00:52.626Z",
        "count": 22
      },
      {
        "publishedAt": "2016-08-01T19:00:52.626Z",
        "count": 19
      },
      {
        "publishedAt": "2016-08-02T19:00:52.626Z",
        "count": 14
      },
      {
        "publishedAt": "2016-08-03T19:00:52.626Z",
        "count": 6
      },
      {
        "publishedAt": "2016-08-04T19:00:52.626Z",
        "count": 9
      },
      {
        "publishedAt": "2016-08-05T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-08-06T19:00:52.626Z",
        "count": 3
      },
      {
        "publishedAt": "2016-08-07T19:00:52.626Z",
        "count": 13
      },
      {
        "publishedAt": "2016-08-08T19:00:52.626Z",
        "count": 10
      },
      {
        "publishedAt": "2016-08-09T19:00:52.626Z",
        "count": 13
      },
      {
        "publishedAt": "2016-08-10T19:00:52.626Z",
        "count": 19
      },
      {
        "publishedAt": "2016-08-11T19:00:52.626Z",
        "count": 19
      },
      {
        "publishedAt": "2016-08-12T19:00:52.626Z",
        "count": 4
      },
      {
        "publishedAt": "2016-08-13T19:00:52.626Z",
        "count": 6
      },
      {
        "publishedAt": "2016-08-14T19:00:52.626Z",
        "count": 13
      },
      {
        "publishedAt": "2016-08-15T19:00:52.626Z",
        "count": 20
      },
      {
        "publishedAt": "2016-08-16T19:00:52.626Z",
        "count": 18
      },
      {
        "publishedAt": "2016-08-17T19:00:52.626Z",
        "count": 14
      },
      {
        "publishedAt": "2016-08-18T19:00:52.626Z",
        "count": 16
      },
      {
        "publishedAt": "2016-08-19T19:00:52.626Z",
        "count": 8
      },
      {
        "publishedAt": "2016-08-20T19:00:52.626Z",
        "count": 7
      },
      {
        "publishedAt": "2016-08-21T19:00:52.626Z",
        "count": 10
      },
      {
        "publishedAt": "2016-08-22T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-08-23T19:00:52.626Z",
        "count": 22
      },
      {
        "publishedAt": "2016-08-24T19:00:52.626Z",
        "count": 18
      },
      {
        "publishedAt": "2016-08-25T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-08-26T19:00:52.626Z",
        "count": 2
      },
      {
        "publishedAt": "2016-08-27T19:00:52.626Z",
        "count": 7
      },
      {
        "publishedAt": "2016-08-28T19:00:52.626Z",
        "count": 9
      },
      {
        "publishedAt": "2016-08-29T19:00:52.626Z",
        "count": 22
      },
      {
        "publishedAt": "2016-08-30T19:00:52.626Z",
        "count": 6
      },
      {
        "publishedAt": "2016-08-31T19:00:52.626Z",
        "count": 20
      },
      {
        "publishedAt": "2016-09-01T19:00:52.626Z",
        "count": 19
      },
      {
        "publishedAt": "2016-09-02T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-09-03T19:00:52.626Z",
        "count": 7
      },
      {
        "publishedAt": "2016-09-04T19:00:52.626Z",
        "count": 5
      },
      {
        "publishedAt": "2016-09-05T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-09-06T19:00:52.626Z",
        "count": 17
      },
      {
        "publishedAt": "2016-09-07T19:00:52.626Z",
        "count": 10
      },
      {
        "publishedAt": "2016-09-08T19:00:52.626Z",
        "count": 8
      },
      {
        "publishedAt": "2016-09-09T19:00:52.626Z",
        "count": 7
      },
      {
        "publishedAt": "2016-09-10T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-09-11T19:00:52.626Z",
        "count": 15
      },
      {
        "publishedAt": "2016-09-12T19:00:52.626Z",
        "count": 9
      },
      {
        "publishedAt": "2016-09-13T19:00:52.626Z",
        "count": 8
      },
      {
        "publishedAt": "2016-09-14T19:00:52.626Z",
        "count": 16
      }
    ],
    "period": "+1DAY",
    "publishedAtStart": "2016-03-24T19:00:52.626Z",
    "publishedAtEnd": "2016-09-15T19:00:52.626Z"
  },
  "sources": [
    {
      "value": "Business Insider",
      "count": 88
    },
    {
      "value": "Huffington Post",
      "count": 80
    },
    {
      "value": "Washington Post",
      "count": 38
    },
    {
      "value": "Inquisitr",
      "count": 30
    },
    {
      "value": "USA Today",
      "count": 29
    },
    {
      "value": "Forbes",
      "count": 24
    },
    {
      "value": "News Vine",
      "count": 24
    },
    {
      "value": "Fox News",
      "count": 18
    },
    {
      "value": "Real Clear Politics",
      "count": 18
    },
    {
      "value": "Examiner",
      "count": 18
    }
  ],
  "keywords": [
    {
      "value": "people",
      "count": 381
    },
    {
      "value": "time",
      "count": 282
    },
    {
      "value": "Trump",
      "count": 281
    },
    {
      "value": "Donald Trump",
      "count": 275
    },
    {
      "value": "years",
      "count": 212
    },
    {
      "value": "Hillary Clinton",
      "count": 187
    },
    {
      "value": "Republican",
      "count": 176
    },
    {
      "value": "Clinton",
      "count": 154
    },
    {
      "value": "Twitter",
      "count": 147
    },
    {
      "value": "year",
      "count": 144
    },
    {
      "value": "Donald",
      "count": 143
    },
    {
      "value": "Facebook",
      "count": 136
    },
    {
      "value": "United States",
      "count": 134
    },
    {
      "value": "Democratic",
      "count": 116
    },
    {
      "value": "life",
      "count": 110
    },
    {
      "value": "Hillary",
      "count": 103
    },
    {
      "value": "campaign",
      "count": 101
    },
    {
      "value": "good",
      "count": 101
    },
    {
      "value": "New York",
      "count": 100
    },
    {
      "value": "News",
      "count": 100
    }
  ],
  "sentiment": [
    {
      "value": "positive",
      "count": 1026
    },
    {
      "value": "negative",
      "count": 731
    },
    {
      "value": "neutral",
      "count": 297
    }
  ]
},
{ "topic": "face",
  "img": 'http://www.goodlightscraps.com/content/good-day/good-day-7.jpg',
  "traffic": 'tons of hits!',
  "timeline": {
    "timeSeries": [
      {
        "publishedAt": "2016-03-24T19:49:55.553Z",
        "count": 182
      },
      {
        "publishedAt": "2016-03-25T19:49:55.553Z",
        "count": 159
      },
      {
        "publishedAt": "2016-03-26T19:49:55.553Z",
        "count": 100
      },
      {
        "publishedAt": "2016-03-27T19:49:55.553Z",
        "count": 214
      },
      {
        "publishedAt": "2016-03-28T19:49:55.553Z",
        "count": 246
      },
      {
        "publishedAt": "2016-03-29T19:49:55.553Z",
        "count": 312
      },
      {
        "publishedAt": "2016-03-30T19:49:55.553Z",
        "count": 315
      },
      {
        "publishedAt": "2016-03-31T19:49:55.553Z",
        "count": 278
      },
      {
        "publishedAt": "2016-04-01T19:49:55.553Z",
        "count": 136
      },
      {
        "publishedAt": "2016-04-02T19:49:55.553Z",
        "count": 104
      },
      {
        "publishedAt": "2016-04-03T19:49:55.553Z",
        "count": 234
      },
      {
        "publishedAt": "2016-04-04T19:49:55.553Z",
        "count": 344
      },
      {
        "publishedAt": "2016-04-05T19:49:55.553Z",
        "count": 291
      },
      {
        "publishedAt": "2016-04-06T19:49:55.553Z",
        "count": 256
      },
      {
        "publishedAt": "2016-04-07T19:49:55.553Z",
        "count": 259
      },
      {
        "publishedAt": "2016-04-08T19:49:55.553Z",
        "count": 171
      },
      {
        "publishedAt": "2016-04-09T19:49:55.553Z",
        "count": 150
      },
      {
        "publishedAt": "2016-04-10T19:49:55.553Z",
        "count": 280
      },
      {
        "publishedAt": "2016-04-11T19:49:55.553Z",
        "count": 351
      },
      {
        "publishedAt": "2016-04-12T19:49:55.553Z",
        "count": 319
      },
      {
        "publishedAt": "2016-04-13T19:49:55.553Z",
        "count": 342
      },
      {
        "publishedAt": "2016-04-14T19:49:55.553Z",
        "count": 296
      },
      {
        "publishedAt": "2016-04-15T19:49:55.553Z",
        "count": 129
      },
      {
        "publishedAt": "2016-04-16T19:49:55.553Z",
        "count": 134
      },
      {
        "publishedAt": "2016-04-17T19:49:55.553Z",
        "count": 217
      },
      {
        "publishedAt": "2016-04-18T19:49:55.553Z",
        "count": 285
      },
      {
        "publishedAt": "2016-04-19T19:49:55.553Z",
        "count": 302
      },
      {
        "publishedAt": "2016-04-20T19:49:55.553Z",
        "count": 327
      },
      {
        "publishedAt": "2016-04-21T19:49:55.553Z",
        "count": 279
      },
      {
        "publishedAt": "2016-04-22T19:49:55.553Z",
        "count": 143
      },
      {
        "publishedAt": "2016-04-23T19:49:55.553Z",
        "count": 127
      },
      {
        "publishedAt": "2016-04-24T19:49:55.553Z",
        "count": 236
      },
      {
        "publishedAt": "2016-04-25T19:49:55.553Z",
        "count": 249
      },
      {
        "publishedAt": "2016-04-26T19:49:55.553Z",
        "count": 285
      },
      {
        "publishedAt": "2016-04-27T19:49:55.553Z",
        "count": 293
      },
      {
        "publishedAt": "2016-04-28T19:49:55.553Z",
        "count": 269
      },
      {
        "publishedAt": "2016-04-29T19:49:55.553Z",
        "count": 154
      },
      {
        "publishedAt": "2016-04-30T19:49:55.553Z",
        "count": 131
      },
      {
        "publishedAt": "2016-05-01T19:49:55.553Z",
        "count": 209
      },
      {
        "publishedAt": "2016-05-02T19:49:55.553Z",
        "count": 263
      },
      {
        "publishedAt": "2016-05-03T19:49:55.553Z",
        "count": 368
      },
      {
        "publishedAt": "2016-05-04T19:49:55.553Z",
        "count": 260
      },
      {
        "publishedAt": "2016-05-05T19:49:55.553Z",
        "count": 316
      },
      {
        "publishedAt": "2016-05-06T19:49:55.553Z",
        "count": 182
      },
      {
        "publishedAt": "2016-05-07T19:49:55.553Z",
        "count": 136
      },
      {
        "publishedAt": "2016-05-08T19:49:55.553Z",
        "count": 310
      },
      {
        "publishedAt": "2016-05-09T19:49:55.553Z",
        "count": 286
      },
      {
        "publishedAt": "2016-05-10T19:49:55.553Z",
        "count": 320
      },
      {
        "publishedAt": "2016-05-11T19:49:55.553Z",
        "count": 321
      },
      {
        "publishedAt": "2016-05-12T19:49:55.553Z",
        "count": 241
      },
      {
        "publishedAt": "2016-05-13T19:49:55.553Z",
        "count": 112
      },
      {
        "publishedAt": "2016-05-14T19:49:55.553Z",
        "count": 150
      },
      {
        "publishedAt": "2016-05-15T19:49:55.553Z",
        "count": 238
      },
      {
        "publishedAt": "2016-05-16T19:49:55.553Z",
        "count": 312
      },
      {
        "publishedAt": "2016-05-17T19:49:55.553Z",
        "count": 301
      },
      {
        "publishedAt": "2016-05-18T19:49:55.553Z",
        "count": 304
      },
      {
        "publishedAt": "2016-05-19T19:49:55.553Z",
        "count": 254
      },
      {
        "publishedAt": "2016-05-20T19:49:55.553Z",
        "count": 144
      },
      {
        "publishedAt": "2016-05-21T19:49:55.553Z",
        "count": 115
      },
      {
        "publishedAt": "2016-05-22T19:49:55.553Z",
        "count": 198
      },
      {
        "publishedAt": "2016-05-23T19:49:55.553Z",
        "count": 243
      },
      {
        "publishedAt": "2016-05-24T19:49:55.553Z",
        "count": 299
      },
      {
        "publishedAt": "2016-05-25T19:49:55.553Z",
        "count": 289
      },
      {
        "publishedAt": "2016-05-26T19:49:55.553Z",
        "count": 248
      },
      {
        "publishedAt": "2016-05-27T19:49:55.553Z",
        "count": 127
      },
      {
        "publishedAt": "2016-05-28T19:49:55.553Z",
        "count": 138
      },
      {
        "publishedAt": "2016-05-29T19:49:55.553Z",
        "count": 176
      },
      {
        "publishedAt": "2016-05-30T19:49:55.553Z",
        "count": 245
      },
      {
        "publishedAt": "2016-05-31T19:49:55.553Z",
        "count": 278
      },
      {
        "publishedAt": "2016-06-01T19:49:55.553Z",
        "count": 297
      },
      {
        "publishedAt": "2016-06-02T19:49:55.553Z",
        "count": 254
      },
      {
        "publishedAt": "2016-06-03T19:49:55.553Z",
        "count": 112
      },
      {
        "publishedAt": "2016-06-04T19:49:55.553Z",
        "count": 118
      },
      {
        "publishedAt": "2016-06-05T19:49:55.553Z",
        "count": 230
      },
      {
        "publishedAt": "2016-06-06T19:49:55.553Z",
        "count": 332
      },
      {
        "publishedAt": "2016-06-07T19:49:55.553Z",
        "count": 311
      },
      {
        "publishedAt": "2016-06-08T19:49:55.553Z",
        "count": 303
      },
      {
        "publishedAt": "2016-06-09T19:49:55.553Z",
        "count": 224
      },
      {
        "publishedAt": "2016-06-10T19:49:55.553Z",
        "count": 124
      },
      {
        "publishedAt": "2016-06-11T19:49:55.553Z",
        "count": 142
      },
      {
        "publishedAt": "2016-06-12T19:49:55.553Z",
        "count": 190
      },
      {
        "publishedAt": "2016-06-13T19:49:55.553Z",
        "count": 256
      },
      {
        "publishedAt": "2016-06-14T19:49:55.553Z",
        "count": 316
      },
      {
        "publishedAt": "2016-06-15T19:49:55.553Z",
        "count": 300
      },
      {
        "publishedAt": "2016-06-16T19:49:55.553Z",
        "count": 271
      },
      {
        "publishedAt": "2016-06-17T19:49:55.553Z",
        "count": 141
      },
      {
        "publishedAt": "2016-06-18T19:49:55.553Z",
        "count": 118
      },
      {
        "publishedAt": "2016-06-19T19:49:55.553Z",
        "count": 230
      },
      {
        "publishedAt": "2016-06-20T19:49:55.553Z",
        "count": 296
      },
      {
        "publishedAt": "2016-06-21T19:49:55.553Z",
        "count": 289
      },
      {
        "publishedAt": "2016-06-22T19:49:55.553Z",
        "count": 319
      },
      {
        "publishedAt": "2016-06-23T19:49:55.553Z",
        "count": 249
      },
      {
        "publishedAt": "2016-06-24T19:49:55.553Z",
        "count": 144
      },
      {
        "publishedAt": "2016-06-25T19:49:55.553Z",
        "count": 131
      },
      {
        "publishedAt": "2016-06-26T19:49:55.553Z",
        "count": 224
      },
      {
        "publishedAt": "2016-06-27T19:49:55.553Z",
        "count": 274
      },
      {
        "publishedAt": "2016-06-28T19:49:55.553Z",
        "count": 227
      },
      {
        "publishedAt": "2016-06-29T19:49:55.553Z",
        "count": 293
      },
      {
        "publishedAt": "2016-06-30T19:49:55.553Z",
        "count": 240
      },
      {
        "publishedAt": "2016-07-01T19:49:55.553Z",
        "count": 105
      },
      {
        "publishedAt": "2016-07-02T19:49:55.553Z",
        "count": 131
      },
      {
        "publishedAt": "2016-07-03T19:49:55.553Z",
        "count": 183
      },
      {
        "publishedAt": "2016-07-04T19:49:55.553Z",
        "count": 267
      },
      {
        "publishedAt": "2016-07-05T19:49:55.553Z",
        "count": 283
      },
      {
        "publishedAt": "2016-07-06T19:49:55.553Z",
        "count": 313
      },
      {
        "publishedAt": "2016-07-07T19:49:55.553Z",
        "count": 256
      },
      {
        "publishedAt": "2016-07-08T19:49:55.553Z",
        "count": 152
      },
      {
        "publishedAt": "2016-07-09T19:49:55.553Z",
        "count": 132
      },
      {
        "publishedAt": "2016-07-10T19:49:55.553Z",
        "count": 207
      },
      {
        "publishedAt": "2016-07-11T19:49:55.553Z",
        "count": 227
      },
      {
        "publishedAt": "2016-07-12T19:49:55.553Z",
        "count": 227
      },
      {
        "publishedAt": "2016-07-13T19:49:55.553Z",
        "count": 208
      },
      {
        "publishedAt": "2016-07-14T19:49:55.553Z",
        "count": 221
      },
      {
        "publishedAt": "2016-07-15T19:49:55.553Z",
        "count": 95
      },
      {
        "publishedAt": "2016-07-16T19:49:55.553Z",
        "count": 109
      },
      {
        "publishedAt": "2016-07-17T19:49:55.553Z",
        "count": 175
      },
      {
        "publishedAt": "2016-07-18T19:49:55.553Z",
        "count": 248
      },
      {
        "publishedAt": "2016-07-19T19:49:55.553Z",
        "count": 225
      },
      {
        "publishedAt": "2016-07-20T19:49:55.553Z",
        "count": 250
      },
      {
        "publishedAt": "2016-07-21T19:49:55.553Z",
        "count": 277
      },
      {
        "publishedAt": "2016-07-22T19:49:55.553Z",
        "count": 121
      },
      {
        "publishedAt": "2016-07-23T19:49:55.553Z",
        "count": 134
      },
      {
        "publishedAt": "2016-07-24T19:49:55.553Z",
        "count": 225
      },
      {
        "publishedAt": "2016-07-25T19:49:55.553Z",
        "count": 233
      },
      {
        "publishedAt": "2016-07-26T19:49:55.553Z",
        "count": 214
      },
      {
        "publishedAt": "2016-07-27T19:49:55.553Z",
        "count": 275
      },
      {
        "publishedAt": "2016-07-28T19:49:55.553Z",
        "count": 223
      },
      {
        "publishedAt": "2016-07-29T19:49:55.553Z",
        "count": 126
      },
      {
        "publishedAt": "2016-07-30T19:49:55.553Z",
        "count": 81
      },
      {
        "publishedAt": "2016-07-31T19:49:55.553Z",
        "count": 224
      },
      {
        "publishedAt": "2016-08-01T19:49:55.553Z",
        "count": 225
      },
      {
        "publishedAt": "2016-08-02T19:49:55.553Z",
        "count": 263
      },
      {
        "publishedAt": "2016-08-03T19:49:55.553Z",
        "count": 198
      },
      {
        "publishedAt": "2016-08-04T19:49:55.553Z",
        "count": 306
      },
      {
        "publishedAt": "2016-08-05T19:49:55.553Z",
        "count": 114
      },
      {
        "publishedAt": "2016-08-06T19:49:55.553Z",
        "count": 92
      },
      {
        "publishedAt": "2016-08-07T19:49:55.553Z",
        "count": 178
      },
      {
        "publishedAt": "2016-08-08T19:49:55.553Z",
        "count": 255
      },
      {
        "publishedAt": "2016-08-09T19:49:55.553Z",
        "count": 249
      },
      {
        "publishedAt": "2016-08-10T19:49:55.553Z",
        "count": 263
      },
      {
        "publishedAt": "2016-08-11T19:49:55.553Z",
        "count": 214
      },
      {
        "publishedAt": "2016-08-12T19:49:55.553Z",
        "count": 122
      },
      {
        "publishedAt": "2016-08-13T19:49:55.553Z",
        "count": 127
      },
      {
        "publishedAt": "2016-08-14T19:49:55.553Z",
        "count": 192
      },
      {
        "publishedAt": "2016-08-15T19:49:55.553Z",
        "count": 281
      },
      {
        "publishedAt": "2016-08-16T19:49:55.553Z",
        "count": 344
      },
      {
        "publishedAt": "2016-08-17T19:49:55.553Z",
        "count": 290
      },
      {
        "publishedAt": "2016-08-18T19:49:55.553Z",
        "count": 292
      },
      {
        "publishedAt": "2016-08-19T19:49:55.553Z",
        "count": 183
      },
      {
        "publishedAt": "2016-08-20T19:49:55.553Z",
        "count": 91
      },
      {
        "publishedAt": "2016-08-21T19:49:55.553Z",
        "count": 180
      },
      {
        "publishedAt": "2016-08-22T19:49:55.553Z",
        "count": 246
      },
      {
        "publishedAt": "2016-08-23T19:49:55.553Z",
        "count": 300
      },
      {
        "publishedAt": "2016-08-24T19:49:55.553Z",
        "count": 289
      },
      {
        "publishedAt": "2016-08-25T19:49:55.553Z",
        "count": 264
      },
      {
        "publishedAt": "2016-08-26T19:49:55.553Z",
        "count": 114
      },
      {
        "publishedAt": "2016-08-27T19:49:55.553Z",
        "count": 104
      },
      {
        "publishedAt": "2016-08-28T19:49:55.553Z",
        "count": 214
      },
      {
        "publishedAt": "2016-08-29T19:49:55.553Z",
        "count": 247
      },
      {
        "publishedAt": "2016-08-30T19:49:55.553Z",
        "count": 224
      },
      {
        "publishedAt": "2016-08-31T19:49:55.553Z",
        "count": 246
      },
      {
        "publishedAt": "2016-09-01T19:49:55.553Z",
        "count": 223
      },
      {
        "publishedAt": "2016-09-02T19:49:55.553Z",
        "count": 110
      },
      {
        "publishedAt": "2016-09-03T19:49:55.553Z",
        "count": 110
      },
      {
        "publishedAt": "2016-09-04T19:49:55.553Z",
        "count": 180
      },
      {
        "publishedAt": "2016-09-05T19:49:55.553Z",
        "count": 281
      },
      {
        "publishedAt": "2016-09-06T19:49:55.553Z",
        "count": 338
      },
      {
        "publishedAt": "2016-09-07T19:49:55.553Z",
        "count": 254
      },
      {
        "publishedAt": "2016-09-08T19:49:55.553Z",
        "count": 289
      },
      {
        "publishedAt": "2016-09-09T19:49:55.553Z",
        "count": 148
      },
      {
        "publishedAt": "2016-09-10T19:49:55.553Z",
        "count": 115
      },
      {
        "publishedAt": "2016-09-11T19:49:55.553Z",
        "count": 191
      },
      {
        "publishedAt": "2016-09-12T19:49:55.553Z",
        "count": 265
      },
      {
        "publishedAt": "2016-09-13T19:49:55.553Z",
        "count": 264
      },
      {
        "publishedAt": "2016-09-14T19:49:55.553Z",
        "count": 287
      }
    ],
    "period": "+1DAY",
    "publishedAtStart": "2016-03-24T19:49:55.553Z",
    "publishedAtEnd": "2016-09-15T19:49:55.553Z"
  },
  "sources": [
    {
      "value": "Roanoke Times",
      "count": 648
    },
    {
      "value": "Huffington Post",
      "count": 474
    },
    {
      "value": "Inquisitr",
      "count": 456
    },
    {
      "value": "Richmond",
      "count": 442
    },
    {
      "value": "ABC News",
      "count": 384
    },
    {
      "value": "Bloomberg",
      "count": 326
    },
    {
      "value": "Yahoo",
      "count": 317
    },
    {
      "value": "USA Today",
      "count": 292
    },
    {
      "value": "U.S. News and World Report",
      "count": 280
    },
    {
      "value": "Madison",
      "count": 274
    }
  ],
  "keywords": [
    {
      "value": "face",
      "count": 8146
    },
    {
      "value": "Face",
      "count": 4339
    },
    {
      "value": "charges",
      "count": 3915
    },
    {
      "value": "people",
      "count": 3508
    },
    {
      "value": "years",
      "count": 3418
    },
    {
      "value": "year",
      "count": 3357
    },
    {
      "value": "police",
      "count": 3225
    },
    {
      "value": "time",
      "count": 3070
    },
    {
      "value": "court",
      "count": 2521
    },
    {
      "value": "government",
      "count": 2205
    },
    {
      "value": "London",
      "count": 1903
    },
    {
      "value": "Twitter",
      "count": 1827
    },
    {
      "value": "News",
      "count": 1813
    },
    {
      "value": "case",
      "count": 1739
    },
    {
      "value": "Facebook",
      "count": 1725
    },
    {
      "value": "United States",
      "count": 1717
    },
    {
      "value": "Police",
      "count": 1703
    },
    {
      "value": "Republican",
      "count": 1649
    },
    {
      "value": "Court",
      "count": 1600
    },
    {
      "value": "France",
      "count": 1591
    },
    {
      "value": "Reuters",
      "count": 1588
    }
  ],
  "sentiment": [
    {
      "value": "negative",
      "count": 16190
    },
    {
      "value": "positive",
      "count": 13213
    },
    {
      "value": "neutral",
      "count": 9743
    }
  ]
}
  ];

  


});
