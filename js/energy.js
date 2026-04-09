d3.json("mockData.json").then(data => {
    const sessions = data.sessions;
    if (!sessions || sessions.length < 1) return;

    const last = sessions[sessions.length - 1];
    const prev = sessions.length > 1 ? sessions[sessions.length - 2] : last;
    const first = sessions[0];

    // --- 1. STATISTIEKEN (Hoger = Beter) ---
    d3.select("#current-energy").text(`${last.subjective.energy}/10`);

    const diff = last.subjective.energy - prev.subjective.energy;
    const diffEl = d3.select("#energy-diff");
    const diffClass = diff > 0 ? 'trend-up' : (diff < 0 ? 'trend-down' : 'trend-neutral');
    diffEl.text(diff > 0 ? `+${diff}` : diff).attr("class", `stat-value ${diffClass}`);

    const totalTrend = last.subjective.energy - first.subjective.energy;
    const trendEl = d3.select("#energy-trend");
    const trendClass = totalTrend > 0 ? 'trend-up' : (totalTrend < 0 ? 'trend-down' : 'trend-neutral');
    trendEl.text(totalTrend > 0 ? `+${totalTrend}` : totalTrend).attr("class", `stat-value ${trendClass}`);


    // --- 2. GRAFIEK SETUP ---
    const margin = {top: 20, right: 30, bottom: 40, left: 40};
    const width = 600 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select("#energy-chart")
        .html("")
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().domain(sessions.map(d => d.sessionId)).range([0, width]);
    const y = d3.scaleLinear().domain([0, 10]).range([height, 0]);


    // --- 3. KLEUR ZONES ---
    svg.append("rect").attr("x", 0).attr("y", y(10)).attr("width", width).attr("height", y(7) - y(10)).attr("class", "zone-green");
    svg.append("rect").attr("x", 0).attr("y", y(7)).attr("width", width).attr("height", y(4) - y(7)).attr("class", "zone-yellow");
    svg.append("rect").attr("x", 0).attr("y", y(4)).attr("width", width).attr("height", y(0) - y(4)).attr("class", "zone-red");


    // --- 4. DATA LIJNEN GENEREREN ---
    const lineEnergy = d3.line().x(d => x(d.sessionId)).y(d => y(d.subjective.energy)).curve(d3.curveMonotoneX);
    const lineMood = d3.line().x(d => x(d.sessionId)).y(d => y(d.subjective.mood)).curve(d3.curveMonotoneX);
    const linePain = d3.line().x(d => x(d.sessionId)).y(d => y(d.subjective.pain)).curve(d3.curveMonotoneX);

    const groupEnergy = svg.append("g").attr("id", "group-energy").style("opacity", 1);
    const groupMood = svg.append("g").attr("id", "group-mood").style("opacity", 0); 
    const groupPain = svg.append("g").attr("id", "group-pain").style("opacity", 0);

    const pathEnergy = groupEnergy.append("path").datum(sessions).attr("class", "line line-energy").attr("d", lineEnergy)
        .style("stroke-dasharray", "none"); 
    
    groupEnergy.selectAll(".dot-energy").data(sessions).enter().append("circle").attr("class", "dot-energy").attr("cx", d => x(d.sessionId)).attr("cy", d => y(d.subjective.energy)).attr("r", 0)
        .transition().delay((d, i) => 1000 + (i * 100)).duration(400).attr("r", 6);

    const totalLength = pathEnergy.node().getTotalLength();
    pathEnergy.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength)
        .transition().duration(1500).attr("stroke-dashoffset", 0);

    groupMood.append("path").datum(sessions).attr("class", "line line-mood").attr("d", lineMood).style("stroke-dasharray", "8 8"); 
    groupMood.selectAll(".dot-mood").data(sessions).enter().append("circle").attr("class", "dot-mood").attr("cx", d => x(d.sessionId)).attr("cy", d => y(d.subjective.mood)).attr("r", 5);

    groupPain.append("path").datum(sessions).attr("class", "line line-pain").attr("d", linePain).style("stroke-dasharray", "8 8");
    groupPain.selectAll(".dot-pain").data(sessions).enter().append("circle").attr("class", "dot-pain").attr("cx", d => x(d.sessionId)).attr("cy", d => y(d.subjective.pain)).attr("r", 5);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).attr("class", "axis-text");
    svg.append("g").call(d3.axisLeft(y).ticks(5)).attr("class", "axis-text");


    // --- 5. INTERACTIVITEIT (Checkboxes) ---
    d3.select("#toggle-energy").on("change", function() {
        groupEnergy.transition().duration(300).style("opacity", d3.select(this).property("checked") ? 1 : 0);
    });
    d3.select("#toggle-mood").on("change", function() {
        groupMood.transition().duration(300).style("opacity", d3.select(this).property("checked") ? 1 : 0);
    });
    d3.select("#toggle-pain").on("change", function() {
        groupPain.transition().duration(300).style("opacity", d3.select(this).property("checked") ? 1 : 0);
    });

}).catch(err => console.error("Fout bij laden JSON:", err));