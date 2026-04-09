


//total progress count-up animation
const totalProgress = 75;
const duration = 1000;

const display = d3.select(".growth-value");

display.transition()
  .duration(duration)
  .ease(d3.easeCubicOut)
  .tween("text", function() {
    const i = d3.interpolateNumber(0, totalProgress);
    return function(t) {
      this.textContent = `${Math.round(i(t))}%`;
    };
  });

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
const pain = 5
d3.select("#pain-level").text(`${pain}/10`)
d3.select(".pain").style("background-color", colorScale(10 - pain))

const gifs = {
  low: "./img/static-cloud.png",     // <5
  medium: "./img/rain-cloud.gif",    // 5–7
  high: "./img/storm-cloud.gif"    // >7
};

// Logica om GIF te kiezen
let selectedGif;
if (pain < 5) {
  selectedGif = gifs.low;
} else if (pain < 7) {
  selectedGif = gifs.medium;
} else {
  selectedGif = gifs.high;
}

// Update de <img> src
d3.select(".pain img")
  .attr("src",selectedGif)
  .style("center")

// inhoud tile
const overlayContent = {
  physical: {
    title: "Fysieke staat",
    url: "physical.html" // De pagina die je in het iframe wilt laden
  },
  growth: {
    title: "Totale groei",
    url: "growth.html" // De pagina die je in het iframe wilt laden
  },
  profile: {
    title: "Jan Jansen",
    url: "profile.html" // De pagina die je in het iframe wilt laden
  },
  satisfaction: {
    url: "satisfaction.html" // De pagina die je in het iframe wilt laden
  },
  energy: {
    title: "Energieniveau",
    url: "energy.html" // De pagina die je in het iframe wilt laden
  },
  pain: {
    title: "Pijnscore",
    url: "pain.html" // De pagina die je in het iframe wilt laden
  },
};

// overlay functie
function openOverlay(key) {
  const c = overlayContent[key];
  if (!c) return;

  const iframe = document.getElementById('overlay-iframe');
  
  document.getElementById('overlay-title').textContent = c.title;
  
  // Zet de URL van het iframe
  iframe.src = c.url;
  
  document.getElementById('overlay').classList.add('active');
}

// 3. Reset het iframe bij sluiten (optioneel, voor betere performance)
function closeOverlay() {
  document.getElementById('overlay').classList.remove('active');
  document.getElementById('overlay-iframe').src = ""; 
}

function closeOnBackdrop(e) {
  if (e.target === document.getElementById('overlay')) closeOverlay();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeOverlay();
});
