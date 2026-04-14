//total progress count-up animation
// const totalProgress = 75;
// const duration = 1000;

// color scale for modular backgrounds
// const colorScale = d3.scaleLinear()
//     .domain([0, 5, 10])
//     .range(["#FFA1A1", "#FFCE8A", "#C1FF9D"])
//     .interpolate(d3.interpolateRgb)


// // Satisfaction svg
// const mood = 8
// const smiley = d3.select(".satisfaction svg");

// d3.select("#mood").text(`${mood}/10`)
// d3.select(".satisfaction").style("background-color", colorScale(mood))

// // Face
// smiley.append("circle")
//    .attr("cx", 50)
//    .attr("cy", 50)
//    .attr("r", 45)
//    .attr("fill", "none")
//    .attr("stroke", "#000")
//    .attr("stroke-width", 5);

// // Eyes
// smiley.append("circle").attr("cx", 35).attr("cy", 40).attr("r", 5).attr("fill", "#000");
// smiley.append("circle").attr("cx", 65).attr("cy", 40).attr("r", 5).attr("fill", "#000");

// // Mouth
// const curve = (mood - 5) * -2;
// const x1 = 30, y1 = 65;
// const x2 = 70, y2 = 65;
// const cx = 50, cy = 65 - curve;

// smiley.append("path")
//    .attr("d", `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`)
//    .attr("stroke", "#000")
//    .attr("stroke-width", 4)
//    .attr("fill", "transparent");

// // energy-level svg
// const charge = 4;
// const battery = d3.select(".energy svg");

// d3.select("#energy-level").text(`${charge}/10`)
// d3.select(".energy").style("background-color", colorScale(charge))

// battery.append("rect")
//    .attr("x", 25)
//    .attr("y", 10)
//    .attr("width", 50)
//    .attr("height", 80)
//    .attr("rx", 4)
//    .attr("ry", 4)
//    .attr("fill", "none")
//    .attr("stroke", "#000")
//    .attr("stroke-width", 5);

// battery.append("rect")
//    .attr("x", 40)
//    .attr("y", 1)
//    .attr("width", 20)
//    .attr("height", 10)
//    .attr("rx", 2)
//    .attr("ry", 2)
//    .attr("fill", "#000");
   
// const fillHeight = (charge / 10) * 70
// const fillY = 12 + 73 - fillHeight;

// battery.append("rect")
//    .attr("x", 32)
//    .attr("y", 12 + 73)
//    .attr("width", 36) 
//    .attr("height", 0)
//    .attr("rx", 2)
//    .attr("ry", 2)
//    .attr("fill", "black")
//    .transition()
//    .duration(1000)
//    .attr("height", fillHeight)
//    .attr("y", fillY)

// Pain tile
// const pain = 5
// d3.select("#pain-level").text(`${pain}/10`)
// d3.select(".pain").style("background-color", colorScale(10 - pain))

// const gifs = {
//   low: "./img/static-cloud.png",
//   medium: "./img/rain-cloud.gif",
//   high: "./img/storm-cloud.gif"
// };

// let selectedGif;
// if (pain < 5) {
//   selectedGif = gifs.low;
// } else if (pain < 7) {
//   selectedGif = gifs.medium;
// } else {
//   selectedGif = gifs.high;
// }

// d3.select(".pain img")
//   .attr("src",selectedGif)
//   .style("center")

// inhoud tile
const overlayContent = {
  physical: {
    title: "Fysieke staat",
    url: "physical.html"
  },
  growth: {
    title: "Totale groei",
    url: "growth.html"
  },
  profile: {
    title: "Jan Jansen",
    url: "profile.html"
  },
  satisfaction: {
    url: "satisfaction.html"
  },
  energy: {
    title: "Energieniveau",
    url: "energy.html"
  },
  pain: {
    title: "Pijnscore",
    url: "pain.html"
  },
};

