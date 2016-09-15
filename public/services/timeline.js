// TO-DOs

// 1: Make it so timeline width fills out the width of parent div.
// see: http://jsfiddle.net/shawnbot/BJLe6/
// use document.getElementById('graph') instead of $('#graph');

// Timeline height can be a fixed px height.

// 2: Set up graph to start from the middle of y-axes rather than bottom

angular.module('smartNews.timeline', [])

.factory('renderGraph', function($rootScope, $window) {
  var selectedDate = {
    startDate: 'NOW-2DAYS',
    endDate: 'NOW'
  };

  var renderGraph = function(dataObj) {

    data = dataObj.timeSeries;

    //clear out contents of graph prior to rendering, to prevent stacking graphs
    // using 'window' is necessary here due to lexical scope.
    if (window.graph.innerHTML !== undefined) {
      window.graph.innerHTML = '';
    }

    // set graph dimensions and margins
    var margin = { top: 0, right: 50, bottom: 50, left: 50 };

    // fixed size graph. These values are shorter than true innerWidth / innerHeight:
    var graph = document.getElementById('graph');
    var width = window.innerWidth - margin.left - margin.right;
    var height = window.innerHeight * 0.5 - margin.top - margin.bottom;

    // parse UTC date/time
    var parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');

    // set X & Y range
    // range is the raw data values scaled to fit the graph dimensions
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var svg = d3.select('#graph')
      .append('div')
      // .classed('svg-container', true) //container class to make it responsive
      .append('svg')
      // responsive SVG needs these two attr's and an absence of height and width attr's
      // .attr('preserveAspectRatio', 'xMinYMin meet') // preserves aspect ratio by 'fitting' the viewbox to the viewport, rather than filling
      // .attr('viewBox', '0 0 ' + (window.innerWidth) + ' ' + (window.innerHeight))
      .attr('viewBox', '0 0 ' + (window.innerWidth) + ' ' + 400 )
      // append group element
      .append('g')
      // center group element on page by subtracting viewbox length from viewport length, halving, and spacing that many pixels
      .attr('transform', 'translate(' + ((window.innerWidth - width) / 2) + ',0)')
      .classed("svg-content-responsive", true);

    // div element for tooltip
    var div = d3.select('#graph').append('div')
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
      .on('mouseover', function(d) {
        d3.select(this)
          .classed('tooltip-target-on', true);
        div.transition()
          .duration(100)
          .style('opacity', 0.75);
        div.html(
            '<span class="tooltip-date">' + moment(d.date).format("MM/DD/YYYY") + '<br/>' + '<span class="tooltip-value">' + d.value + ' articles'
          )
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY - 28) + 'px');
      })
      .on('mouseout', function(d) {
        d3.select(this)
          .classed('tooltip-target-on', false);
        div.transition()
          .duration(250)
          .style('opacity', 0);
      })
      .on('click', function(d) {
        var startDate = d.publishedAt.split('T')[0];
        // selectedDate.startDate = new Date(startDate).toISOString();
        // var endDate = new Date(startDate);
        // endDate = endDate.setDate(endDate.getDate() + 1);
        // selectedDate.endDate = new Date(endDate).toISOString();

        var sdate = new Date(startDate);
        var timeDiff = Math.abs(sdate.getTime() - new Date());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        diffDays = diffDays-1;
        selectedDate.startDate = "NOW-"+ diffDays + "DAYS"
        diffDays = diffDays-1;
        selectedDate.endDate = "NOW-"+ diffDays + "DAYS"
        console.log("before",selectedDate.startDate)
        console.log("after",selectedDate.endDate)


        $rootScope.$broadcast('user:clickDate', selectedDate);
      });

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

  /* 
   * Render Donut 
   */

  var renderSources = function(trends, size) {
    d3.select('.sourcesSVG').remove();
    size = size || {width: 430, height: 250};

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

    var svg = d3.select(".sources").append("svg")
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

    var donut = d3.select(".donut");

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

  /*
   * Cloud graph starts here
   */
  var renderCloud = function(words, size) {
    size = size || {width: 960, height: 500};

    var color = $window.d3.scale.linear()
      .domain([0,1,2,3,4,5,6,10,15,20,100])
      .range(["#222", "#333", "#444", "#555", "#666", "#777", "#888", "#999", "#aaa", "#bbb", "#ccc", "#ddd"]);
      
    d3.layout.cloud().size([size.width - 50, size.height - 50]) // was 800x300
      .words(frequency_list)
      .rotate(0)
      .fontSize(function(d) { return d.size; })
      .on("end", draw)
      .start();

    function draw(words) {
      d3.select("body").append("svg")
        .attr("width", size.width + 50) // was 850
        .attr("height", size.height + 50) // was 350
        .attr("class", "wordcloud")
        .append("g")
        // without the transform, words words would get cutoff to the left and top, they would
        // appear outside of the SVG area
        .attr("transform", "translate(320,200)")   // scale this?
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("fill", function(d, i) { return color(i); })
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
    }
  };

  var renderSentiment = function() {
    var chartWidth = 250;
    var barHeight = 50;
    var groupHeight = barHeight * data.series.length;
    var gapBetweenGroups = 10;
    var spaceForLabels = 80;
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

    data2.sentiment = sortSentiment(data2.sentiment);

    for (var i = 0; i < data2.sentiment.length; i++) {
      zippedData.push(data2.sentiment[i].count / sum);
    }

    // Color scale
    var color = d3.scale.category20();
    var chartHeight = barHeight * zippedData.length + gapBetweenGroups;

    var x = d3.scale.linear()
      .domain([0, d3.max(zippedData)])
      .range([0, chartWidth]);

    var y = d3.scale.linear()
      .range([chartHeight + gapBetweenGroups, 0]);

    var yAxis = d3.svg.axis()
      .scale(y)
      .tickFormat('')
      .tickSize(0)
      .orient('left');

    // Specify the chart area and dimensions
    var chart = d3.select('.chart')
      .attr('width', spaceForLabels + chartWidth + spaceForLegend)
      .attr('height', chartHeight);

    // Create bars
    var bar = chart.selectAll('g')
      .data(zippedData)
      .enter().append('g')
      .attr('transform', function(d, i) {
        return 'translate(' + spaceForLabels + ',' + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i / data.series.length))) + ')';
      });

    // Create rectangles of the correct width
    bar.append('rect')
      .attr('fill', function(d, i) {
        return color(i % data.series.length);
      })
      .attr('class', 'bar')
      .attr('width', x)
      .attr('height', barHeight - 1);

    // Add text label in bar
    bar.append('text')
      .attr('x', function(d) {
        return x(d) - 3;
      })
      .attr('y', barHeight / 2)
      .attr('fill', 'red')
      .attr('dy', '.35em')
      .text(function(d) {
        return Math.floor(d * 100) + '%';
      });

    // Draw labels
    bar.append('text')
      .attr('class', 'label')
      .attr('x', function(d) {
        return -10;
      })
      .attr('y', groupHeight / 2)
      .attr('dy', '.35em')
      .text(function(d, i) {
        if (i % data2.sentiment.length === 0) {
          return 'Sentiments';
        } else {
          return '';
        }
      });

    // chart.append('g')
    //   .attr('class', 'y axis')
    //   .attr('transform', 'translate(' + spaceForLabels + ', ' + -gapBetweenGroups / 2 + ')')
    //   .call(yAxis);

    // Draw legend
    var legendRectSize = barHeight / 3;
    var legendSpacing = 4;

    var legend = chart.selectAll('.legend')
      .data(data2.sentiment)
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


  return {
    renderGraph: renderGraph,
    selectedDate: selectedDate,
    renderSources: renderSources,
    renderCloud: renderCloud,
    renderSentiment: renderSentiment
  };
});
