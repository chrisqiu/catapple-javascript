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

        var bar = svg.selectAll("g.bar").data(data).enter().append("g").attr("class", "bar").attr("transform", function(d) {
            return "translate(0," + y(d.name) + ")";
        });

        bar.append("rect")
        .attr("width", function(d) {
            return x(d.value);
        })
        .attr("height", y.rangeBand());

        bar.append("text")
        .attr("class", "value")
        .attr("x", function(d) {
            return x(d.value);
        })
        .attr("y", y.rangeBand() / 2)
        .attr("dx", 3)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .text(function(d) {
            return format(d.value);
        });

        bar.append("text")
        .attr("class", "codetype3")
        .attr("x", 0)
        .attr("y", y.rangeBand() / 2)
        .attr("dx", 3)
        .attr("dy", "4.5em")
        .attr("text-anchor", "start")
        .text("codetype3");
        
        bar.append("text")
        .attr("class", "summary")
        .attr("x", 0)
        .attr("y", y.rangeBand() / 2)
        .attr("dx", 3)
        .attr("dy", "3em")
        .attr("text-anchor", "start")
        .text("summary");

        svg.append("g").attr("class", "x axis").call(xAxis);
        svg.append("g").attr("class", "y axis").call(yAxis);
    });
})();