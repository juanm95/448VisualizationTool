var filters;

d3.json("./scpd_incidents 3.json", function (error, data) {
    // This function gets called when the request is resolved (either failed or succeeded)
    if (error) {
        // Handle error if there is any
        return console.warn(error);
    }
    // If there is no error, then data is actually ready to use
    visualize(data, filters);
    console.log(data);
});

// Set up size
var width = 750, height = width;

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
    .on("click", click);

// Add svg map at correct size, assumes map is saved in a subdirectory called "data"
svg.append("image")
    .attr("width", width)
    .attr("height", height)
    .attr("xlink:href", "./sfmap.svg");
// This code is going to run before data is loaded, and you cannot use the data here
//nonDataRelatedStuff();

//visualize data function
function visualize(data, filters) {

    var filtered_data;
    var circles = d3.select("svg")
        .selectAll("circle")
        .data(data.data);

    circles.exit().remove();

    //new elements
    circles.enter().append("circle")
        .call(drag)
        .on("click", click)
        .attr("cx", function (d) {
            return projection(d.Location)[0];
        });

    circles
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
        x: point[0],
        y: point[1]
    };
    //append a new point
    svg.append("circle")
        .attr("cx", p.x)
        .attr("cy", p.y)
        .attr("r", "20px")
        .attr("class", "dot");
}

//drag function
var drag = d3.behavior.drag()
    .on("drag", dragMove)
    .on("dragstart", dragStart)
    .on("dragend", dragEnd);

function dragMove(d) {
    console.log("dragging");
    var x = d3.event.x, y = d3.event.y;
    d3.select(this) //.attr("tranform", "translate("+x+","+y+")");
        .attr("cx", x)
        .attr("cy", y)
        //.attr("r", "20px")
        .attr("class", "dot");

}

function dragStart(d) {
    console.log("dragstart");
}

function dragEnd(d) {
    console.log("dragend");
}