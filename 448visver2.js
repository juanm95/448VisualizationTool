var filters;
d3.json("./scpd_incidents 3.json", function (error, data) {
    // This function gets called when the request is resolved (either failed or succeeded)
    if (error) {
        // Handle error if there is any
        return console.warn(error);
    }
    // If there is no error, then data is actually ready to use
    // initialize(data)
    visualize(data, filters);
    console.log(data);
});
document.addEventListener("click", function () {
    console.log(document.getElementById("violent").value)
    console.log(document.querySelectorAll(':checked'))
    document.getElementById("nonviolent").value;
})
// Set up size
var width = 750
    , height = width;

// Set up projection that map is using
var projection = d3.geo.mercator()
    .center([-122.433701, 37.767683]) // San Francisco, roughly
    .scale(225000)
    .translate([width / 2, height / 2]);



// This is the mapping between <longitude, latitude> position to <x, y> pixel position on the map
// projection([lon, lat]) returns [x, y]

// Add an svg element to the DOM
var svg = d3.select("#svg-col").append("svg")
    .attr("width", width)
    .attr("height", height)
    //    .on("click", click);

// Add svg map at correct size, assumes map is saved in a subdirectory called "data"
svg.append("image")
    .attr("width", width)
    .attr("height", height)
    .attr("xlink:href", "./sfmap.svg");

var dragMarker = d3.behavior.drag()
    .on("drag", dragMove)
    .on("dragstart", dragStart)
    .on("dragend", dragEnd);

function dragMove(d) {
    console.log("dragging");
    var x = d3.event.x
        , y = d3.event.y;
    d3.select(this)
        .attr("transform", "translate(" + x + "," + y + ")");
    d3.select(this).x = x
    d3.select(this).y = y
    visualize
}

function dragStart(d) {
    console.log("dragstart");
}

function dragEnd(d) {
    console.log("dragend");
}
// Add the home and work markers
var rectWidth = 30
var rectHeight = 30
var homeStart = "translate(300, 300)"
var workStart = "translate(450, 230)"
var circleStartRadius = 100

function markerInit() {
    home = svg.append("g")
        .attr("transform", function (d) {
            return homeStart
        })
        .call(dragMarker)
    home.append("circle")
        .attr("r", circleStartRadius)
        .attr("fill-opacity", ".2")
        .attr("stroke-width", "3")
        .attr("stroke", "rgb(0, 0, 0)")
    home.append("rect")
        .attr("y", function (d) {
            return (-rectHeight / 2)
        })
        .attr("x", function (d) {
            return (-rectWidth / 2)
        })
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("fill-opacity", "0")
        .attr("stroke-width", "3")
        .attr("stroke", "rgb(0, 0, 0)")
    home.append("text")
        .text("A")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("-webkit-user-select", "none")

    work = svg.append("g")
        .attr("transform", function (d) {
            return workStart
        })
        .call(dragMarker)
    work.append("circle")
        .attr("r", circleStartRadius)
        .attr("fill-opacity", ".2")
        .attr("stroke-width", "3")
        .attr("stroke", "rgb(0, 0, 0)")
    work.append("rect")
        .attr("y", function (d) {
            return (-rectHeight / 2)
        })
        .attr("x", function (d) {
            return (-rectWidth / 2)
        })
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("fill-opacity", "0")
        .attr("stroke-width", "3")
        .attr("stroke", "rgb(0, 0, 0)")

    work.append("text")
        .text("B")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("-webkit-user-select", "none")
}

//visualize data function
function visualize(data, filters) {

    var filtered_data;

    var circles = d3.select("svg")
        .selectAll("circle.dataPoint")
        .data(data.data)

    circles.exit().remove();

    //new elements
    circles.enter().append("circle")
        .filter(function(d) {
            return d.DayOfWeek === "Monday"
        })
        .filter(function(d) {
            console.log(d)
            return d.Resolution === "NONE"
        })
        .attr("class", "dataPoint")
        .attr("cx", function (d) {
            return projection(d.Location)[0];
        })
        .attr("cy", function (d) {
            return projection(d.Location)[1];
        })
        .attr("r", function (d) {
            return 10;
        });
}
//click function
function click() {
    //ignore the click event if suppressed
    if (d3.event.defaultPrevented) {
        return
    }
    //extract the click location
    var point = d3.mouse(this);
    var p = {
        x: point[0]
        , y: point[1]
    };
    //append a new point
    svg.append("circle")
        .attr("cx", p.x)
        .attr("cy", p.y)
        .attr("r", "20px")
        .attr("class", "dot");
}

function dataPointFilter(d) {
    console.log(d)
    if (dataFilter.violent &&  dataIsViolent(d)) {
        if (dataPoint.resolved && dataIsResolved(d)) {
            return true
        }
    }
    if (dataFilter.nonviolent &&  !dataIsViolent(d)) {
        if (dataPoint.resolved && dataIsResolved(d)) {
            return true
        }
    }
    return isInIntersection(d)
}

function isInIntersection(d) {
    return dpIsInRadius(d, window.home) && dpIsInRadius(d, window.work)
}

function dpIsInRadius(d, marker) {
    if (d.IncidentNumber === "130190030") {
        // console.log(marker)
        var projectedCoords = projection(d.Location)
        return true
    }
    return true
}

function getCoordsFromMarker(marker) {
    var translateString = marker[0][0].attributes.transform.value // A string formatted translate(x, y)
    return translateString.match(/\d+/g)
}