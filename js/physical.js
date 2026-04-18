d3.dsv(";", "ZIVRA_sessie1_verwerkt.csv", function(d) {
    if (!d.PacketCounter || d.PacketCounter.trim() === "") return null;

    const parseNum = (val) => val ? parseFloat(val.replace(',', '.')) : 0;
    
    const quatToDeg = (q) => {
        if(q === 0) return 0;
        let clamped = Math.max(-1, Math.min(1, q));
        return Math.abs(2 * Math.acos(clamped) * (180 / Math.PI));
    };

    // --- SLIMME PARSER VOOR STERNUM ---
    const parseSternum = (val) => {
        let q = parseNum(val);
        if (q > 1.0 || q < -1.0) return q * (180 / Math.PI);
        return quatToDeg(q);
    };

    return {
        packet: +d.PacketCounter,
        shoulder_l: parseNum(d.SchouderLinks_EUL),
        upper_l: quatToDeg(parseNum(d.BovenLinks_QUAT)),
        lower_l: parseNum(d.OnderLinks_EUL),
        shoulder_r: quatToDeg(parseNum(d.SchouderRechts_QUAT)),
        upper_r: quatToDeg(parseNum(d.BovenRechts_QUAT)),
        lower_r: quatToDeg(parseNum(d.OnderRechts_QUAT)),
        sternum_deg: parseSternum(d.Sternum_QUAT),
        sternum_acc: parseNum(d.Sternum_ACC) 
    };
}).then(data => {
    if (!data || data.length === 0) return;

    // Filter calibration frames
    while (data.length > 0 && data[0].sternum_acc === 0) {
        data.shift();
    }

    // Unwrap Eulers
    const unwrap = (val, prev) => {
        let diff = val - prev;
        while (diff > 180) { val -= 360; diff = val - prev; }
        while (diff < -180) { val += 360; diff = val - prev; }
        return val;
    };

    for (let i = 1; i < data.length; i++) {
        data[i].shoulder_l = unwrap(data[i].shoulder_l, data[i-1].shoulder_l);
        data[i].lower_l = unwrap(data[i].lower_l, data[i-1].lower_l);
    }

    const start = { ...data[0] };
    
    // Normalise data for somewhat accurate visuals
    data.forEach(d => {
        d.shoulder_l = d.shoulder_l - start.shoulder_l;
        d.shoulder_r = d.shoulder_r - start.shoulder_r;
        d.upper_l = d.upper_l - start.upper_l;
        d.upper_r = d.upper_r - start.upper_r;
        d.lower_l = d.lower_l - start.lower_l;
        d.lower_r = d.lower_r - start.lower_r;
        d.sternum_deg = Math.abs(d.sternum_deg - start.sternum_deg); 
    });

    const plotData = data.filter((d, i) => i % 4 === 0);

    const calcROM = (key) => Math.abs(d3.max(data, d => d[key]) - d3.min(data, d => d[key]));
    
    const romStats = {
        shoulder: { l: calcROM('shoulder_l'), r: calcROM('shoulder_r') },
        upperArm: { l: calcROM('upper_l'), r: calcROM('upper_r') },
        lowerArm: { l: calcROM('lower_l'), r: calcROM('lower_r') }
    };

    const avgLeft = (romStats.shoulder.l + romStats.upperArm.l + romStats.lowerArm.l) / 3;
    const avgRight = (romStats.shoulder.r + romStats.upperArm.r + romStats.lowerArm.r) / 3;
    const symmetry = avgRight > 0 ? Math.round((avgLeft / avgRight) * 100) : 0;

    const maxSternumDeviation = d3.max(data, d => d.sternum_deg);
    const postureScore = Math.max(0, Math.round(100 - (maxSternumDeviation * 2.5)));

    d3.select("#symmetry-score").text(`${symmetry}%`).attr("class", `stat-value ${symmetry > 80 ? 'trend-up' : 'trend-down'}`);
    d3.select("#posture-score").text(`${postureScore}/100`).attr("class", `stat-value ${postureScore > 75 ? 'trend-up' : 'trend-down'}`);
    d3.select("#compensation-risk").text(postureScore < 70 ? "HOOG (Instabiel)" : "Normaal").style("color", postureScore < 70 ? "#ef4444" : "#10b981");

    const romContainer = d3.select("#rom-compare-chart");
    const rMargin = {top: 20, right: 20, bottom: 30, left: 40},
          rWidth = 500 - rMargin.left - rMargin.right,
          rHeight = 220 - rMargin.top - rMargin.bottom;

    const svgRom = romContainer.append("svg")
        .attr("viewBox", `0 0 ${rWidth + rMargin.left + rMargin.right} ${rHeight + rMargin.top + rMargin.bottom}`)
        .append("g").attr("transform", `translate(${rMargin.left},${rMargin.top})`);

    const xRom = d3.scaleLinear().domain(d3.extent(plotData, d => d.packet)).range([0, rWidth]);
    const yRom = d3.scaleLinear().range([rHeight, 0]); 

    svgRom.append("g").attr("class", "grid-line-y").style("stroke-opacity", "0.2");
    svgRom.append("g").attr("transform", `translate(0,${rHeight})`).call(d3.axisBottom(xRom).ticks(5)).attr("font-size", "10px");
    
    const yAxisGroup = svgRom.append("g");
    const dynamicGroup = svgRom.append("g"); 
    const romTooltip = d3.select("#rom-tooltip");
    const bisectPacket = d3.bisector(d => d.packet).left;

    function drawRomChart(sensorKey) {
        dynamicGroup.html(""); 

        const props = {
            shoulder: { l: 'shoulder_l', r: 'shoulder_r', title: 'Schouder' },
            upperArm: { l: 'upper_l', r: 'upper_r', title: 'Bovenarm' },
            lowerArm: { l: 'lower_l', r: 'lower_r', title: 'Onderarm' }
        }[sensorKey];

        const maxL = Math.round(romStats[sensorKey].l);
        const maxR = Math.round(romStats[sensorKey].r);
        const verschil = Math.abs(maxR - maxL);

        document.getElementById("dd-title").textContent = `Klinische Inzichten: ${props.title}`;
        document.getElementById("dd-note").textContent = `Totale bewegingsuitslag (ROM) linkerzijde: ${maxL}°, tegenover ${maxR}° rechts.`;
        document.getElementById("dd-exercise").textContent = verschil > 20 ? "Gerichte mobilisatie vereist." : "Keurige functionele balans.";
        
        const diffEl = document.getElementById("dd-diff");
        diffEl.textContent = verschil > 15 ? `Links wijkt af: ${verschil}°` : "Symmetrisch";
        diffEl.style.color = verschil > 20 ? "#ef4444" : (verschil > 15 ? "#f59e0b" : "#10b981");

        const yMin = d3.min(plotData, d => Math.min(d[props.l], d[props.r]));
        const yMax = d3.max(plotData, d => Math.max(d[props.l], d[props.r]));
        const padding = (yMax - yMin) * 0.1 || 10; 

        yRom.domain([yMin - padding, yMax + padding]);
        
        yAxisGroup.transition().duration(800).call(d3.axisLeft(yRom).ticks(6).tickFormat(d => Math.round(d) + "°"));
        svgRom.select(".grid-line-y").transition().duration(800).call(d3.axisLeft(yRom).tickSize(-rWidth).tickFormat(""));

        dynamicGroup.append("line")
            .attr("x1", 0).attr("x2", rWidth).attr("y1", yRom(0)).attr("y2", yRom(0))
            .style("stroke", "#94a3b8").style("stroke-width", "2px")
            .style("opacity", 0).transition().duration(1000).style("opacity", 1);

        const lineHealthy = d3.line().x(d => xRom(d.packet)).y(d => yRom(d[props.r])).curve(d3.curveMonotoneX);
        const lineAffected = d3.line().x(d => xRom(d.packet)).y(d => yRom(d[props.l])).curve(d3.curveMonotoneX);

        dynamicGroup.append("path").datum(plotData).attr("class", "line-healthy").attr("fill", "none").attr("d", lineHealthy);
        dynamicGroup.append("path").datum(plotData).attr("class", "line-affected").attr("fill", "none").attr("d", lineAffected);

        const focus = dynamicGroup.append("g").style("display", "none");
        focus.append("line").attr("class", "hover-line").attr("y1", 0).attr("y2", rHeight);
        focus.append("circle").attr("class", "hover-dot").attr("r", 5).attr("fill", "#fb8500").attr("id", "dot-affected"); 
        focus.append("circle").attr("class", "hover-dot").attr("r", 5).attr("fill", "#8ecae6").attr("id", "dot-healthy"); 

        dynamicGroup.append("rect").attr("width", rWidth).attr("height", rHeight).style("fill", "none").style("pointer-events", "all")
            .on("mouseover", () => { focus.style("display", null); activeSternumDot.style("opacity", 1); })
            .on("mouseout", () => { focus.style("display", "none"); romTooltip.style("opacity", 0); activeSternumDot.style("opacity", 0); d3.select("#sternum-val").text(""); })
            .on("mousemove", mousemove);

        function mousemove(event) {
            const x0 = xRom.invert(d3.pointer(event)[0]);
            const i = bisectPacket(plotData, x0, 1);
            if (!plotData[i - 1] || !plotData[i]) return;
            const d = x0 - plotData[i - 1].packet > plotData[i].packet - x0 ? plotData[i] : plotData[i - 1];

            const valL = Math.round(d[props.l]);
            const valR = Math.round(d[props.r]);
            const diffVal = Math.abs(valR - valL);
            const diffColor = diffVal > 15 ? "#ef4444" : "#10b981";

            focus.select(".hover-line").attr("transform", `translate(${xRom(d.packet)}, 0)`);
            focus.select("#dot-affected").attr("transform", `translate(${xRom(d.packet)}, ${yRom(d[props.l])})`);
            focus.select("#dot-healthy").attr("transform", `translate(${xRom(d.packet)}, ${yRom(d[props.r])})`);

            const dev = d.sternum_deg;
            const sx = center + (scaleS(dev) * Math.sin(d.packet));
            const sy = center + (scaleS(dev) * Math.cos(d.packet));
            
            activeSternumDot.attr("cx", sx).attr("cy", sy);
            d3.select("#sternum-val").text(`${Math.round(dev)}°`);

            const [mouseX, mouseY] = d3.pointer(event, romContainer.node());
            romTooltip.style("opacity", 1).style("left", `${mouseX}px`).style("top", `${mouseY}px`)
                .html(`
                    <div style="border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">Pakket: ${d.packet}</div>
                    <div style="display: flex; justify-content: space-between; gap: 16px; margin-bottom: 4px;">
                        <span style="color: #8ecae6;">Gezond:</span> <span>${valR}°</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; gap: 16px;">
                        <span style="color: #fb8500;">Aangedaan:</span> <span>${valL}°</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; gap: 16px; margin-top: 8px; color: ${diffColor}; font-weight: 700;">
                        <span>Verschil:</span> <span>${diffVal}°</span>
                    </div>
                `);
        }
    }

    const sContainer = d3.select("#sternum-chart");
    const sSize = 220, center = sSize / 2;
    const svgSternum = sContainer.append("svg").attr("width", sSize).attr("height", sSize);

    svgSternum.append("circle").attr("cx", center).attr("cy", center).attr("r", 100).attr("fill", "#ef4444").attr("fill-opacity", 0.05).attr("stroke", "#e2e8f0");
    svgSternum.append("circle").attr("cx", center).attr("cy", center).attr("r", 65).attr("fill", "#f59e0b").attr("fill-opacity", 0.1).attr("stroke", "#e2e8f0");
    svgSternum.append("circle").attr("cx", center).attr("cy", center).attr("r", 30).attr("fill", "#10b981").attr("fill-opacity", 0.1).attr("stroke", "#e2e8f0");

    svgSternum.append("line").attr("x1", center).attr("y1", 10).attr("x2", center).attr("y2", sSize-10).attr("stroke", "#cbd5e1").attr("stroke-dasharray", "4 4");
    svgSternum.append("line").attr("x1", 10).attr("y1", center).attr("x2", sSize-10).attr("y2", center).attr("stroke", "#cbd5e1").attr("stroke-dasharray", "4 4");

    const scaleS = d3.scaleLinear().domain([0, 40]).range([0, 100]);
    
    svgSternum.selectAll(".sternum-wobble").data(plotData).enter().append("circle").attr("class", "sternum-wobble")
        .attr("r", 2).attr("fill", "#94a3b8").attr("opacity", 0).attr("cx", center).attr("cy", center)
        .transition().delay((d, i) => i * 4).duration(400).attr("opacity", 0.4)
        .attr("cx", d => center + (scaleS(d.sternum_deg) * Math.sin(d.packet)))
        .attr("cy", d => center + (scaleS(d.sternum_deg) * Math.cos(d.packet)));

    const activeSternumDot = svgSternum.append("circle")
        .attr("r", 8).attr("fill", "#023047").attr("stroke", "#fff").attr("stroke-width", 2)
        .style("opacity", 0).style("pointer-events", "none");

    svgSternum.append("text").attr("id", "sternum-val").attr("x", center).attr("y", center + 4).attr("text-anchor", "middle")
        .attr("font-size", "12px").attr("font-weight", "800").attr("fill", "#023047").style("pointer-events", "none");

    d3.select("#sensor-select").on("change", function() { drawRomChart(this.value); });
    drawRomChart("shoulder");

}).catch(err => console.error("Fout bij laden van de ZIVRA CSV:", err));