import {OpenMeteoModule} from "./api/weather";
import * as d3 from "d3";

const openMeteoModule = new OpenMeteoModule();
openMeteoModule.getCityInfo("Rostov-on-Don").then(res => {
    openMeteoModule.getTemperature(res.latitude,res.longitude).then(data => {
        test(data,res.name);
    });
});

function roundMinutes(date) {
    
    date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
    date.setMinutes(0, 0, 0); // Resets also seconds and milliseconds

    return date;
}

function getDataStructure(data) {
    const newData = [];
    for (var i = 0; i < data.hourly.time.length; i++) {
        newData[i] = {time:data.hourly.time[i],temp:data.hourly.temperature_2m[i]};
    };
    return newData;
};

function timeToMs(data) {
    return data.hourly.time.map(t=>new Date(t).getTime());
};

function test(data,name) {
    console.log(data);
    const dates = timeToMs(data);
    const d = getDataStructure(data);
    
    const margin = { left: 120, right: 120, top: 60, bottom: 30 };
    const width = document.querySelector("body").clientWidth/2, height = 400;
    const ticks = 10;

    const svg = d3.select("body").append('svg').attr("viewBox", [0, 0, width, height]);
    const x_scale = d3.scaleTime().range([margin.left, width - margin.right]);
    const y_scale = d3.scaleLinear().range([height - margin.bottom - margin.top, margin.top]);
    const x_label = "Day";
    const y_label = "Temperature";
    const location_name = name;
    
    // add title
    svg.append("text")
    .attr("class", "svg_title")
    .attr("x", (width - margin.right + margin.left) / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "22px")
    .text(`${y_label} in ${location_name}`);
    
    // add y label
    svg.append("text")
    .attr("text-ancho", "middle")
    .attr(
    "transform",
    `translate(${margin.left - 50}, ${
        (height - margin.top - margin.bottom + 180) / 2
    }) rotate(-90)`
    )
    .style("font-size", "26px")
    .text(y_label);

    // add x label
    svg.append("text")
    .attr("class", "svg_title")
    .attr("x", (width - margin.right + margin.left) / 2)
    .attr("y", height - margin.bottom - margin.top + 60)
    .attr("text-anchor", "middle")
    .style("font-size", "26px")
    .text(x_label);

    const start_time = (d) => new Date(d.time);
    const temperature = (d) => d.temp;

    const line_generator = d3.line()
    .x((d) => x_scale(start_time(d)))
    .y((d) => y_scale(temperature(d)))
    .curve(d3.curveBasis);

    const minMaxDates = d3.extent(d, start_time);
    // set the domain 
    x_scale.domain(minMaxDates).nice(5);
    y_scale.domain(d3.extent(d, temperature)).nice(5);

    // axis
    const x_axis = d3.axisBottom()
    .scale(x_scale)
    .tickPadding(10)
    .ticks(5)
    .tickSize(-height + margin.top * 2 + margin.bottom);

    const y_axis = d3.axisLeft()
    .scale(y_scale)
    .tickPadding(5)
    .ticks(5, ".1")
    .tickSize(-width + margin.left + margin.right);

    // reform x ticks so that they'll look like Month Day
    x_axis.tickFormat((d) => {
        return d.toDateString().substr(4,6);
    });

    // add celsius icon
    y_axis.tickFormat((d) => {
        return d + data.hourly_units.temperature_2m;
    });

    // add the line path
    svg.append("path")
    .datum(d)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line_generator(d));

    // add x axis
    svg
    .append("g")
    .style("font", "7px times")
    .attr("transform", `translate(0,${height - margin.bottom - margin.top})`)
    .call(x_axis);

    // add y axis
    svg
    .append("g")
    .style("font", "7px times")
    .attr("transform", `translate(${margin.left},0)`)
    .call(y_axis);

    const focus = svg
    .append('g')
    .append('circle')
    .style("fill", "blue")
    .attr("stroke", "black")
    .attr('r', 3)
    .style("opacity", 0);

    // Create the text that travels along the curve of chart
    const focusText = svg
    .append('g')
    .append('text')
    .style("opacity", 0)
    .attr("text-anchor", "left")
    .attr("alignment-baseline", "middle");

    svg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', 10)
    .attr('height', 10);

    svg
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

    function mouseover() {
        focus.style("opacity", 1)
        focusText.style("opacity",1)
    };

    function mousemove(event) {
        // recover coordinate we need
        var x = x_scale.invert(d3.pointer(event)[0]);
        console.log(x);
        if ((minMaxDates[0] <= x) && (x <= minMaxDates[1])) {
            var i = dates.indexOf(roundMinutes(x).getTime());
            curData = new Date(data.hourly.time[i]);
            console.log(x);
            curTemp = data.hourly.temperature_2m[i];
            focus
              .attr("cx", x_scale(curData))
              .attr("cy", y_scale(curTemp))
            focusText
              .html(curData.toDateString().substr(4,6) + "  -  " + curTemp + data.hourly_units.temperature_2m)
              .attr("x", x_scale(curData)+15)
              .attr("y", y_scale(curTemp))
        }
    };

    function mouseout() {
        focus.style("opacity", 0)
        focusText.style("opacity", 0)
    };

}
