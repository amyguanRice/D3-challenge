// @TODO: YOUR CODE HERE!
const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
    d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderTexts(textsGroup, newXScale, chosenXAxis) {

  textsGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return textsGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  let xlabel;

  if (chosenXAxis === "poverty") {
    xlabel = "Poverty";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age Median";
  }
  else {
    xlabel = "Household Income";
  }
  
  let ylabel = 'Lack of Healthcare';

  const toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([20, -20])
    .html(function (d) {
      return (`<div class='popbox'><strong>${d.state}<br>${xlabel}:${d[chosenXAxis]} %<br>${ylabel}:${d.healthcare}%</strong><div>`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

function updateToolTipt(chosenXAxis, textsGroup) {

  let label;

  if (chosenXAxis === "poverty") {
    label = "In Pverty (%)";
  }
  else if (chosenXAxis === "age") {
    label = "Age Median";
  }
  else {
    label = "Household Income";
  }

  return textsGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function (data, err) {
  if (err) throw err;

  // parse data
  stateAbbr=[];
  data.forEach(function (data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.abbr = data.abbr;
    data.state = data.state;
    stateAbbr.push(data.abbr);
  });
  console.log(data);

  // xLinearScale function above csv import
  let xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  let yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  const bottomAxis = d3.axisBottom(xLinearScale);
  const leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  let xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  let circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".5");

// console.log(data)
  let textsGroup = chartGroup
    .selectAll("text")
    .data(data)
    .enter()    
    .append("text")
    .text(d=>d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.healthcare)+5)
    .attr('text-anchor', 'middle')
    

  // Create group for two x-axis labels
  const labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  const povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  const ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age Median");

  const incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  textsGroup = updateToolTipt(chosenXAxis, textsGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      const value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        textsGroup = renderTexts(textsGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
        textsGroup = updateToolTipt(chosenXAxis, textsGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else{
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
      }
    });
}).catch(function (error) {
  console.log(error);
});
