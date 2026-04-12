d3.json("mockData.json").then(data => {
    const sessions = data.sessions;
    if (!sessions || sessions.length < 1) return;

    const last = sessions[sessions.length - 1];

    function calculateROM(sensorData) {
        return Math.round(sensorData * 100); 
    }

    const healthyRefs = {
        shoulder: 98,
        upperArm: 95,
        lowerArm: 100
    };

    const clinicalInsights = {
        "shoulder": { title: "Schouder", note: "Duidelijk 'Hitching' patroon zichtbaar (optrekken van de trapezius). Elevatie is beperkt.", exercise: "Wandglijden / Scapulaire stabilisatie." },
        "upperArm": { title: "Bovenarm", note: "Milde hypertonie bij flexie. Vloeiende beweging ontbreekt bij abductie.", exercise: "Geleide actieve abductie." },
        "lowerArm": { title: "Onderarm", note: "Supinatie loopt iets achter, maar binnen functionele marges.", exercise: "Fijne motoriek manipulaties." }
    };

    const avgLeft = d3.mean([calculateROM(last.segments.shoulder), calculateROM(last.segments.upperArm), calculateROM(last.segments.lowerArm)]);
    const avgRight = d3.mean([healthyRefs.shoulder, healthyRefs.upperArm, healthyRefs.lowerArm]);
    const symmetry = Math.round((avgLeft / avgRight) * 100);

    const sternumData = { x: -12, y: 8 }; 
    const postureScore = Math.max(0, 100 - (Math.abs(sternumData.x) + Math.abs(sternumData.y)) * 2);

    d3.select("#symmetry-score").text(`${symmetry}%`).attr("class", `stat-value ${symmetry > 80 ? 'trend-up' : 'trend-down'}`);
    d3.select("#posture-score").text(`${postureScore}/100`).attr("class", `stat-value ${postureScore > 75 ? 'trend-up' : 'trend-down'}`);
    d3.select("#compensation-risk").text(postureScore < 70 ? "HOOG (Valgevaar)" : "Normaal").style("color", postureScore < 70 ? "#ef4444" : "#10b981");

    const romContainer = d3.select("#rom-compare-chart");
    const rMargin = {top: 20, right: 20, bottom: 30, left: 40},
          rWidth = 500 - rMargin.left - rMargin.right,
          rHeight = 220 - rMargin.top - rMargin.bottom;

    const svgRom = romContainer.append("svg")
        .attr("viewBox", `0 0 ${rWidth + rMargin.left + rMargin.right} ${rHeight + rMargin.top + rMargin.bottom}`)
        .append("g").attr("transform", `translate(${rMargin.left},${rMargin.top})`);

    const xRom = d3.scalePoint().domain(sessions.map(d => d.sessionId)).range([0, rWidth]);
    const yRom = d3.scaleLinear().domain([0, 100]).range([rHeight, 0]);

    svgRom.append("g").attr("class", "grid-line").call(d3.axisLeft(yRom).tickSize(-rWidth).tickFormat("")).style("stroke-opacity", "0.2");
    
    const xAxisGroup = svgRom.append("g").attr("transform", `translate(0,${rHeight})`).call(d3.axisBottom(xRom)).attr("font-size", "10px");
    svgRom.append("g").call(d3.axisLeft(yRom).ticks(5).tickFormat(d => d + "%"));

    const romTooltip = d3.select("#rom-tooltip");

    const affectedPath = svgRom.append("path").attr("class", "line-affected");
    const healthyPath = svgRom.append("path").attr("class", "line-healthy").attr("fill", "none");
    const dotGroup = svgRom.append("g");

    function drawRomChart(sensorKey) {
        const healthyVal = healthyRefs[sensorKey];
        const insight = clinicalInsights[sensorKey];

        document.getElementById("deep-dive").classList.add("active");
        document.getElementById("dd-title").textContent = `Diepte Analyse: ${insight.title}`;
        document.getElementById("dd-note").textContent = insight.note;
        document.getElementById("dd-exercise").textContent = insight.exercise;
        
        const lastAffectedVal = calculateROM(last.segments[sensorKey]);
        const verschil = healthyVal - lastAffectedVal;
        const diffEl = document.getElementById("dd-diff");
        diffEl.textContent = `Achterstand: ${verschil}%`;
        diffEl.style.color = verschil > 20 ? "#ef4444" : (verschil > 10 ? "#f59e0b" : "#10b981");

        const lineAffected = d3.line().x(d => xRom(d.sessionId)).y(d => yRom(calculateROM(d.segments[sensorKey]))).curve(d3.curveMonotoneX);
        const lineHealthy = d3.line().x(d => xRom(d.sessionId)).y(d => yRom(healthyVal));

        affectedPath.datum(sessions).transition().duration(800).attr("d", lineAffected);
        healthyPath.datum(sessions).transition().duration(800).attr("d", lineHealthy);

        const dots = dotGroup.selectAll(".dot").data(sessions);
        
        dots.enter().append("circle").attr("class", "dot")
            .attr("r", 5).attr("fill", "#fb8500").attr("stroke", "#fff").attr("stroke-width", 2)
            .merge(dots)
            .on("mouseover", function(event, d) {
                d3.select(this).attr("r", 8);
                romTooltip.style("opacity", 1).html(`Sessie: ${d.sessionId}<br>ROM: <span style="color:#fb8500">${calculateROM(d.segments[sensorKey])}%</span>`);
            })
            .on("mousemove", function(event) {
                const [x, y] = d3.pointer(event, romContainer.node());
                romTooltip.style("left", `${x}px`).style("top", `${y}px`);
            })
            .on("mouseout", function() {
                d3.select(this).attr("r", 5);
                romTooltip.style("opacity", 0);
            })
            .transition().duration(800)
            .attr("cx", d => xRom(d.sessionId))
            .attr("cy", d => yRom(calculateROM(d.segments[sensorKey])));

        dots.exit().remove();
    }

    d3.select("#sensor-select").on("change", function() {
        drawRomChart(this.value);
    });

    drawRomChart("shoulder");

    const sContainer = d3.select("#sternum-chart");
    const sSize = 220; 
    const center = sSize / 2;

    const svgSternum = sContainer.append("svg").attr("width", sSize).attr("height", sSize);

    svgSternum.append("circle").attr("cx", center).attr("cy", center).attr("r", 100).attr("fill", "#ef4444").attr("fill-opacity", 0.05).attr("stroke", "#e2e8f0");
    svgSternum.append("circle").attr("cx", center).attr("cy", center).attr("r", 65).attr("fill", "#f59e0b").attr("fill-opacity", 0.1).attr("stroke", "#e2e8f0");
    svgSternum.append("circle").attr("cx", center).attr("cy", center).attr("r", 30).attr("fill", "#10b981").attr("fill-opacity", 0.1).attr("stroke", "#e2e8f0");

    svgSternum.append("line").attr("x1", center).attr("y1", 10).attr("x2", center).attr("y2", sSize-10).attr("stroke", "#cbd5e1").attr("stroke-dasharray", "4 4");
    svgSternum.append("line").attr("x1", 10).attr("y1", center).attr("x2", sSize-10).attr("y2", center).attr("stroke", "#cbd5e1").attr("stroke-dasharray", "4 4");

    const scaleS = d3.scaleLinear().domain([-30, 30]).range([-100, 100]);
    const dotX = center + scaleS(sternumData.x);
    const dotY = center + scaleS(sternumData.y);

    const sternumTooltip = d3.select("#sternum-tooltip");

    svgSternum.append("circle")
        .attr("class", "sternum-dot")
        .attr("cx", center).attr("cy", center).attr("r", 0)
        .attr("fill", "#023047").attr("stroke", "#fff").attr("stroke-width", 2)
        .on("mouseover", function(event) {
            d3.select(this).attr("r", 10);
            sternumTooltip.style("opacity", 1).html(`Positie:<br><span style="color:#fb8500">X: ${sternumData.x}°</span><br><span style="color:#38bdf8">Y: ${sternumData.y}°</span>`);
        })
        .on("mousemove", function(event) {
            const [x, y] = d3.pointer(event, sContainer.node());
            sternumTooltip.style("left", `${x}px`).style("top", `${y}px`);
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 8);
            sternumTooltip.style("opacity", 0);
        })
        .transition().delay(500).duration(1000).ease(d3.easeElasticOut)
        .attr("cx", dotX).attr("cy", dotY).attr("r", 8);

}).catch(err => console.error("Fout bij laden JSON:", err));