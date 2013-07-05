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
var r = 250;
var ir = 0;
// var textOffset = 160;
var textOffset = 80;
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

var arc_outline_color = "white";
var arc_outline_width = "1.7";

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

var arraySize = 10;
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
var circle_x = w / 2;
var circle_y = h / 2 - 100;
var arc_group = vis.append("svg:g").attr("class", "arc").attr("transform", "translate(" + circle_x + "," + circle_y + ")");

// GROUP FOR LABELS
//var label_group = vis.append("svg:g").attr("class", "label_group").attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");
var label_group = vis.append("svg:g").attr("class", "label_group").attr("transform", "translate(" + circle_x + "," + circle_y + ")");

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

// LEGEND RELATED FUNCTIONS ///////////////////////////
var addHoverEffect = function(selection, index) {
    var otherSlices = paths.filter(function(d, i) {
        return i != index;
    });
    var slice = paths.filter(function(d, i) {
        return i == index;
    });
    var onMouseMoveEffect = function(d) {
        slice.style("cursor", "pointer")
        .style("stroke", "black").style("stroke-width", "3");
        otherSlices.style("fill-opacity", "0.2");
        selection.style("stroke", "rgb(28,159,229)").style("cursor", "pointer");
        showTooltip(defaultTooltip.call(this, d));
    };
    var onMouseOutEvent = function() {
        slice.style("stroke", arc_outline_color).style("stroke-width", arc_outline_width);
        otherSlices.style("fill-opacity", "1");
        selection.style("stroke", "none");
        hideTooltip();
    };
    slice.on("mousemove", function(d) {
        onMouseMoveEffect(d);
    }).on("mouseout", function() {
        onMouseOutEvent();
    });
    selection.on("mousemove", function(d) {
        onMouseMoveEffect(d);
    }).on("mouseout", function() {
        onMouseOutEvent();
    });
};
var setLegendColorSize = function(selection) {
    selection.attr("width", 13).attr("height", 13);
};
var setLegendLabelSize = function(selection) {
    selection.attr("height", 30).attr("width", 100).style("font-size", "15px");
};
var setCoordinates = function(selection, x, y) {
    selection.attr("x", x).attr("y", y);
};
///////////////////////////////////////////////////////

// TOOLTIP ////////////////////////////////////////////
var body = d3.select("body");
var tooltip = body.append("div")
    .style("display", "none")
    .attr("class", "parsets tooltip");
var showTooltip = function(html) {
    var m = d3.mouse(body.node());
    tooltip.style("display", null).style("left", m[0] + 30 + "px").style("top", m[1] - 30 + "px").html(html);
};
var hideTooltip = function() {
    tooltip.style("display", "none");
};
var defaultTooltip = function(d) {
    return "Default Tooltip";
};
///////////////////////////////////////////////////////

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
    paths.enter().append("svg:path").attr("stroke", arc_outline_color).attr("stroke-width", arc_outline_width).attr("fill", function(d, i) {
        return color(i);
    }).transition().duration(tweenDuration).attrTween("d", pieTween);
    paths.transition().duration(tweenDuration).attrTween("d", pieTween);
    paths.exit().transition().duration(tweenDuration).attrTween("d", removePieTween).remove();

    // addDropShadow();

    // DRAW TICK MARK LINES FOR LABELS
    lines = label_group.selectAll("line").data(filteredPieData);
    lines.enter().append("svg:line").attr("x1", 0).attr("x2", 0).attr("y1", -r - 70).attr("y2", -r - 5).attr("stroke", strokeColor).attr("transform", function(d) {
        return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
    });
    lines.transition().duration(tweenDuration).attr("transform", function(d) {
        return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
    });
    lines.exit().remove();

    // DRAW LABELS WITH PERCENTAGE VALUES
    valueLabels = label_group.selectAll("text.value").data(filteredPieData).attr("dy", function(d) {
        if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
            return 8;
        } else {
            return 0;
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
            return 8;
        } else {
            return 0;
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
    // nameLabels = label_group.selectAll("text.units").data(filteredPieData).attr("dy", function(d) {
        // if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
            // return 17;
        // } else {
            // return 5;
        // }
    // }).attr("text-anchor", function(d) {
        // if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            // return "beginning";
        // } else {
            // return "end";
        // }
    // }).text(function(d) {
        // return d.name;
    // });
    // nameLabels.enter().append("svg:text").attr("class", "units").attr("transform", function(d) {
        // return "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (r + textOffset) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (r + textOffset) + ")";
    // }).attr("dy", function(d) {
        // if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
            // return 17;
        // } else {
            // return 5;
        // }
    // }).attr("text-anchor", function(d) {
        // if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            // return "beginning";
        // } else {
            // return "end";
        // }
    // }).text(function(d) {
        // return d.name;
    // });
    // nameLabels.transition().duration(tweenDuration).attrTween("transform", textTween);
    // nameLabels.exit().remove();

    // add legend
    var color_hash = {
        '0' : "售后咨询交叉保修（国内<-->国外有无保修）",
        '1' : "摄像头故障，拍摄画面为白屏、黑屏，花屏",
        '2' : "3G(WWAN)",
        '3' : "捆绑的Office软件",
        '4' : "AC电源/电池",
        '5' : "Windows其它内容",
        '6' : "液体不慎泼入键盘，机身",
        '7' : "内置无线LAN",
        '8' : "硬盘",
        '9' : "咨询/要求升级/安装其他操作系统",
        '10' : "Windows启动/登录",
        '11' : "内置摄像头",
        '12' : "升级/安装其他操作系统之后的问题",
        '13' : "触摸板/转点通",
        '14' : "咨询如何鉴别或者要求鉴别产品真伪"
    };
    var legend = vis.append("g").attr("class", "legend").attr("x", 65).attr("y", h - 100).attr("height", 100).attr("width", 100);
    legend.selectAll('g').data(filteredPieData).enter().append('g').each(function(d, i) {
        var x, y = 0;
        if (i < 8) {
            x = 10;
            y = (h - i * 28) - 20;
        } else {
            x = 0.5 * w;
            y = (h - i * 28) + 204;
        }
        var g = d3.select(this);
        g.append("rect").call(setCoordinates, x, y).call(setLegendColorSize).style("fill", color(i)).call(addHoverEffect, i);
        g.append("text").call(setCoordinates, x + 15, y + 12).call(setLegendLabelSize).style("fill", color(i)).text(color_hash[String(i)]).call(addHoverEffect, i);
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

var addDropShadow = function() {
    // filters go in defs element
    var defs = vis.append("defs");

    // create filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
    var filter = defs.append("filter").attr("id", "drop-shadow").attr("height", "130%");

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    filter.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", 5).attr("result", "blur");

    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    filter.append("feOffset").attr("in", "blur").attr("dx", 5).attr("dy", 5).attr("result", "offsetBlur");

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "offsetBlur")
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // for each rendered node, apply #drop-shadow filter
    var item = arc_group.style("filter", "url(#drop-shadow)");
};
