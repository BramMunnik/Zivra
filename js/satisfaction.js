d3.json("mockData.json").then(data => {
    const sessions = data.sessions;
    if (!sessions || sessions.length < 1) return;

    const margin = {top: 20, right: 30, bottom: 40, left: 40};
    const width = 600 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select("#mood-chart")
        .html("")
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().domain(sessions.map(d => d.sessionId)).range([0, width]);
    const y = d3.scaleLinear().domain([0, 10]).range([height, 0]);

    svg.append("rect").attr("x", 0).attr("y", y(10)).attr("width", width).attr("height", y(7) - y(10)).attr("class", "zone-green");
    svg.append("rect").attr("x", 0).attr("y", y(7)).attr("width", width).attr("height", y(4) - y(7)).attr("class", "zone-yellow");
    svg.append("rect").attr("x", 0).attr("y", y(4)).attr("width", width).attr("height", y(0) - y(4)).attr("class", "zone-red");


    // --- DATA LIJNEN GENEREREN ---
    const lineMood = d3.line().x(d => x(d.sessionId)).y(d => y(d.subjective.mood)).curve(d3.curveMonotoneX);
    const lineEnergy = d3.line().x(d => x(d.sessionId)).y(d => y(d.subjective.energy)).curve(d3.curveMonotoneX);
    const linePain = d3.line().x(d => x(d.sessionId)).y(d => y(d.subjective.pain)).curve(d3.curveMonotoneX);

    const groupMood = svg.append("g").attr("id", "group-mood");
    const groupEnergy = svg.append("g").attr("id", "group-energy").style("opacity", 0);
    const groupPain = svg.append("g").attr("id", "group-pain").style("opacity", 0);    

    const pathMood = groupMood.append("path").datum(sessions).attr("class", "line line-mood").attr("d", lineMood);
    groupMood.selectAll(".dot-mood").data(sessions).enter().append("circle").attr("class", "dot-mood").attr("cx", d => x(d.sessionId)).attr("cy", d => y(d.subjective.mood)).attr("r", 0)
        .transition().delay((d, i) => 1000 + (i * 100)).duration(400).attr("r", 6);

    const totalLength = pathMood.node().getTotalLength();
    pathMood.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength)
        .transition().duration(1500).attr("stroke-dashoffset", 0);

    // Energie Tekenen
    groupEnergy.append("path").datum(sessions).attr("class", "line line-energy").attr("d", lineEnergy);
    groupEnergy.selectAll(".dot-energy").data(sessions).enter().append("circle").attr("class", "dot-energy").attr("cx", d => x(d.sessionId)).attr("cy", d => y(d.subjective.energy)).attr("r", 5);

    // Pijn Tekenen
    groupPain.append("path").datum(sessions).attr("class", "line line-pain").attr("d", linePain);
    groupPain.selectAll(".dot-pain").data(sessions).enter().append("circle").attr("class", "dot-pain").attr("cx", d => x(d.sessionId)).attr("cy", d => y(d.subjective.pain)).attr("r", 5);

    // Assen
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).attr("class", "axis-text");
    svg.append("g").call(d3.axisLeft(y).ticks(5)).attr("class", "axis-text");


    // --- INTERACTIVITEIT ---
    
    d3.select("#toggle-mood").on("change", function() {
        const isChecked = d3.select(this).property("checked");
        groupMood.transition().duration(300).style("opacity", isChecked ? 1 : 0);
    });

    d3.select("#toggle-energy").on("change", function() {
        const isChecked = d3.select(this).property("checked");
        groupEnergy.transition().duration(300).style("opacity", isChecked ? 1 : 0);
    });

    d3.select("#toggle-pain").on("change", function() {
        const isChecked = d3.select(this).property("checked");
        groupPain.transition().duration(300).style("opacity", isChecked ? 1 : 0);
    });

    const last = sessions[sessions.length - 1];
    const prev = sessions.length > 1 ? sessions[sessions.length - 2] : last;
    const first = sessions[0];

    d3.select("#current-mood").text(`${last.subjective.mood}/10`);
    
    const diff = last.subjective.mood - prev.subjective.mood;
    d3.select("#mood-diff").text(diff >= 0 ? `+${diff}` : diff)
          .attr("class", `stat-value ${diff > 0 ? 'trend-up' : (diff < 0 ? 'trend-down' : 'trend-neutral')}`);

    const totalTrend = last.subjective.mood - first.subjective.mood;
    d3.select("#mood-trend").text(totalTrend >= 0 ? `+${totalTrend}` : totalTrend)
           .attr("class", `stat-value ${totalTrend > 0 ? 'trend-up' : 'trend-neutral'}`);

}).catch(err => console.error("Fout bij laden JSON:", err));