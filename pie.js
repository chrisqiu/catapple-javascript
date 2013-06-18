catapple_javascript_PieChart = function() {
    var e = this.getElement();

    this.onStateChange = function() {
    	var width = this.getState().weight;
    	var height = this.getState().height;
    	var radius = this.getState().radius;
        var data = this.getState().data;
        var textOffset = this.getState().textOffset;
        var tweenDuration = this.getState().tweenDuration;
    };
};

var h = 800;
var w = 1000;
var r = 100;
var ir = 0;
var textOffset = 160;
var tweenDuration = 300;
var strokeColor = "red";

// OBJECTS TO BE POPULATED WITH DATA LATER
var lines, valueLabels, nameLabels;
var pieData = [];
var oldPieData = [];
var filteredPieData = [];

// D3 helper function to populate pie slice parameters from array data
var donut = d3.layout.pie().value(function(d) {
    return d.octetTotalCount;
});

// D3 helper function to create colors from an ordinal scale
var color = d3.scale.category20();

// D3 helper function to draw arcs, populates parameter "d" in path object
var arc = d3.svg.arc().startAngle(function(d) {
    return d.startAngle;
}).endAngle(function(d) {
    return d.endAngle;
}).innerRadius(ir).outerRadius(r);

// /////////////////////////////////////////////////////////
// GENERATE FAKE DATA /////////////////////////////////////
// /////////////////////////////////////////////////////////

// range of potential values for each item
var arrayRange = 100000;

var arraySize = 15;
var data = d3.range(arraySize).map(fillArray);
function fillArray() {
    return {
        port : "操作系統" + Math.random(),
        octetTotalCount : Math.ceil(Math.random() * (arrayRange))
    };
}

// /////////////////////////////////////////////////////////
// CREATE VIS & GROUPS ////////////////////////////////////
// /////////////////////////////////////////////////////////

var vis = d3.select("#easy-as-pie-chart").append("svg:svg").attr("width", w).attr("height", h);

// GROUP FOR ARCS/PATHS
var arc_group = vis.append("svg:g").attr("class", "arc").attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

// GROUP FOR LABELS
//var label_group = vis.append("svg:g").attr("class", "label_group").attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");
var label_group = vis.append("svg:g").attr("class", "label_group").attr("transform", "translate(" + ((w / 2) - 0) + "," + ((h / 2) - 0) + ")");

// GROUP FOR CENTER TEXT
var center_group = vis.append("svg:g").attr("class", "center_group").attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

// PLACEHOLDER GRAY CIRCLE
var paths = arc_group.append("svg:circle").attr("fill", "#EFEFEF").attr("r", r);

// /////////////////////////////////////////////////////////
// CENTER TEXT ////////////////////////////////////////////
// /////////////////////////////////////////////////////////

// WHITE CIRCLE BEHIND LABELS
// var whiteCircle = center_group.append("svg:circle").attr("fill", "white").attr("r", ir);

// "TOTAL" LABEL
//var totalLabel = center_group.append("svg:text").attr("class", "label").attr("dy", -15).attr("text-anchor", "middle")// text-align: right
//.text("TOTAL");

// TOTAL TRAFFIC VALUE
var totalValue = center_group.append("svg:text").attr("class", "total").attr("dy", 7).attr("text-anchor", "middle")// text-align: right
.text("Waiting...");

// UNITS LABEL
//var totalUnits = center_group.append("svg:text").attr("class", "units").attr("dy", 21).attr("text-anchor", "middle")// text-align: right
//.text("kb");

// /////////////////////////////////////////////////////////
// STREAKER CONNECTION ////////////////////////////////////
// /////////////////////////////////////////////////////////

window.setTimeout(update, 500, data);

