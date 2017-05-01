var MINUTES_PER_DAY = 24 * 60;

function powerDrawAtMinute(habits, t) {
  var total = 0;
  
  for (var i = 0; i < habits.length; i++) {
    var habit = habits[i];
    
    if (t >= habit.begin && t < habit.end) {
      total += habit.draw / 60;
    }
  }
  
  return total;
}

function calculateNetDrawPerMinute(habits) {
  // Calculate net draw per minute.
var MINUTES_PER_DAY = 24 * 60;

function powerDrawAtMinute(habits, t) {
  var total = 0;
  
  for (var i = 0; i < habits.length; i++) {
    var habit = habits[i];
    
    if (t >= habit.begin && t < habit.end) {
      total += habit.draw / 60;
    }
  }
  
  return total;
}

function calculateNetDrawPerMinute(habits) {
  // Calculate net draw per minute.
  var netDrawPerMinute = [];
  for (var i = 0; i < MINUTES_PER_DAY; i++) {
    netDrawPerMinute[i] = powerDrawAtMinute(habits, i);
  }
  
  return netDrawPerMinute;
}

function calculateSurplusPerMinute(solarPerMinute, netDrawPerMinute) {
  var surplusPerMinute = [];
  
  for (var i = 0; i < MINUTES_PER_DAY; i++) {
    surplusPerMinute[i] = solarPerMinute[i] + netDrawPerMinute[i];
  }
  
  return surplusPerMinute;
}

function calculateTotalSurplus(solarPerMinute, habits) {
  var netDrawPerMinute = calculateNetDrawPerMinute(habits);
  
  var total = 0;
  
  for (var i = 0; i < MINUTES_PER_DAY; i++) {
    total += solarPerMinute[i] - netDrawPerMinute[i];
  }
  
  return total;
}

function overlaps(x1, x2, y1, y2) {
  return x1 <= y2 && y1 <= x2;
}

function fitsInLayer(habit, layer) {
  for (i = 0; i < layer.length; i++) {
    if (overlaps(habit.begin, habit.end, layer[i].begin, layer[i].end)) {
      return false;
    }
  }
  
  return true;
}

function stackLayers(habits) {
  var layers = [[]];
  
  outer: for (h_i = 0; h_i < habits.length; h_i++) {
    var habit = habits[h_i];
    
    for (l_i = 0; l_i < layers.length; l_i++) {
      var layer = layers[l_i];
      
      if (fitsInLayer(habit, layer)) {
        layer.push(habit);
        continue outer;
      }
    }
    
    layers.push([habit]);
  }
  
  return layers;
}

var testHabits = [
  {
    name: "coffee",
    begin: 8 * 60,
    end: 8 * 60 + 30,
    draw: 800,
  },
  {
    name: "kitchen lights",
    begin: 8 * 60,
    end: 9 * 60,
    draw: 240,
  },
  {
    name: "tv",
    begin: 15 * 60,
    end: 17 * 60,
    draw: 320,
  }
];

// console.log(stackLayers(testHabits));

// console.log("Power draw at 8:15 AM: " + powerDrawAtMinute(testHabits, 8 * 60 + 15) + " watt-hours."); // Should be ~17.3
// console.log("Power draw at 9:00 AM: " + powerDrawAtMinute(testHabits, 9 * 60)); // Should be 0

function minutesToDate(mins) {
  return Math.floor(mins / 60) + ":" + mins % 60;
}

function convertToTaskArray(layers) {
  var taskArray = [];
  
  for (var l = 0; l < layers.length; l++) {
    var habits = layers[l];
    
    for (var i = 0; i < habits.length; i++) {
      var habit = habits[i];
      
      var task = {
        task: habit.name,
        type: habit.name,
        startTime: minutesToDate(habit.begin),
        endTime: minutesToDate(habit.end),
        layer: l,
      };
      
      taskArray.push(task);
    }
  }
  
  return taskArray;
}

var layerStack = stackLayers(testHabits);

var graphHeight = 200;

var w = 800;
var h = 25 * (3 + layerStack.length) + graphHeight;

var svg = d3
  .selectAll("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h)
  .attr("class", "svg");

var dateFormat = d3.time.format("%H:%M");

var timeScale = d3.time
  .scale()
  .domain([
    d3.min(taskArray, function(d) {
      return dateFormat.parse("0:0");
    }),
    d3.max(taskArray, function(d) {
      return dateFormat.parse("23:0");
    })
  ])
  .range([0, w - 150]);

var taskArray = convertToTaskArray(layerStack);

console.log(taskArray);

makeGant(taskArray, w, h);





var title = svg
  .append("text")
  .text("Habits")
  .attr("x", w / 2)
  .attr("y", 25)
  .attr("text-anchor", "middle")
  .attr("font-size", 18)
  .attr("fill", "#009FFC");

function makeGant(tasks, pageWidth, pageHeight) {
  var barHeight = 20;
  var gap = barHeight + 4;
  var topPadding = 50;
  var sidePadding = 75;

  var colorScale = d3.scale
    .linear()
    .domain([0, layerStack.length])
    .range(["#00B9FA", "#F95002"])
    .interpolate(d3.interpolateHcl);

  makeGrid(sidePadding, topPadding, pageWidth, pageHeight);
  drawRects(
    tasks,
    gap,
    topPadding,
    sidePadding,
    barHeight,
    colorScale,
    pageWidth,
    pageHeight
  );
  //vertLabels(gap, topPadding, sidePadding, barHeight, colorScale);
}

function drawRects(
  theArray,
  theGap,
  theTopPad,
  theSidePad,
  theBarHeight,
  theColorScale,
  w,
  h
) {
//   var bigRects = svg
//     .append("g")
//     .selectAll("rect")
//     .data(theArray)
//     .enter()
//     .append("rect")
//     .attr("x", 0)
//     .attr("y", function(d, i) {
//       return i * theGap + theTopPad - 2;
//     })
//     .attr("width", function(d) {
//       return w - theSidePad / 2;
//     })
//     .attr("height", theGap)
//     .attr("stroke", "none")
//     .attr("fill", function(d) {
//       return d3.rgb(theColorScale(d.layer));
//     })
//     .attr("opacity", 0.2);

  var rectangles = svg.append("g").selectAll("rect").data(theArray).enter();

  var innerRects = rectangles
    .append("rect")
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("x", function(d) {
      return timeScale(dateFormat.parse(d.startTime)) + theSidePad;
    })
    .attr("y", function(d) {
      return d.layer * theGap + theTopPad;
    })
    .attr("width", function(d) {
      return (
        timeScale(dateFormat.parse(d.endTime)) -
        timeScale(dateFormat.parse(d.startTime))
      );
    })
    .attr("height", theBarHeight)
    .attr("stroke", "none")
    .attr("fill", function(d) {
      return d3.rgb(theColorScale(d.layer));
    });

  var rectText = rectangles
    .append("text")
    .text(function(d) {
      return d.task;
    })
    .attr("x", function(d) {
      return (
        (timeScale(dateFormat.parse(d.endTime)) -
          timeScale(dateFormat.parse(d.startTime))) /
          2 +
        timeScale(dateFormat.parse(d.startTime)) +
        theSidePad
      );
    })
    .attr("y", function(d) {
      return d.layer * theGap + 14 + theTopPad;
    })
    .attr("font-size", 11)
    .attr("text-anchor", "middle")
    .attr("text-height", theBarHeight)
    .attr("fill", "#fff");

  rectText
    .on("mouseover", function(e) {
      // console.log(this.x.animVal.getItem(this));
      var tag = "";

      if (d3.select(this).data()[0].details != undefined) {
        tag =
          "Task: " +
          d3.select(this).data()[0].task +
          "<br/>" +
          "Type: " +
          d3.select(this).data()[0].type +
          "<br/>" +
          "Starts: " +
          d3.select(this).data()[0].startTime +
          "<br/>" +
          "Ends: " +
          d3.select(this).data()[0].endTime +
          "<br/>" +
          "Details: " +
          d3.select(this).data()[0].details;
      } else {
        tag =
          "Task: " +
          d3.select(this).data()[0].task +
          "<br/>" +
          "Type: " +
          d3.select(this).data()[0].type +
          "<br/>" +
          "Starts: " +
          d3.select(this).data()[0].startTime +
          "<br/>" +
          "Ends: " +
          d3.select(this).data()[0].endTime;
      }
      var output = document.getElementById("tag");

      var x = this.x.animVal.getItem(this) + "px";
      var y = this.y.animVal.getItem(this) + 25 + "px";

      output.innerHTML = tag;
      output.style.top = y;
      output.style.left = x;
      output.style.display = "block";
    })
    .on("mouseout", function() {
      var output = document.getElementById("tag");
      output.style.display = "none";
    });

  innerRects
    .on("mouseover", function(e) {
      //console.log(this);
      var tag = "";

      if (d3.select(this).data()[0].details != undefined) {
        tag =
          "Task: " +
          d3.select(this).data()[0].task +
          "<br/>" +
          "Type: " +
          d3.select(this).data()[0].type +
          "<br/>" +
          "Starts: " +
          d3.select(this).data()[0].startTime +
          "<br/>" +
          "Ends: " +
          d3.select(this).data()[0].endTime +
          "<br/>" +
          "Details: " +
          d3.select(this).data()[0].details;
      } else {
        tag =
          "Task: " +
          d3.select(this).data()[0].task +
          "<br/>" +
          "Starts: " +
          d3.select(this).data()[0].startTime +
          "<br/>" +
          "Ends: " +
          d3.select(this).data()[0].endTime;
      }
      var output = document.getElementById("tag");

      var x = this.x.animVal.value + this.width.animVal.value / 2 + "px";
      var y = this.y.animVal.value + 25 + "px";

      output.innerHTML = tag;
      output.style.top = y;
      output.style.left = x;
      output.style.display = "block";
    })
    .on("mouseout", function() {
      var output = document.getElementById("tag");
      output.style.display = "none";
    });
}

function makeGrid(theSidePad, theTopPad, w, h) {
  var xAxis = d3.svg
    .axis()
    .scale(timeScale)
    .orient("bottom")
    .ticks(d3.time.hours, 1)
    .tickSize(-h + theTopPad + 20, 0, 0)
    .tickFormat(d3.time.format("%H"));

  var grid = svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", "translate(" + theSidePad + ", " + (h - 25) + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "middle")
    .attr("fill", "#000")
    .attr("stroke", "none")
    .attr("font-size", 10)
    .attr("dy", "1em");
}

function drawLineGraphs(datasets) {
  var y = d3.scale.linear()
      .rangeRound([0, graphHeight / 2]);

  var line = d3.svg.line()
      .x(function(d) {
        return timeScale(dateFormat.parse(minutesToDate(d.x)));
      })
      .y(function(d) {
        return y(d.y);
      });
  
  var margin = {top: 200, right: 20, bottom: 30, left: 75},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +graphHeight - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // x.domain(d3.extent(data, function(d) { return d.date; }));
  
  var alldata = [];
  for (var i = 0; i < datasets.length; i++) {
    alldata = alldata.concat(datasets[i].data);
  }
  
  console.log(alldata);
  
  y.domain(d3.extent(alldata, function(d) { return d.y; }));

  for (var i = 0; i < datasets.length; i++) {
    var set = datasets[i];
    
    if (set.color === "christmas") {
      var redSet = set.data.filter(
        function(d) { return d.y >= 0; });
      var greenSet = set.data.filter(
        function(d) { return d.y < 0; });
      
      var sets = [];
      
      var currentSet;
      
      if (set.data[0].y >= 0) {
        currentSet = { color: "green", data: [] };
      } else {
        currentSet = { color: "red", data: [] };
      }
      
      for (var i = 0; i < set.data.length; i++) {
        var point = set.data[i];
        currentSet.data.push(point);
        if (point.y <= 0) {
          if (currentSet.color !== "green") {
            sets.push(currentSet);
            currentSet = {
              color: "green",
              data: [point],
            };
          }
        } else {
          if (currentSet.color !== "red") {
            sets.push(currentSet);
            currentSet = {
              color: "red",
              data: [point],
            };
          }
        }
      }
      
      for (var i = 0; i < sets.length; i++) {
        var set = sets[i];
        
        g.datum(set.data)
          .append("path")
          .attr("fill", "none")
          .attr("stroke", set.color)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("d", line);
      }
    } else {
      g.datum(set.data)
        .append("path")
        .attr("fill", "none")
        .attr("stroke", set.color)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
    }
  }
}

function convertDataToPoints(data) {
  var points = [];
  for (var i = 0; i < data.length; i++) {
    points[i] = {
      x: i,
      y: data[i],
    };
  }
  
  return points;
}

var netDrawPerMinute = calculateNetDrawPerMinute(testHabits);
var solarFudge = [];

for (var i = 0; i < MINUTES_PER_DAY; i++) {
  if (i >= 6*60 && i <= 18 * 60) {
    solarFudge[i] = 10 * Math.cos(i * 2 * Math.PI / MINUTES_PER_DAY);
  } else {
    solarFudge[i] = 0;
  } 
}

drawLineGraphs([
  {
    color: "steelblue",
    data: convertDataToPoints(netDrawPerMinute),
  },
  {
    color: "orange",
    data: convertDataToPoints(solarFudge),
  },
  {
    color: "christmas",
    data: convertDataToPoints(
      calculateSurplusPerMinute(solarFudge, netDrawPerMinute)),
  },
]);
);
