(function() {
    // var m = [30, 10, 10, 30];
    // var w = 960 - m[1] - m[3];
    // var h = 930 - m[0] - m[2];
    // var format = d3.format(",.0f");
    // var x = d3.scale.linear().range([0, w]);
    // var y = d3.scale.ordinal().rangeRoundBands([0, h], .1);
    // var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h);
    // var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

    var m = [30, 90, 100, 50];
    var w = 1000 - m[1] - m[3];
    var h = 1500 - m[0] - m[2];
    var format = d3.format(",.0f");
    var x = d3.scale.linear().range([0, w]);
    var y = d3.scale.ordinal().rangeRoundBands([0, h], .7);
    var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h);
    var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

    var svg = d3.select("body").append("svg").attr("width", w + m[1] + m[3]).attr("height", h + m[0] + m[2]).append("g").attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    var filter = svg.append("svg:defs").append("svg:filter").attr("id", "blur");
    filter.append("feOffset").attr("in", "SourceAlpha").attr("dx", 1).attr("dy", 1).attr("result", "offOut");
    filter.append("feGaussianBlur").attr("stdDeviation", 1).attr("in", "offOut").attr("result", "blurOut");
    filter.append("feBlend").attr("in", "SourceGraphic").attr("in2", "blurOut").attr("mode", "lighten");

    d3.csv("sample-data.csv", function(data) {
        // Parse numbers, and sort by value.
        data.forEach(function(d) {
            d.value = +d.value;
        });
        data.sort(function(a, b) {
            return b.value - a.value;
        });

        // Set the scale domain.
        x.domain([0, d3.max(data, function(d) {
            return d.value;
        })]);
        y.domain(data.map(function(d) {
            return d.name;
        }));

        svg.append("g").attr("class", "x axis")
        .transition()
        .attr("opacity", 1)
        .delay(500).duration(2000)
        .call(xAxis);

        var bar = svg.selectAll("g.bar").data(data).enter().append("g").attr("class", "bar").attr("transform", function(d) {
            return "translate(0," + y(d.name) + ")";
        });

        bar.append("rect")
        .attr("width", 0)
        .attr("height", y.rangeBand())
        .attr("filter", "url(#blur)")
        .transition().duration(800).ease("easeInQuint")
        .attr("width", function(d) {
            return x(d.value);
        }).attr("height", y.rangeBand());

        bar.append("text")
        .attr("class", "value")
        .attr("x", function(d) {
            return x(d.value);
        })
        .attr("y", y.rangeBand() / 2)
        .attr("dx", 10)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .text(function(d) {
            return format(d.value);
        })
        .style("opacity", 0)
        .transition().style("opacity", 1).delay(500).duration(1000);

        bar.append("text")
        .attr("class", "keyword")
        .attr("x", 0)
        .attr("y", y.rangeBand() / 2)
        .attr("dx", 3)
        .attr("dy", "4em")
        .attr("text-anchor", "start")
        .text("keyword");

        bar.append("text")
        .attr("class", "summary")
        .attr("x", 0)
        .attr("y", y.rangeBand() / 2)
        .attr("dx", 3)
        .attr("dy", "5.5em")
        .attr("text-anchor", "start")
        .text("summary");


        svg.append("g").attr("class", "y axis")
        // .transition()
        // .attr("x", 0).attr("y", 0)
        // .delay(0).duration(1500)
        .call(yAxis);
    });
})();