function update(data) {
    oldPieData = filteredPieData;
    pieData = donut(data);

    var totalOctets = 0;
    filteredPieData = pieData.filter(filterData);
    function filterData(element, index, array) {
        element.name = data[index].port;
        element.value = data[index].octetTotalCount;
        totalOctets += element.value;
        return (element.value > 0);
    }

//    if (filteredPieData.length > 0 && oldPieData.length > 0) {
        // REMOVE PLACEHOLDER CIRCLE
        arc_group.selectAll("circle").remove();

        totalValue.text(function() {
            return null;
//            var kb = totalOctets / 1024;
//            return kb.toFixed(1);
            // return bchart.label.abbreviated(totalOctets * 8);
        });

        // DRAW ARC PATHS
        paths = arc_group.selectAll("path").data(filteredPieData);
        paths.enter().append("svg:path").attr("stroke", "white").attr("stroke-width", 0.5).attr("fill", function(d, i) {
            return color(i);
        }).transition().duration(tweenDuration).attrTween("d", pieTween);
        paths.transition().duration(tweenDuration).attrTween("d", pieTween);
        paths.exit().transition().duration(tweenDuration).attrTween("d", removePieTween).remove();

        // DRAW TICK MARK LINES FOR LABELS
        lines = label_group.selectAll("line").data(filteredPieData);
        lines.enter().append("svg:line")
        	.attr("x1", 0).attr("x2", 0)
        	.attr("y1", -r - 150).attr("y2", -r - 8)
        	.attr("stroke", strokeColor)
        	.attr("transform", function(d) {
        		return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
        	});
        lines.transition().duration(tweenDuration).attr("transform", function(d) {
            return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
        });
        lines.exit().remove();

        // DRAW LABELS WITH PERCENTAGE VALUES
        valueLabels = label_group.selectAll("text.value").data(filteredPieData).attr("dy", function(d) {
            if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                return 5;
            } else {
                return -7;
            }
        }).attr("text-anchor", function(d) {
            if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
                return "beginning";
            } else {
                return "end";
            }
        }).text(function(d) {
            var percentage = (d.value / totalOctets) * 100;
            return percentage.toFixed(1) + "%";
        });

        valueLabels.enter().append("svg:text").attr("class", "value").attr("transform", function(d) {
            return "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (r + textOffset) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (r + textOffset) + ")";
        }).attr("dy", function(d) {
            if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                return 5;
            } else {
                return -7;
            }
        }).attr("text-anchor", function(d) {
            if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
                return "beginning";
            } else {
                return "end";
            }
        }).text(function(d) {
            var percentage = (d.value / totalOctets) * 100;
            return percentage.toFixed(1) + "%";
        });

        valueLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

        valueLabels.exit().remove();

        // DRAW LABELS WITH ENTITY NAMES
        nameLabels = label_group.selectAll("text.units").data(filteredPieData).attr("dy", function(d) {
            if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                return 17;
            } else {
                return 5;
            }
        }).attr("text-anchor", function(d) {
            if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
                return "beginning";
            } else {
                return "end";
            }
        }).text(function(d) {
            return d.name;
        });

        nameLabels.enter().append("svg:text").attr("class", "units").attr("transform", function(d) {
            return "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (r + textOffset) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (r + textOffset) + ")";
        }).attr("dy", function(d) {
            if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                return 17;
            } else {
                return 5;
            }
        }).attr("text-anchor", function(d) {
            if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
                return "beginning";
            } else {
                return "end";
            }
        }).text(function(d) {
            return d.name;
        });

        nameLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

        nameLabels.exit().remove();

        // add legend
        var color_hash = {
            0 : ["apple", "green"],
            1 : ["mango", "orange"],
            2 : ["cherry", "red"],
            3 : ["cherry", "black"],
            4 : ["cherry", "blue"],
            5 : ["cherry", "gray"],
            6 : ["cherry", "magenta"],
            7 : ["cherry", "pink"],
            8 : ["cherry", "brown"],
            9 : ["cherry", "silver"]
        };
        var legend = vis.append("g").attr("class", "legend").attr("x", 65).attr("y", h - 90).attr("height", 100).attr("width", 100);
        legend.selectAll('g').data(pieData).enter().append('g').each(function(d, i) {
            var g = d3.select(this);
            g.append("rect").attr("x", 50).attr("y", (h - i * 20) + 20).attr("width", 10).attr("height", 10).style("fill", color_hash[String(i)][1]);
            g.append("text").attr("x", 65).attr("y", (h - i * 20) + 28).attr("height", 30).attr("width", 100).style("fill", color_hash[String(i)][1]).text(color_hash[String(i)][0]);
        });
//    }
}

// /////////////////////////////////////////////////////////
// FUNCTIONS //////////////////////////////////////////////
// /////////////////////////////////////////////////////////

// Interpolate the arcs in data space.
function pieTween(d, i) {
    var s0;
    var e0;
    if (oldPieData[i]) {
        s0 = oldPieData[i].startAngle;
        e0 = oldPieData[i].endAngle;
    } else if (!(oldPieData[i]) && oldPieData[i - 1]) {
        s0 = oldPieData[i - 1].endAngle;
        e0 = oldPieData[i - 1].endAngle;
    } else if (!(oldPieData[i - 1]) && oldPieData.length > 0) {
        s0 = oldPieData[oldPieData.length - 1].endAngle;
        e0 = oldPieData[oldPieData.length - 1].endAngle;
    } else {
        s0 = 0;
        e0 = 0;
    }
    var i = d3.interpolate({
        startAngle : s0,
        endAngle : e0
    }, {
        startAngle : d.startAngle,
        endAngle : d.endAngle
    });
    return function(t) {
        var b = i(t);
        return arc(b);
    };
}

function removePieTween(d, i) {
    s0 = 2 * Math.PI;
    e0 = 2 * Math.PI;
    var i = d3.interpolate({
        startAngle : d.startAngle,
        endAngle : d.endAngle
    }, {
        startAngle : s0,
        endAngle : e0
    });
    return function(t) {
        var b = i(t);
        return arc(b);
    };
}

function textTween(d, i) {
    var a;
    if (oldPieData[i]) {
        a = (oldPieData[i].startAngle + oldPieData[i].endAngle - Math.PI) / 2;
    } else if (!(oldPieData[i]) && oldPieData[i - 1]) {
        a = (oldPieData[i - 1].startAngle + oldPieData[i - 1].endAngle - Math.PI) / 2;
    } else if (!(oldPieData[i - 1]) && oldPieData.length > 0) {
        a = (oldPieData[oldPieData.length - 1].startAngle + oldPieData[oldPieData.length - 1].endAngle - Math.PI) / 2;
    } else {
        a = 0;
    }
    var b = (d.startAngle + d.endAngle - Math.PI) / 2;

    var fn = d3.interpolateNumber(a, b);
    return function(t) {
        var val = fn(t);
        return "translate(" + Math.cos(val) * (r + textOffset) + "," + Math.sin(val) * (r + textOffset) + ")";
    };
}
