/*************** GLOBAL VARIABLES *******************/
var filters = new Set();
// Set up size
var width = 750
    , height = width;
var MARKER_SIZE = 20;
var CIRCLE_RADIUS = 2;
var CIRCLE_STROKE_WIDTH = "1px"
var globalData;
var markerData = [
    {
        "name": "home"
        , "x": 259
        , "y": 389
        , "r": 60
    }, {
        "name": "work"
        , "x": 308
        , "y": 344
        , "r": 60
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
    updateMarkers();
});
document.addEventListener("click", function () {
    addSelectedFiltersToFilterSet()
    updateDataPoints(globalData, filters)
});
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
/******************** D3 **********************/
function updateMarkers() {
    var markers = d3.select("svg")
        .selectAll("g")
        .data(markerData)
    markers.exit().remove()
    var newMarkers = markers.enter().append("g")

    newMarkers.call(dragMarker)

    newMarkers.attr("transform", function (d) {
        return "translate(" + d.x + ", " + d.y + ")"
    })

    newMarkers.append("circle")
        .attr("r", function (d) {
            return d.r
        })
        .attr("fill-opacity", ".1")
        .attr("stroke-width", "1")
        .attr("stroke", "rgb(0, 0, 0)")

    //    newMarkers.append("rect")
    //        .attr("width", MARKER_SIZE)
    //        .attr("height", MARKER_SIZE)
    //        .attr("y", function (d) {
    //            return (-MARKER_SIZE / 2)
    //        })
    //        .attr("x", function (d) {
    //            return (-MARKER_SIZE / 2)
    //        })
    //        .attr("fill-opacity", "0")
    //        .attr("stroke-width", "3")
    //        .attr("stroke", "rgb(0, 0, 0)")

    newMarkers.append("text")
        .text(function (d) {
            return d.name.toUpperCase().charAt(0)
        })
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-family", "Avenir")
        .attr("fill", "rgb(36, 143, 36)")
        .style("-webkit-user-select", "none");

    markers.attr("transform", function (d) {
        return "translate(" + d.x + ", " + d.y + ")"
    })
    markers.select("circle").attr("r", function (d) {
        return d.r
    })
}

function updateDataPoints(data, filters) {

    //violent filtering
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
    //resolution filtering
    filtered_data = filtered_data.filter(function (d) {
        var retVal = false
        if (filters.has("resolved")) {
            retVal = dataIsResolved(d)
        }
        if (!retVal && filters.has("notresolved")) {
            retVal = !dataIsResolved(d)
        }
        return retVal
    });

    //time filtering
    filtered_data = filtered_data.filter(function (d) {
        var retVal = false
        if (filters.has("dusk") || filters.has("day") || filters.has("evening")) {
            retVal = dataIsWithinTIme(d)
        }

        return retVal
    });
    // proximity filtering
    filtered_data = filtered_data.filter(function (d) {
        for (var i = markerData.length - 1; i >= 0; i--) {
            if (!dataIsInRange(d, markerData[i])) {
                return false
            }
        }
        return true
    });
    var circles = d3.select("svg")
        .selectAll("circle.dataPoint")
        .data(filtered_data);
    //new elements
    circles.exit().remove();

    circles.enter()
        .insert("circle", "g") // Circles under markers
        //        .append("circle") // Circles over markers
        .attr("class", "dataPoint")
        .attr("fill", function (d) {
            if (dataIsViolent(d)) {
                return "#e74c3c";
            } else {
                return "#3498db";
            }

        })
        .attr("stroke", function (d) {
            if (dataIsResolved(d)) {
                return "black";
            } else {
                return "#f1c40f";
            }
        })
        .attr("stroke-width", CIRCLE_STROKE_WIDTH)

    .attr("cx", function (d) {
            return projection(d.Location)[0];
        })
        .attr("cy", function (d) {
            return projection(d.Location)[1];
        })
        .attr("r", function (d) {
            return CIRCLE_RADIUS;
        });

    circles
        .attr("cx", function (d) {
            return projection(d.Location)[0];
        })
        .attr("cy", function (d) {
            return projection(d.Location)[1];
        })
        .attr("r", function (d) {
            return CIRCLE_RADIUS;
        })
        .attr("fill", function (d) {
            if (dataIsViolent(d)) {
                return "#e74c3c";
            } else {
                return "#3498db";
            }

        })
        .attr("stroke", function (d) {
            if (dataIsResolved(d)) {
                return "black";
            } else {
                return "#f1c40f";
            }
        });
}
/************** INTERACTIONS ***********************/
function dragMove(d) {
    d3.event.sourceEvent.stopPropagation();
    var x = d3.event.x
        , y = d3.event.y;
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    updateDataPoints(globalData, filters)
    updateMarkers()
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
    if (resolvedStatus === "NONE") {
        return false;
    } else {
        return true;
    }
}

//check if crime data point is within selected time range or not
function dataIsWithinTIme(d) {
    //get crime time 
    var time = d.Time;
    //get crime time in hours (0-23)
    var hour = parseInt(time.substring(0, 2));
    //var crimeTime = d.Date.getHours();
    if (filters.has("dusk")) {
        if (hour <= 7) {
            return true;

        }
    }
    if (filters.has("day")) {
        if (8 <= hour && hour <= 15) {
            return true;
        }
    }
    if (filters.has("evening")) {
        if (16 <= hour && hour <= 23) {
            return true;
        }
    }
    return false;
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

    //append a new point
    svg.append("circle")
        .attr("cx", p.x)
        .attr("cy", p.y)
        .attr("r", "20px")
        .attr("class", "dot");
}