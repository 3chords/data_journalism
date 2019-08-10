// svg container
var svgWidth = 960;
var svgHeight = 500;

// margins
var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

// chart area minus margins
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// shift everything over by the margins by appending an svg group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// AUG 9, default x-axis displayed
var chosenXAxis = "Pct_in_Poverty";

// AUG 9, function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function to update x Axis var when we click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used to updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "Pct_in_Poverty") {
    var label = "% in Poverty:";
  }
  else {
    var label = "Median HH Income ($)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.State}<br>${label}<br>${d[chosenXAxis]}`); 
    });

  circlesGroup.call(toolTip);
  
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // on mouse out event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

    return circlesGroup;

}

// d3.csv("HW16_D3_DATA.csv", function(err, censusData) {
//   if (err) throw err;

// Get data from csv and execute everything below
d3.csv("HW16_D3_DATA.csv")
  .then(function(censusData) {

  // Parse Data, use '+' to convert to number
  censusData.forEach(function(data) {
    data.Pct_in_Poverty = +data.Pct_in_Poverty*100;
    data.Pct_WO_HI = +data.Pct_WO_HI*100;
    // Aug 9
    data.Median_Income = +data.Median_Income;
  });

  // Aug 9, xLinearScle function
  var xLinearScale = xScale(censusData, chosenXAxis);

  // Create y-scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(censusData, d => d.Pct_WO_HI)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append x axis to the chart
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
  
  // Append y axis to the chart
  chartGroup.append("g")
    .call(leftAxis);

  // Append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.chosenXAxis))
    .attr("cy", d => yLinearScale(d.Pct_WO_HI))
    .attr("r", "10")
    .attr("fill", "blue")
    .attr("opacity", ".7");

// create group for 2 x-axis labels
var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

// x-axis 1
var pctPovertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "Pct_in_Poverty") // value to grab for event listener
    .classed("active", true)
    .text("% Living in Poverty");

// x-axis 2
var medianHHIncLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "Median_Income") // value to grab for event listener
    .classed("inactive", true)
    .text("Median HH Income ($)");

// create y-axis labels 
chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("% w/o Healthcare");

// update the tooltip function
var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

// x axis labels event listener
xlabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replace chosenXaxis with value
      chosenXAxis = value;

      // update x scale for new data
      xLinearScale = xScale(censusData, chosenXAxis);

      // update x axis with transition
      xAxis = renderAxes(xLinearScale, xAxis);

      // update circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

      // update tool tips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // change classes to bold text
      if (chosenXAxis === "Median_Income") {
        medianHHIncLabel
          .classed("active", true)
          .classed("inactive", false);
        pctPovertyLabel
          .classed("active", false)
          .classed("inactive", true);  
      }
      else {
        medianHHIncLabel
          .classed("active", false)
          .classed("inactive", true);
        pctPovertyLabel
          .classed("active", true)
          .classed("inactive", false);          
      }
    }
  });
});


// Commented out, all of this is from Aug 8
  //   // Step 6: Initialize tool tip
  //   // ==============================
  //   var toolTip = d3.tip()
  //     .attr("class", "tooltip")
  //     .offset([80, -60])
  //     .html(function(d) {
  //       return (`${d.State}<br>% in Poverty: ${d.Pct_in_Poverty}<br>% w/o Health Insurance: ${d.Pct_WO_HI}`);
  //     });

  //   // Step 7: Create tooltip in the chart
  //   // ==============================
  //   chartGroup.call(toolTip);

  //   // Step 8: Create event listeners to display and hide the tooltip
  //   // ==============================
  //   circlesGroup.on("click", function(data) {
  //     toolTip.show(data, this);
  //   })
  //     // onmouseout event
  //     .on("mouseout", function(data, index) {
  //       toolTip.hide(data);
  //     });

  //   // Create axes labels
  //   chartGroup.append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 0 - margin.left + 40)
  //     .attr("x", 0 - (height / 2))
  //     .attr("dy", "1em")
  //     .attr("class", "axisText")
  //     .text("% without Healthcare");

  //   chartGroup.append("text")
  //     .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
  //     .attr("class", "axisText")
  //     .text("% Living in Poverty");
  // });
