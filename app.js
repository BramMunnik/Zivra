

//color scale for modular backgrounds
const colorScale = d3.scaleLinear()
    .domain([0, 5, 10])
    .range(["#FFA1A1", "#FFCE8A", "#C1FF9D"])
    .interpolate(d3.interpolateRgb)


// Satisfaction svg
const mood = 8
const smiley = d3.select(".satisfaction svg");

d3.select("#mood").text(`${mood}/10`)
d3.select(".satisfaction").style("background-color", colorScale(mood))

// Face
smiley.append("circle")
   .attr("cx", 50)
   .attr("cy", 50)
   .attr("r", 45)
   .attr("fill", "none")
   .attr("stroke", "#000")
   .attr("stroke-width", 5);

// Eyes
smiley.append("circle").attr("cx", 35).attr("cy", 40).attr("r", 5).attr("fill", "#000");
smiley.append("circle").attr("cx", 65).attr("cy", 40).attr("r", 5).attr("fill", "#000");

// Mouth
const curve = (mood - 5) * -2;
const x1 = 30, y1 = 65;
const x2 = 70, y2 = 65;
const cx = 50, cy = 65 - curve;

smiley.append("path")
   .attr("d", `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`)
   .attr("stroke", "#000")
   .attr("stroke-width", 4)
   .attr("fill", "transparent");

// energy-level svg
const charge = 4;
const battery = d3.select(".energy svg");

d3.select("#energy-level").text(`${charge}/10`)
d3.select(".energy").style("background-color", colorScale(charge))

battery.append("rect")
   .attr("x", 25)
   .attr("y", 10)
   .attr("width", 50)
   .attr("height", 80)
   .attr("rx", 4)
   .attr("ry", 4)
   .attr("fill", "none")
   .attr("stroke", "#000")
   .attr("stroke-width", 5);

battery.append("rect")
   .attr("x", 40)
   .attr("y", 1)
   .attr("width", 20)
   .attr("height", 10)
   .attr("rx", 2)
   .attr("ry", 2)
   .attr("fill", "#000");
   
const fillHeight = (charge / 10) * 70
const fillY = 12 + 73 - fillHeight;

battery.append("rect")
   .attr("x", 32)
   .attr("y", 12 + 73)
   .attr("width", 36) 
   .attr("height", 0)
   .attr("rx", 2)
   .attr("ry", 2)
   .attr("fill", "black")
   .transition()
   .duration(1000)
   .attr("height", fillHeight)
   .attr("y", fillY)

// Pain tile
const pain = 3
d3.select("#pain-level").text(`${pain}/10`)
d3.select(".energy").style("background-color", colorScale(pain))

//Weekly-progress circle
const width = 200;
const height = 200;
const radius = 80;

const current = 6
const total = 7
const progress =  current / total

const progressCircle = d3.select(".profile svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);


const backgroundArc = d3.arc()
  .innerRadius(radius - 10)
  .outerRadius(radius)
  .startAngle(0)
  .endAngle(2 * Math.PI);

progressCircle.append("path")
  .attr("d", backgroundArc)
  .attr("fill", "#ccc");


const arc = d3.arc()
  .innerRadius(radius - 10)
  .outerRadius(radius)
  .startAngle(0);


const foreground = progressCircle.append("path")
  .datum({ endAngle: 0 })
  .attr("fill", "#1e90ff");


foreground.transition()
  .duration(1000)
  .attrTween("d", function(d) {
    const interpolate = d3.interpolate(d.endAngle, 2 * Math.PI * progress);
    return function(t) {
      d.endAngle = interpolate(t);
      return arc(d);
    };
  });


progressCircle.append("text")
  .attr("text-anchor", "middle")
  .attr("dy", "-0.2em")
  .style("font-size", "24px")
  .style("fill", "green")
  .text(`${current}/${total}`);


progressCircle.append("text")
  .attr("text-anchor", "middle")
  .attr("dy", "1.2em")
  .style("font-size", "10px")
  .style("fill", "green")
  .text("sessies voltooid deze week");
