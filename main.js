import getData from "./getData.js";

const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const render = (data) => {
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  console.log(data);
  const baseTemperature = +data.baseTemperature;
  const title = "Monthly Global Land-Surface Temperature";
  const subtitle = "1753 - 2015: base temperature 8.66℃";
  const xLabelAxis = "";
  const yLabelAxis = "Months";
  const svg = d3.select("svg");
  const height = svg.attr("height");
  const width = svg.attr("width");
  const margin = {
    left: 110,
    right: 40,
    top: 120,
    bottom: 120,
  };
  const inner = {
    height: height - (margin.top + margin.bottom),
    width: width - (margin.left + margin.right),
  };
  const scaleColor = [2.8, 3.9, 5, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];
  const changeColor = (d) => {
    let temp = d.variance + baseTemperature;
    for (let i = 0; i < scaleColor.length; i++) {
      if (temp < scaleColor[i]) {
        return "temp-" + (i + 1);
      }
    }
    return "temp-11";
  };
  const dataSet = data.monthlyVariance;
  const xValue = (d) => d.year,
    yValue = (d) => d.month;
  console.log(d3.extent(dataSet, (d) => xValue(d)));
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataSet, (d) => xValue(d)))
    .range([0, inner.width]);
  const yScale = d3
    .scaleBand()
    .domain(dataSet.map((d) => yValue(d)))
    .range([0, inner.height]);
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
  const yAxis = d3.axisLeft(yScale).tickFormat((d, i) => MONTHS[i]);

  g.append("g")
    .call(yAxis)
    .append("text")
    .text(yLabelAxis)
    .attr("fill", "#000")
    .attr("y", -70)
    .attr("x", 80 - inner.height / 2)
    .attr("transform", "rotate(270)")
    .attr("class", "info");
  const xAxisG = g
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0,${inner.height})`);

  const leyend = xAxisG.append("g").attr("transform", `translate(0,50)`);
  const leyendText = leyend.append("g").attr("transform", `translate(0,40)`);
  const leyendColorSize = {
    width: 40,
    height: 20,
  };
  for (let i = 1; i < 12; i++) {
    leyend
      .append("rect")
      .attr("width", leyendColorSize.width)
      .attr("height", leyendColorSize.height)
      .attr("class", "temp-" + i)
      .attr("x", leyendColorSize.width * i);
    if (i > 1) {
      leyend
        .append("rect")
        .attr("width", 2)
        .attr("height", leyendColorSize.height + 5)
        .attr("class", "line")
        .attr("x", leyendColorSize.width * i);
    }
    leyendText
      .append("text")
      .attr("class", "info")
      .attr("x", leyendColorSize.width * (i + 1))
      .text(scaleColor[i - 1]);
  }
  const roundNumber = (num) => Math.round((num + Number.EPSILON) * 10) / 10;
  const tooltip = ({ year, month, variance }) =>
    d3.timeFormat("%Y")(year) +
    " - " +
    MONTHS[+month - 1] +
    "<br>" +
    +roundNumber(baseTemperature + variance) +
    "°C<br>" +
    roundNumber(variance) +
    "°C";

  const div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  const widthBars = 5;
  console.log(widthBars);
  g.selectAll("rect")
    .data(dataSet)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(xValue(d)))
    .attr("width", widthBars)
    .attr("height", yScale.bandwidth())
    .attr("y", (d) => yScale(yValue(d)))
    .attr("class", (d) => "bar " + changeColor(d))
    .on("mouseover", (d) => {
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(tooltip(d))
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
    })
    .on("mouseout", (d) => {
      div.transition().duration(500).style("opacity", 0);
    });
  const header = svg.append("g").attr("transform", `translate(44,50)`);

  header.append("text").text(title).attr("class", "title");
  header.append("text").text(subtitle).attr("class", "subtitle").attr("y", 30);
};
const dateParse = d3.timeParse("%Y");
getData(url)
  .then((data) => {
    data.monthlyVariance.forEach((d) => {
      d.year = dateParse(d.year);
      d.variance = +d.variance;
    });
    render(data);
  })
  .catch((err) => console.error(err));
