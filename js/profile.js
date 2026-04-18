// Hardcoded data
const labData = [
        {date: "Okt", val: 4.2},
        {date: "Nov", val: 3.8},
        {date: "Dec", val: 2.9},
        {date: "Jan", val: 1.8}
    ];

    const width = 350, height = 150, margin = 30;
    const svg = d3.select("#labChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scalePoint().range([margin, width-margin]).domain(labData.map(d => d.date));
    const y = d3.scaleLinear().range([height-margin, margin]).domain([0, 5]);

    svg.append("g")
        .attr("transform", `translate(0,${height-margin})`)
        .call(d3.axisBottom(x));

    svg.append("path")
        .datum(labData)
        .attr("fill", "none")
        .attr("stroke", "#219ebc")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.val))
        );

    svg.selectAll("circle")
        .data(labData)
        .enter().append("circle")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.val))
        .attr("r", 4)
        .attr("fill", "#023047");