// overlay functie
function openOverlay(key) {
  const c = overlayContent[key];
  if (!c) return;

  const iframe = document.getElementById('overlay-iframe');
  document.getElementById('overlay-title').textContent = c.title;
  iframe.src = c.url;
  document.getElementById('overlay').classList.add('active');
}

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


// --- DATA OPHALEN & DASHBOARD VULLEN ---
// --- GLOBALE STATE ---
let allSessions = [];
let currentIndex = 0;
let prevIndex = 0;

// --- DATA OPHALEN ---
d3.json("mockData.json").then(data => {
  allSessions = data.sessions;
  if (!allSessions || allSessions.length === 0) return;

  currentIndex = allSessions.length - 1; 

  document.getElementById("btn-prev").addEventListener("click", () => {
    if (currentIndex > 0) {
      prevIndex = currentIndex;
      currentIndex--;
      renderDashboard();
    }
  });

  document.getElementById("btn-next").addEventListener("click", () => {
    if (currentIndex < allSessions.length - 1) {
      prevIndex = currentIndex;
      currentIndex++;
      renderDashboard();
    }
  });

  renderDashboard();

}).catch(err => {
  console.error("Kon mockData.json niet laden:", err);
});


// --- DASHBOARD RENDER FUNCTIE ---
function renderDashboard() {
  const currentSession = allSessions[currentIndex];
  const prevSession = allSessions[prevIndex]
  const firstSession = allSessions[0];

  document.getElementById("session-title").textContent = `Sessie ${currentSession.sessionId}`;
  
  const dateObj = new Date(currentSession.date);
  document.getElementById("session-date").textContent = dateObj.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

  document.getElementById("btn-prev").disabled = (currentIndex === 0);
  document.getElementById("btn-next").disabled = (currentIndex === allSessions.length - 1);

  // DATA BEREKENEN
  const getAvg = (seg) => Math.round(((seg.shoulder + seg.upperArm + seg.lowerArm) / 3) * 100);
  const firstAvg = getAvg(firstSession.segments);
  const currentAvg = getAvg(currentSession.segments);
  const prevAvg = getAvg(prevSession.segments);
  
  const totalProgress = currentAvg - firstAvg; 
  const mood = currentSession.subjective.mood;
  const charge = currentSession.subjective.energy;
  const pain = currentSession.subjective.pain;
  const completedSessions = currentIndex + 1;
  const totalTrackSessions = 10; 

  // DYNAMISCHE KLEUREN
  function getStatusColor(score, isPain = false) {
    if (isPain) {
      if (score < 5) return "#10b981";
      if (score < 7) return "#f59e0b"; 
      return "#ef4444";
    } else {
      if (score >= 7) return "#10b981";
      if (score >= 5) return "#f59e0b";
      return "#ef4444";
    }
  }

  d3.select(".satisfaction").style("border-top", `4px solid ${getStatusColor(mood, false)}`).style("background-color", `${getStatusColor(mood, false)}1A`);
  d3.select(".energy").style("border-top", `4px solid ${getStatusColor(charge, false)}`).style("background-color", `${getStatusColor(charge, false)}1A`);
  d3.select(".pain").style("border-top", `4px solid ${getStatusColor(pain, true)}`).style("background-color", `${getStatusColor(pain, true)}1A`);

  // TOTALE GROEI
  const display = d3.select(".growth-value").text(totalProgress >= 0 ? `+${totalProgress}%` : `${totalProgress}%`);
  display.transition()
  .duration(1000)
  .ease(d3.easeCubicOut)
  .tween("text", function() {
    const i = d3.interpolateNumber(prevAvg - firstAvg, totalProgress);
    return function(t) {
      this.textContent = `${Math.round(i(t))}%`;
    };
  });


  // FYSIEKE STAAT
  const Box = d3.select(".physical svg");

  Box.append("circle")
    .attr("cx", 435)
    .attr("cy", 330)
    .attr("r", 30)
    .attr("fill", getStatusColor(currentSession.segments.shoulder * 10));
  
  Box.append("circle")
    .attr("cx", 460)
    .attr("cy", 480)
    .attr("r", 30)
    .attr("fill", getStatusColor(currentSession.segments.upperArm * 10));

  Box.append("circle")
    .attr("cx", 490)
    .attr("cy", 630)
    .attr("r", 30)
    .attr("fill", getStatusColor(currentSession.segments.lowerArm * 10));

  // TEVREDENHEID
  const smiley = d3.select(".satisfaction svg");
  smiley.html("");
  const moodValDisplay = d3.select("#mood").text(`${mood}/10`);
  
  smiley.append("circle").attr("cx", 50).attr("cy", 50).attr("r", 45).attr("fill", "none").attr("stroke", "#023047").attr("stroke-width", 5);
  smiley.append("circle").attr("cx", 35).attr("cy", 40).attr("r", 5).attr("fill", "#023047");
  smiley.append("circle").attr("cx", 65).attr("cy", 40).attr("r", 5).attr("fill", "#023047");
  
  const curve = (mood - 5) * -2;
  smiley.append("path").attr("d", `M30,65 Q50,${65 - curve} 70,65`).attr("stroke", "#023047").attr("stroke-width", 4).attr("fill", "transparent");

  // ENERGIENIVEAU
  const battery = d3.select(".energy svg");
  const energyValDisplay = d3.select("#energy-level").text(`${charge}/10`);
  
  let fillRect = battery.select(".battery-fill");
  if (fillRect.empty()) {
    // Render static parts once
    battery.append("rect")
      .attr("x", 25)
      .attr("y", 10)
      .attr("width", 50)
      .attr("height", 80)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", "none")
      .attr("stroke", "#023047")
      .attr("stroke-width", 5);
    
    battery.append("rect")
      .attr("x", 40)
      .attr("y", 1)
      .attr("width", 20)
      .attr("height", 10)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("fill", "#023047");
    
    // Append the fill rect
    fillRect = battery.append("rect")
      .attr("class", "battery-fill")
      .attr("x", 32)
      .attr("y", 12 + 73)
      .attr("width", 36)
      .attr("height", 0)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("fill", getStatusColor(charge, false));
  }
  
  const fillHeight = (charge / 10) * 70;
  fillRect
    .transition()
    .duration(500)
    .attr("height", fillHeight)
    .attr("y", 12 + 73 - fillHeight)
    .attr("fill", getStatusColor(charge, false));

  // PIJN
  const painValDisplay = d3.select("#pain-level").text(`${pain}/10`);
  const gifs = { low: "./img/static-cloud.png", medium: "./img/rain-cloud.gif", high: "./img/storm-cloud.gif" };
  let selectedGif = pain < 5 ? gifs.low : (pain < 7 ? gifs.medium : gifs.high);
  d3.select(".pain img").attr("src", selectedGif).style("margin", "0 auto");

  // PIJLFUNCTIE
  function drawArrow(key, location){
    location.selectAll("svg").remove();
    const svg = location.append("svg")
        .attr("width", 25)
        .attr("height", 25)
        .attr("viewBox", "0 0 100 100")
        .classed("bounce", true);
    if (!prevSession) return;
    const prevValue = allSessions[currentIndex-1].subjective[key];
    const currentValue = currentSession.subjective[key];
    let improved = currentValue > prevValue;
    if (key === 'pain') improved = currentValue < prevValue;
    if (improved){
      svg.append("polygon")
        .attr("points", "50,10 90,90 10,90")
        .attr("fill", "#10b981");
    }
    else if (currentValue !== prevValue){
        svg.append("polygon")
          .attr("points", "10,10 90,10 50,90")
          .attr("fill", "#ef4444");
    }
    else{
        svg.append("circle")
          .attr("cx", 50)
          .attr("cy", 50)
          .attr("r", 20)
          .attr("fill", "gray");
    }
  }

  drawArrow('mood', moodValDisplay);
  drawArrow('energy', energyValDisplay);
  drawArrow('pain', painValDisplay);
}