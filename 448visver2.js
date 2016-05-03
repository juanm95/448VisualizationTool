/*************** GLOBAL VARIABLES *******************/
var filters = new Set();
// Set up size
var width = 750
    , height = width;
var globalData;
var markerData = [
    {
        "name": "home"
        , "x": 0
        , "y": 0
        , "r": 50
    }
    , {
        "name": "work"
        , "x": 50
        , "y": 50
        , "r": 50
    }
]

var category = {
    "ARSON": "violent"
    , "ASSAULT": "violent"
    , "BURGLARY": "violent"
    , "DISORDERLY CONDUCT": "violent"
    , "DRIVING UNDER THE INFLUENCE": "violent"
    , "DRUG/NARCOTIC": "nonviolent"
    , "DRUNKENNESS": "violent"
    , "EXTORTION": "nonviolent"
    , "FAMILY OFFENSES": "violent"
    , "FORGERY/COUNTERFEITING": "violent"
    , "FRAUD": "nonviolent"
    , "KIDNAPPING": "violent"
    , "LARCENY/THEFT": "violent"
    , "LIQUOR LAWS": "nonviolent"
    , "LOITERING": "nonviolent"
    , "MISSING PERSON": "violent"
    , "NON-CRIMINAL": "nonviolent"
    , "OTHER OFFENSES": "nonviolent"
    , "SEX OFFENSES, FORCIBLE": "violent"
    , "ROBBERY": "violent"
    , "SECONDARY CODES": "nonviolent"
    , "STOLEN PROPERTY": "violent"
    , "SUICIDE": "violent"
    , "SUSPICIOUS OCC": "nonviolent"
    , "TRESPASS": "violent"
    , "VANDALISM": "violent"
    , "VEHICLE THEFT": "violent"
    , "WARRANTS": "nonviolent"
    , "WEAPON LAWS": "violent"
};
/*************** Run ******************************/
addSelectedFiltersToFilterSet(); 
d3.json("./scpd_incidents 3.json", function (error, data) {
    // This function gets called when the request is resolved (either failed or succeeded)
    if (error) {
        // Handle error if there is any
        return console.warn(error);
    }
    // If there is no error, then data is actually ready to use
    // initialize(data)
    globalData = data
    updateDataPoints(data, filters);
});
document.addEventListener("click", function () {
        addSelectedFiltersToFilterSet(selectedFilters)
        updateDataPoints(globalData, filters)
    })
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
updateMarkers();
/******************** D3 **********************/
function updateMarkers() {
    var markers = d3.select("svg")
        .selectAll("rect")
        .data(markerData)

    markers.enter()
        .append("rect")
        .attr("x", function (d) {
            return d.x
        })
        .attr("y", function (d) {
            return d.y
        })
        .attr("fill", "blue")
        .attr("width", function (d) {
            return d.r
        })
        .attr("height", function (d) {
            return d.r
        })
        .attr("fill-opacity", ".2")
        .call(dragMarker)
    markers
        .attr("x", function (d) {
            return d.x
        })
        .attr("y", function (d) {
            return d.y
        })
        .attr("width", function (d) {
            return d.r
        })
}

function updateDataPoints(data, filters) {
    console.log(data)

    var filtered_data = data.data.filter(function (d) {
        var retVal = false
        if (filters.has("violent")) {
            retVal = dataIsViolent(d)
        }
        if (!retVal && filters.has("nonviolent")) {
            retVal = !dataIsViolent(d)
        }
        return retVal
    });
    filtered_data = filtered_data.filter(function (d) {
        for (var i = markerData.length - 1; i >= 0; i--) {
            if (!dataIsInRange(d, markerData[i])) {
                return false
            }
        }
        return true
    });
    console.log(filtered_data)
    var circles = d3.select("svg")
        .selectAll("circle.dataPoint")
        .data(filtered_data);
    //new elements

    circles.enter()
        .append("circle")
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
    circles.exit().remove();
}
/************** INTERACTIONS ***********************/
function dragMove(d) {
    var x = d3.event.x
        , y = d3.event.y;
    d.x = x
    d.y = y
    updateMarkers()
    updateDataPoints(globalData, filters)
}

function dragStart(d) {}

function dragEnd(d) {}

/************** FILTER FUNCTIONS *******************/
function dataIsViolent(d) {
    //get category
    var currCategory = d.Category;
    //get violent status
    var state = category[currCategory];
    return (state === "violent");
}

//check if crime data point is resolved or not
function dataIsResolved(d) {
    //get resolved status
    var resolvedStatus = d.Resolution;
    if ("resolvedStatus" === "NONE") {
        return false;
    } else {
        return true;
    }
}



function dataIsInRange(d, m) {
    if (distance(d, m) > m.r) {
        return false
    }
    return true
}

/*************** HELPER FUNCTIONS ******************/
function distance(data, marker) {
    var a = projection(data.Location)[0] - marker.x
    var b = projection(data.Location)[1] - marker.y
    return Math.sqrt(a * a + b * b)
}

function addSelectedFiltersToFilterSet() {
    var selectedFilters = document.querySelectorAll(':checked')
    filters = new Set();
    for (var i = 0; i < selectedFilters.length; ++i) {
        filters.add(selectedFilters[i].id) // Calling myNodeList.item(i) isn't necessary in JavaScript
    }
}

/************** DEAD KITTEN PILE *********************/
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