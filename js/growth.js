d3.json("mockData.json").then(data => {
    const sessions = data.sessions;
    if (!sessions || sessions.length < 1) return;

    // --- HULPFUNCTIE: Bereken gemiddelde score van segmenten in % ---
    function getAvgProgress(session) {
        const seg = session.segments;
        return Math.round(((seg.shoulder + seg.upperArm + seg.lowerArm) / 3) * 100);
    }

    const last = sessions[sessions.length - 1];
    const prev = sessions.length > 1 ? sessions[sessions.length - 2] : last;
    const first = sessions[0];

    // --- 1. STATISTIEKEN UPDATEN ---
    const currentAvg = getAvgProgress(last);
    const prevAvg = getAvgProgress(prev);
    const firstAvg = getAvgProgress(first);

    // Huidige score
    d3.select("#current-growth").text(`${currentAvg}%`).style("color", "#2d6a4f"); // Groen voor positief resultaat

    // Verschil laatste sessie
    const diff = currentAvg - prevAvg;
    d3.select("#growth-diff")
        .text(diff >= 0 ? `+${diff}%` : `${diff}%`)
        .attr("class", `stat-value ${diff > 0 ? 'trend-up' : (diff < 0 ? 'trend-down' : 'trend-neutral')}`);

    // Totale groei sinds start
    const totalTrend = currentAvg - firstAvg;
    d3.select("#growth-trend")
        .text(totalTrend >= 0 ? `+${totalTrend}%` : `${totalTrend}%`)
        .attr("class", `stat-value ${totalTrend > 0 ? 'trend-up' : 'trend-neutral'}`);


    // --- 2. GRAFIEK SETUP ---
    const margin = {top: 20, right: 30, bottom: 40, left: 40};
    const width = 600 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select("#growth-chart")
        .html("")
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().domain(sessions.map(d => d.sessionId)).range([0, width]);
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]); // Nu van 0 tot 100%

    // Subtiele horizontale lijnen (elke 25%)
    svg.append("g")
        .attr("class", "grid-line")
        .call(d3.axisLeft(y).tickValues([25, 50, 75, 100]).tickSize(-width).tickFormat(""))
        .style("stroke-opacity", "0.2");


    // --- 3. DATA LIJNEN GENEREREN ---
    // Functies om de JSON decimalen (0.40) om te zetten naar % (40) op de Y-as
    const lineShoulder = d3.line().x(d => x(d.sessionId)).y(d => y(d.segments.shoulder * 100)).curve(d3.curveMonotoneX);
    const lineUpper = d3.line().x(d => x(d.sessionId)).y(d => y(d.segments.upperArm * 100)).curve(d3.curveMonotoneX);
    const lineLower = d3.line().x(d => x(d.sessionId)).y(d => y(d.segments.lowerArm * 100)).curve(d3.curveMonotoneX);

    // Groepen maken
    const groupShoulder = svg.append("g").attr("id", "group-shoulder");
    const groupUpper = svg.append("g").attr("id", "group-upper");
    const groupLower = svg.append("g").attr("id", "group-lower");

    // Functie om lijnen met animatie te tekenen
    function drawLine(group, lineGenerator, lineClass, dotClass, dataKey) {
        const path = group.append("path")
            .datum(sessions)
            .attr("class", `line ${lineClass}`)
            .attr("d", lineGenerator);

        // Animatie
        const totalLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition().duration(1500).ease(d3.easeCubicOut)
            .attr("stroke-dashoffset", 0);

        // Punten
        group.selectAll(`.${dotClass}`).data(sessions).enter().append("circle")
            .attr("class", dotClass)
            .attr("cx", d => x(d.sessionId))
            .attr("cy", d => y(d.segments[dataKey] * 100))
            .attr("r", 0)
            .transition().delay((d, i) => 800 + (i * 100)).duration(400)
            .attr("r", 5);
    }

    // Teken de 3 segmenten (Allemaal standaard aan, we tekenen ze tegelijk)
    drawLine(groupShoulder, lineShoulder, "line-shoulder", "dot-shoulder", "shoulder");
    drawLine(groupUpper, lineUpper, "line-upper", "dot-upper", "upperArm");
    drawLine(groupLower, lineLower, "line-lower", "dot-lower", "lowerArm");

    // Assen
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).attr("class", "axis-text");
    svg.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%")).attr("class", "axis-text");


    // --- 4. INTERACTIVITEIT (Checkboxes) ---
    d3.select("#toggle-shoulder").on("change", function() {
        groupShoulder.transition().duration(300).style("opacity", d3.select(this).property("checked") ? 1 : 0);
    });
    d3.select("#toggle-upper").on("change", function() {
        groupUpper.transition().duration(300).style("opacity", d3.select(this).property("checked") ? 1 : 0);
    });
    d3.select("#toggle-lower").on("change", function() {
        groupLower.transition().duration(300).style("opacity", d3.select(this).property("checked") ? 1 : 0);
    });

}).catch(err => console.error("Fout bij laden JSON:", err));