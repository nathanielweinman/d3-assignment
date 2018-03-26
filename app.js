'use strict';
$(function(){
  // Setting up the chart area
  var margin = {
    top: 40,
    right: 20,
    bottom: 30,
    left: 40
  };
  var canvasWidth = 400;
  var canvasHeight = 300;
  var width = canvasWidth - margin.left - margin.right;
  var height = canvasHeight - margin.top - margin.bottom;
  var svg = d3.select('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);
  // Add area for points
  var graphArea = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  var xScale;
  var yScale;

  // Step 1: edit data.csv to include the data you want to show
  d3.csv('data.csv', function(data) {
    // Step 2: Create x and y scales (scaleLinear) to draw points. 
    // Set xScale and yScale to the scales so you can use them outside this function.
    
    // Add code here
    var maxX = 0;
    var maxY = 0;
    for (var i in data) {
      var row = data[i];
      // Ignore the empty "final" row.
      if (row.xValue_2012) {
        maxX = Math.max(maxX, row.xValue_2012, row.xValue_2013, row.xValue_2014, row.xValue_2015);
        maxY = Math.max(maxY, row.yValue_2012, row.yValue_2013, row.yValue_2014, row.yValue_2015);
      }
    }
    xScale = d3.scaleLinear().domain([0, maxX]).range([0, width]);
    yScale = d3.scaleLinear().domain([0, maxY]).range([height, 0]);


    // Step 3: Add code to color the points by category (add code here or above)
    

    // Add axes (uncomment this code to add axes)
    graphArea.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (height) + ')')
      .call(d3.axisBottom(xScale));

    graphArea.append('g')
      .attr('class', 'y axis')
      .call(d3.axisLeft(yScale));

    var cValue = function(d) { return d.category === 'Normal' ? 'Red' : 'Blue' }
    graphArea.selectAll('circle').data(data)
      .enter().append('circle')
      .attr('r', 5)
      .attr('cx', function(d) { return xScale(d.xValue_2012) })
      .attr('cy', function(d) { return yScale(d.yValue_2012) })
      .style('fill', function(d) { return cValue(d); })
      .attr('opacity', 1);
  });

  // Animate points
  var originalYear = 2012;
  var maxYear = 2015;
  var year = originalYear;
  var lastYear = null;
  d3.select('#nextButton').on('click', function(event) {
    lastYear = year;
    if (year == maxYear) {
      year = originalYear;
    } else {
      year = year + 1;
    }
    var xColumn = 'xValue_' + String(year);
    var yColumn = 'yValue_' + String(year);
    var lastXColumn = 'xValue_' + String(lastYear);
    var lastYColumn = 'yValue_' + String(lastYear);
    
    // Step 4: Animate changing the points shown by year here

    // Add code here
    // "Normal" points will transition linearly, but "chaotic" points will
    // first move horizontally, then vertically.
    var intermediateXFnc = function(d) { 
      if (d.category === 'Normal') {
        return xScale((parseInt(d[xColumn]) + parseInt(d[lastXColumn])) / 2);
      } else {
        return xScale((d[xColumn]));
      }
    };
    var intermediateYFnc = function(d) { 
      if (d.category === 'Normal') {
        return yScale((parseInt(d[yColumn]) + parseInt(d[lastYColumn])) / 2);
      } else {
        return yScale((d[lastYColumn]));
      }
    };
   
    // I couldn't find a way to have `ease` take in a function, so the
    // transitions are copy-pasted twice :( The only difference between
    // them is the ease function. 
    graphArea.selectAll('circle')
      .filter(function(d) { return d.category === 'Normal' })
      .transition()
      .attr('cx', intermediateXFnc)
      .attr('cy', intermediateYFnc)
      // Update the opacity to get lighter as yaers go on, as we've seen
      // opacity to represent numeric scales like years.
      .attr('opacity', function() { return 1 - ((year - originalYear - 0.5)/(maxYear - originalYear + 1)) })
      .duration(500)
      .ease(d3.easeLinear)
      .on('end', function () {
        graphArea.selectAll('circle')
        .filter(function(d) { return d.category === 'Normal' })
          .transition()
          .attr('cx', function(d) { return xScale(d[xColumn]) })
          .attr('cy', function(d) { return yScale(d[yColumn]) })
          .attr('opacity', function() { return 1 - ((year - originalYear)/(maxYear - originalYear + 1)) })
          .duration(500)
          .ease(d3.easeLinear)
      });

    graphArea.selectAll('circle')
      .filter(function(d) { return d.category !== 'Normal' })
      .transition()
      .attr('cx', intermediateXFnc)
      .attr('cy', intermediateYFnc)
      .attr('opacity', function() { return 1 - ((year - originalYear - 0.5)/(maxYear - originalYear + 1)) })
      .duration(500)
      .ease(d3.easeElastic)
      .on('end', function () {
        graphArea.selectAll('circle')
          .filter(function(d) { return d.category !== 'Normal' })
          .transition()
          .attr('cx', function(d) { return xScale(d[xColumn]) })
          .attr('cy', function(d) { return yScale(d[yColumn]) })
          .attr('opacity', function() { return 1 - ((year - originalYear)/(maxYear - originalYear + 1)) })
          .duration(500)
          .ease(d3.easeElastic)
      });

    // Update Year text.
    document.getElementById('status').innerHTML = 'Year: ' + year;
  });

});

// Step 5: make some other change to the graph
// Add opacity transition based on the year
// Add multi-step movement for each point, based on the category.
