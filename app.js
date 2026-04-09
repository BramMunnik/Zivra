


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

// --- DATA OPHALEN ---
d3.json("mockData.json").then(data => {
  allSessions = data.sessions;
  if (!allSessions || allSessions.length === 0) return;

  // Start altijd bij de meest recente sessie
  currentIndex = allSessions.length - 1; 
  
  // Voeg event listeners toe aan knoppen
  document.getElementById("btn-prev").addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderDashboard();
    }
  });

  document.getElementById("btn-next").addEventListener("click", () => {
    if (currentIndex < allSessions.length - 1) {
      currentIndex++;
      renderDashboard();
    }
  });

  // Eerste keer inladen
  renderDashboard();

}).catch(err => {
  console.error("Kon mockData.json niet laden:", err);
});


// --- DASHBOARD RENDER FUNCTIE ---
function renderDashboard() {
  const currentSession = allSessions[currentIndex];
  const firstSession = allSessions[0];

  // 1. UPDATE TIJDLIJN UI
  document.getElementById("session-title").textContent = `Sessie ${currentSession.sessionId}`;
  
  // Format de datum (bijv. "11 apr 2026")
  const dateObj = new Date(currentSession.date);
  document.getElementById("session-date").textContent = dateObj.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

  // Update knoppen (uitschakelen als we niet verder kunnen)
  document.getElementById("btn-prev").disabled = (currentIndex === 0);
  document.getElementById("btn-next").disabled = (currentIndex === allSessions.length - 1);

  // 2. DATA BEREKENEN
  const getAvg = (seg) => Math.round(((seg.shoulder + seg.upperArm + seg.lowerArm) / 3) * 100);
  const firstAvg = getAvg(firstSession.segments);
  const currentAvg = getAvg(currentSession.segments);
  
  const totalProgress = currentAvg - firstAvg; 
  const mood = currentSession.subjective.mood;
  const charge = currentSession.subjective.energy;
  const pain = currentSession.subjective.pain;
  const completedSessions = currentIndex + 1;
  const totalTrackSessions = 10; 

  // 3. DYNAMISCHE KLEUREN
  function getStatusColor(score, isPain = false) {
    if (isPain) {
      if (score < 5) return "#10b981"; // Groen (weinig pijn is goed)
      if (score < 7) return "#f59e0b"; // Oranje
      return "#ef4444"; // Rood (veel pijn is slecht)
    } else {
      if (score >= 7) return "#10b981"; // Groen
      if (score >= 5) return "#f59e0b"; // Oranje
      return "#ef4444"; // Rood
    }
  }

  d3.select(".satisfaction").style("border-top", `4px solid ${getStatusColor(mood, false)}`).style("background-color", `${getStatusColor(mood, false)}1A`);
  d3.select(".energy").style("border-top", `4px solid ${getStatusColor(charge, false)}`).style("background-color", `${getStatusColor(charge, false)}1A`);
  d3.select(".pain").style("border-top", `4px solid ${getStatusColor(pain, true)}`).style("background-color", `${getStatusColor(pain, true)}1A`);

  // 4. TOTALE GROEI
  // We gebruiken geen transities bij het klikken om wachttijden te voorkomen, direct instant feedback is beter voor navigatie.
  d3.select(".growth-value").text(totalProgress >= 0 ? `+${totalProgress}%` : `${totalProgress}%`);

  // 5. TEVREDENHEID (SMILEY)
  const smiley = d3.select(".satisfaction svg");
  smiley.html(""); // Maak oude SVG leeg
  d3.select("#mood").text(`${mood}/10`);
  
  smiley.append("circle").attr("cx", 50).attr("cy", 50).attr("r", 45).attr("fill", "none").attr("stroke", "#023047").attr("stroke-width", 5);
  smiley.append("circle").attr("cx", 35).attr("cy", 40).attr("r", 5).attr("fill", "#023047");
  smiley.append("circle").attr("cx", 65).attr("cy", 40).attr("r", 5).attr("fill", "#023047");
  
  const curve = (mood - 5) * -2;
  smiley.append("path").attr("d", `M30,65 Q50,${65 - curve} 70,65`).attr("stroke", "#023047").attr("stroke-width", 4).attr("fill", "transparent");

  // 6. ENERGIENIVEAU (BATTERIJ)
  const battery = d3.select(".energy svg");
  battery.html(""); // Maak oude SVG leeg
  d3.select("#energy-level").text(`${charge}/10`);
  
  battery.append("rect").attr("x", 25).attr("y", 10).attr("width", 50).attr("height", 80).attr("rx", 4).attr("ry", 4).attr("fill", "none").attr("stroke", "#023047").attr("stroke-width", 5);
  battery.append("rect").attr("x", 40).attr("y", 1).attr("width", 20).attr("height", 10).attr("rx", 2).attr("ry", 2).attr("fill", "#023047");
     
  const fillHeight = (charge / 10) * 70;
  battery.append("rect").attr("x", 32).attr("y", 12 + 73 - fillHeight).attr("width", 36).attr("height", fillHeight).attr("rx", 2).attr("ry", 2).attr("fill", getStatusColor(charge, false));

  // 7. PIJN (GIF)
  d3.select("#pain-level").text(`${pain}/10`);
  const gifs = { low: "./img/static-cloud.png", medium: "./img/rain-cloud.gif", high: "./img/storm-cloud.gif" };
  let selectedGif = pain < 5 ? gifs.low : (pain < 7 ? gifs.medium : gifs.high);
  d3.select(".pain img").attr("src", selectedGif).style("margin", "0 auto");

  // 8. PROFIEL PROGRESSIE (CIRKEL)
  const width = 200, height = 200, radius = 80;
  const progress = completedSessions / totalTrackSessions;

  const progressCircle = d3.select(".profile svg");
  progressCircle.html(""); // Maak oude SVG leeg
  
  const g = progressCircle.attr("viewBox", `0 0 ${width} ${height}`).append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

  g.append("path").attr("d", d3.arc().innerRadius(radius - 10).outerRadius(radius).startAngle(0).endAngle(2 * Math.PI)).attr("fill", "#e2e8f0");
  g.append("path").attr("d", d3.arc().innerRadius(radius - 10).outerRadius(radius).startAngle(0).endAngle(2 * Math.PI * progress)).attr("fill", "#219ebc");

  g.append("text").attr("text-anchor", "middle").attr("dy", "-0.2em").style("font-size", "32px").style("font-weight", "800").style("fill", "#023047").text(`${completedSessions}/${totalTrackSessions}`);
  g.append("text").attr("text-anchor", "middle").attr("dy", "1.5em").style("font-size", "12px").style("fill", "#64748b").style("font-weight", "600").text("Sessies");
}