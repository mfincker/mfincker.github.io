var margin = {left:130, top:40, right:180, bottom:70},
	width = Math.max( Math.min(window.innerWidth, 1200) - margin.left - margin.right - 20, 400),
    height = Math.max( Math.min(window.innerHeight - 75, 800) - margin.top - margin.bottom - 20, 400),
    innerRadius = Math.min(width * 0.33, height * .45),
    outerRadius = innerRadius * 1.05;
	
//Recalculate the width and height now that we know the radius
width = outerRadius * 2 + margin.right + margin.left;
height = outerRadius * 2 + margin.top + margin.bottom;
	
//Reset the overall font size
var newFontSize = Math.min(70, Math.max(40, innerRadius * 62.5 / 250));
d3.select("html").style("font-size", newFontSize + "%");

////////////////////////////////////////////////////////////
////////////////// Set-up Chord parameters /////////////////
////////////////////////////////////////////////////////////
	
var pullOutSize = 60 + 30/135 * innerRadius;
var numFormat = d3.format(",.0f");
var defaultOpacity = 0.85,
	fadeOpacity = 0.05;
						
var loom = loom()
    .padAngle(0.05)
	//.sortSubgroups(sortAlpha)
	//.heightInner(28)
	.emptyPerc(0)
	.widthOffsetInner(60)
	//.widthOffsetInner(function(d) { return 6 * d.length; })
	.value(function(d) { return d.n; })
	.inner(function(d) { return d.book; })
	.outer(function(d) { return d.character; });

var arc = d3.arc()
    .innerRadius(innerRadius*1.01)
    .outerRadius(outerRadius);

var string = string()
    .radius(innerRadius)
	.pullout(pullOutSize);

////////////////////////////////////////////////////////////
//////////////////// Character notes ///////////////////////
////////////////////////////////////////////////////////////
	
var characterNotes = [];
// characterNotes["Gandalf"] = "Speaking almost twice as many words as the second most abundant speaker, Gandalf is taking up a large portion of dialogue in almost every location he's in, but stays rather quiet in Mordor";
// characterNotes["Sam"] = "An unexpected runner up to having spoken the most words, Sam flourishes after the battle at Amon Hen, taking up a considerable portion of the words said in both Mordor and Gondor";
// characterNotes["Aragorn"] = "Although eventually being crowned in Minas Tirith, Gondor, Aragorn is by far most talkative in that other human region, Rohan, fighting a battle at Helm's Deep and convincing an army of dead";
// characterNotes["Frodo"] = "Frodo seems most comfortable speaking in the Shire, (mostly) when still an innocent youth, but he feels the burden of the ring increasingly towards the end and leaves the talking to his best friend Sam";
// characterNotes["Gimli"] = "Gimli is a quiet character at practically all locations until he reaches Rohan, where he speaks almost half of all his lines";
// characterNotes["Pippin"] = "Like Merry, Pippin is also seen saying something at all locations, but his presence is mostly felt when he sings his song in Minas Tirith, serving the steward of Gondor, Denethor";
// characterNotes["Merry"] = "Merry manages to say an average sentence worth of words at all locations, but is most active during his time with Treebeard in Fangorn forest and bonding with Eowyn in Rohan";
// characterNotes["Boromir"] = "Boromir speaks his finest lines during the march up Caradhras in the Misty Mountains and right before the Uruk-hai battle at Amon Hen, Parth Galen, taking up a large portion of the total number of words spoken at those locations";
// characterNotes["Legolas"] = "Although a very memorable presence throughout the movies, Legolas speaks even less in 3 movies than Boromir, who is alive in only the first movie";

characterNotes["Aang"] = ""
characterNotes["Azula"] = ""
characterNotes["Iroh"] = ""
characterNotes["Katara"] = ""
characterNotes["Sokka"] = ""
characterNotes["Toph"] = ""
// characterNotes["Book 3: Fire"] = "In Book 3, Zuko finds his path and his voice."
////////////////////////////////////////////////////////////
////////////////////// Create SVG //////////////////////////
////////////////////////////////////////////////////////////
			
var svg = d3.select("#atla-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

////////////////////////////////////////////////////////////
///////////////////// Read in data /////////////////////////
////////////////////////////////////////////////////////////
			
d3.csv('https://raw.githubusercontent.com/mfincker/vis-portfolio/master/atla_character_word_counts.csv', function (error, data) {

	////////////////////////////////////////////////////////////
	///////////////////// Prepare the data /////////////////////
	////////////////////////////////////////////////////////////
				
	data.forEach(function(d) {
		d.n = +d.n;
	});
	
	//Only keep the members of the fellowship & remove Voiceover
	// var fellowship = ["Aang","Azula","Iroh","Katara","Sokka","Toph","Zuko"];
	var fellowship = ["Book 1: Water","Book 2: Earth","Book 3: Fire"];
	data = data.filter(function(d) { 
		return fellowship.indexOf(d.book) > -1 ; 
	});	
	
	//Aggregate the data by book
	var dataAgg = dataGrouper.sum(data, ["character","book"]);
	dataAgg.sort(sortLocation);
	
	//Sort the inner characters based on the total number of words spoken
	
	//Find the total number of words per character
	var dataChar = d3.nest()
		.key(function(d) { return d.book; })
		.rollup(function(leaves) { return d3.sum(leaves, function(d) { return d.n; }); })
		.entries(dataAgg)
		.sort(function(a, b){ return d3.descending(a.value, b.value); });				
	//Unflatten the result
	// var characterOrder = dataChar.map(function(d) { return d.key; });
	var characterOrder = fellowship
	//Sort the characters on a specific order
	function sortCharacter(a, b) {
	  	return characterOrder.indexOf(a) - characterOrder.indexOf(b);
	}//sortCharacter
	
	//Set more loom functions
	loom
		.sortSubgroups(sortCharacter)
		.heightInner(innerRadius*0.75/characterOrder.length);
	
	////////////////////////////////////////////////////////////
	///////////////////////// Colors ///////////////////////////
	////////////////////////////////////////////////////////////
					
	//Color for the unique locations
	var books = ["Aang", "Azula", "Iroh", "Katara", "Sokka", "Toph", "Zuko"];
	var colors = ["#F6B348", "#FC440F",   "#FC440F", "#006992", "#006992",   "#00916E", "#FC440F"];
	var color = d3.scaleOrdinal()
    	.domain(books)
    	.range(colors);
	
	//Create a group that already holds the data
	var g = svg.append("g")
	    .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")")
		.datum(loom(dataAgg));	

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Create the filter ////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Container for the gradients
	var defs = svg.append("defs");

	//Filter for the outside glow
	var filter = defs.append("filter").attr("id","glow");

	filter.append("feGaussianBlur")
		.attr("class", "blur")
		.attr("stdDeviation","2")
		.attr("result","coloredBlur");

	var feMerge = filter.append("feMerge");
	feMerge.append("feMergeNode")
		.attr("in","coloredBlur");
	feMerge.append("feMergeNode")
		.attr("in","SourceGraphic");

	////////////////////////////////////////////////////////////
  	//////////////// Draw the ring inscription /////////////////
  	////////////////////////////////////////////////////////////

	// var ringWrapper = g.append("g").attr("class", "ring-wrapper");
 //  	var ringR = innerRadius*0.65;

 //  	ringWrapper.append("path")
 //  		.attr("id", "ring-path-top")
 //  		.attr("class", "ring-path")
 //  		.style("fill", "none")
 //  		.attr("d", 	"M" + -ringR + "," + 0 + " A" + ringR + "," + ringR + " 0 0,1 " + ringR + "," + 0);

 //  	ringWrapper.append("text")
 //  		.attr("class", "ring-text")
 //  		.append("textPath")
 //  		.attr("startOffset", "50%")
	// 	.style("filter", "url(#glow)")
 //  		.attr("xlink:href", "#ring-path-top")
 //  		.text("AE5,Ex26Yw1EjYzH= AE5,Exx:w%P1Dj^");

 //  	ringWrapper.append("path")
 //  		.attr("id", "ring-path-bottom")
 //  		.attr("class", "ring-path")
 //  		.style("fill", "none")
 //  		.attr("d", 	"M" + -ringR + "," + 0 + " A" + ringR + "," + ringR + " 0 0,0 " + ringR + "," + 0);

 //  	ringWrapper.append("text")
 //  		.attr("class", "ring-text")
 //  		.append("textPath")
 //  		.attr("startOffset", "50%")
 //  		.style("filter", "url(#glow)")
 //  		.attr("xlink:href", "#ring-path-bottom")
 //  		.text("AE5,Ex37zD1EjYzH= X#w6Ykt^AT`Bz7qTp1EjY");

	////////////////////////////////////////////////////////////
	///////////////////// Set-up title /////////////////////////
	////////////////////////////////////////////////////////////

	var titles = g.append("g")
		.attr("class", "texts")
		.style("opacity", 0);
		
	titles.append("text")
		.attr("class", "name-title")
		.attr("x", 0)
		.attr("y", -innerRadius*5/6);
		
	titles.append("text")
		.attr("class", "value-title")
		.attr("x", 0)
		.attr("y", -innerRadius*5/6 + 35);
	
	//The character pieces	
	titles.append("text")
		.attr("class", "character-note")
		.attr("x", 0)
		.attr("y", innerRadius/2)
		.attr("dy", "0.35em");
					
	////////////////////////////////////////////////////////////
	////////////////////// Draw outer arcs /////////////////////
	////////////////////////////////////////////////////////////

	var arcs = g.append("g")
	    .attr("class", "arcs")
	  	.selectAll("g")
	   	.data(function(s) { return s.groups; })
	  .enter().append("g")
		.attr("class", "arc-wrapper")
	  	.each(function(d) { d.pullOutSize = (pullOutSize * ( d.startAngle > Math.PI + 1e-2 ? -1 : 1)); })
 	 	.on("mouseover", function(d) {
			
			//Hide all other arcs	
			d3.selectAll(".arc-wrapper")
		      	.transition()
				.style("opacity", function(s) { return s.outername === d.outername ? 1 : fadeOpacity; });
			
			//Hide all other strings
		    d3.selectAll(".string")
		      	.transition()
		        .style("opacity", function(s) { return s.outer.outername === d.outername ? 1 : fadeOpacity; });
				
			//Hide ring text
			d3.selectAll(".ring-wrapper")
				.transition()
				.style("opacity", fadeOpacity);

			//Find the data for the strings of the hovered over location
			var locationData = loom(dataAgg).filter(function(s) { return s.outer.outername === d.outername; });
			//Hide the characters who haven't said a word
			d3.selectAll(".inner-label")
		      	.transition()
		        .style("opacity", function(s) {
					//Find out how many words the character said at the hovered over location
					var char = locationData.filter(function(c) { return c.outer.innername === s.name; });
					return char.length === 0 ? 0.1 : 1;
				});
 	 	})
     	.on("mouseout", function(d) {
			
			//Show all arc labels
			d3.selectAll(".arc-wrapper")
		      	.transition()
				.style("opacity", 1);
			
			//Show all strings again
		    d3.selectAll(".string")
		      	.transition()
		        .style("opacity", defaultOpacity);
				
			//Show all characters again
			d3.selectAll(".inner-label")
		      	.transition()
		        .style("opacity", 1);

		 	//Show ring text
			d3.selectAll(".ring-wrapper")
				.transition()
				.style("opacity", 1);
 	 	});
		 					
	////////////////////////////////////////////////////////////
	//////////////////// Draw outer labels /////////////////////
	////////////////////////////////////////////////////////////

	//The text needs to be rotated with the offset in the clockwise direction
	var outerLabels = arcs.append("g")
		.each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2); })
		.attr("class", "outer-labels")
		.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
		.attr("transform", function(d,i) { 
			var c = arc.centroid(d);
			return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
			+ "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
			+ "translate(" + 26 + ",0)"
			+ (d.angle > Math.PI ? "rotate(180)" : "")
		})
	
	// var elvishName = ["175{#","7R`B4#6Y","x{#75$iY1","t%j4#7iT","93GlExj6T",
 //                    	"KiAZADDÚMU","j3Hj~N7`B5$","q7E3 xj#5$","t$I5 thUj",
 //                    	"79N5#","ex{#7Y5","x2{^6Y","t7Y46Y"];
  	//The outer name in Elvish 
  	// outerLabels.append("text")
	  //   .attr("class", function(d,i) { return d.outername === "Moria" ? "dwarfish-outer-label" : "elvish-outer-label"; })
	  //   .attr("dy", ".15em")
	  //   .text(function(d,i){ return elvishName[i]; });

	//The outer name
	outerLabels.append("text")
		.attr("class", "outer-label")
		.attr("dy", ".35em")
		.text(function(d,i){ return d.outername; });
		
	//The value below it
	outerLabels.append("text")
		.attr("class", "outer-label-value")
		.attr("dy", "1.3em")
		.text(function(d,i){ return numFormat(d.value) + " words"; });
	
	////////////////////////////////////////////////////////////
	//////////////////// Draw outer arcs ///////////////////////
	////////////////////////////////////////////////////////////
	
	var outerArcs = arcs.append("path")
		.attr("class", "arc")
	    .style("fill", function(d) { return color(d.outername); })
	    .attr("d", arc)
		.attr("transform", function(d, i) { //Pull the two slices apart
		  	return "translate(" + d.pullOutSize + ',' + 0 + ")";
		 });

	////////////////////////////////////////////////////////////
	////////////////// Draw inner strings //////////////////////
	////////////////////////////////////////////////////////////
	
	var strings = g.append("g")
	    .attr("class", "stringWrapper")
		.style("isolation", "isolate")
	  .selectAll("path")
	    .data(function(strings) { 
			return strings; 
		})
	  .enter().append("path")
		.attr("class", "string")
		.style("mix-blend-mode", "multiply")
	    .attr("d", string)
	    .style("fill", function(d) { return d3.rgb( color(d.outer.outername) ).brighter(0.2) ; })
		.style("opacity", defaultOpacity);
		
	////////////////////////////////////////////////////////////
	//////////////////// Draw inner labels /////////////////////
	////////////////////////////////////////////////////////////
			
	//The text also needs to be displaced in the horizontal directions
	//And also rotated with the offset in the clockwise direction
	var innerLabels = g.append("g")
		.attr("class","inner-labels")
	  	.selectAll("text")
	    .data(function(s) { return s.innergroups; })
	  .enter().append("text")
		.attr("class", "inner-label")
		.attr("x", function(d,i) { return d.x; })
		.attr("y", function(d,i) { return d.y; })
		.style("text-anchor", "middle")
		.attr("dy", ".35em")
	    .text(function(d,i) { return d.name; })
 	 	.on("mouseover", function(d) {
			
			//Show all the strings of the highlighted character and hide all else
		    d3.selectAll(".string")
		      	.transition()
		        .style("opacity", function(s) {
					return s.outer.innername !== d.name ? fadeOpacity : 1;
				});
				
			//Update the word count of the outer labels
			var characterData = loom(dataAgg).filter(function(s) { return s.outer.innername === d.name; });
			d3.selectAll(".outer-label-value")
				.text(function(s,i){
					//Find which characterData is the correct one based on location
					var loc = characterData.filter(function(c) { return c.outer.outername === s.outername; });
					if(loc.length === 0) {
						var value = 0;
					} else {
						var value = loc[0].outer.value;
					}
					return numFormat(value) + (value === 1 ? " word" : " words"); 
					
				});
			
			//Hide the arc where the character hasn't said a thing
			d3.selectAll(".arc-wrapper")
		      	.transition()
		        .style("opacity", function(s) {
					//Find which characterData is the correct one based on location
					var loc = characterData.filter(function(c) { return c.outer.outername === s.outername; });
					return loc.length === 0 ? 0.1 : 1;
				});
					
			//Update the title to show the total word count of the character
			d3.selectAll(".texts")
				.transition()
				.style("opacity", 1);	
			d3.select(".name-title")
				.text(d.name);
			d3.select(".value-title")
				.text(function() {
					var words = dataChar.filter(function(s) { return s.key === d.name; });
					return numFormat(words[0].value) + " words";
				});
				
			//Show the character note
			d3.selectAll(".character-note")
				.text(characterNotes[d.name])
				.call(wrap, 2.25*pullOutSize);

			//Hide ring text
			d3.selectAll(".ring-wrapper")
				.transition()
				.style("opacity", fadeOpacity);
				
		})
     	.on("mouseout", function(d) {
			
			//Put the string opacity back to normal
		    d3.selectAll(".string")
		      	.transition()
				.style("opacity", defaultOpacity);
				
			//Return the word count to what it was
			d3.selectAll(".outer-label-value")	
				.text(function(s,i){ return numFormat(s.value) + " words"; });
				
			//Show all arcs again
			d3.selectAll(".arc-wrapper")
		      	.transition()
		        .style("opacity", 1);
			
			//Hide the title
			d3.selectAll(".texts")
				.transition()
				.style("opacity", 0);
				
			// //Hide the character note
			// d3.selectAll(".character-note")
			// 	.text("");

			//Show ring text
			d3.selectAll(".ring-wrapper")
				.transition()
				.style("opacity", 1);
		});
	  		
});//d3.csv

////////////////////////////////////////////////////////////
///////////////////// Extra functions //////////////////////
////////////////////////////////////////////////////////////

//Sort the locations in a particula order
function sortLocation(a, b) {
	var locationOrder = ["Aang", "Azula", "Iroh", "Katara", "Sokka", "Toph", "Zuko"];
  	return locationOrder.indexOf(a.location) - locationOrder.indexOf(b.location);
}//sortLocation

//Sort alphabetically
function sortAlpha(a, b){
	    if(a < b) return -1;
	    if(a > b) return 1;
	    return 0;
}//sortAlpha

//Sort on the number of words
function sortWords(a, b){
	    if(a.n < b.n) return -1;
	    if(a.n > b.n) return 1;
	    return 0;
}//sortWords

/*Taken from http://bl.ocks.org/mbostock/7555321
//Wraps SVG text*/
function wrap(text, width) {
  text.each(function() {
	var text = d3.select(this),
		words = text.text().split(/\s+/).reverse(),
		word,
		line = [],
		lineNumber = 0,
		lineHeight = 1.2, // ems
		y = parseFloat(text.attr("y")),
		x = parseFloat(text.attr("x")),
		dy = parseFloat(text.attr("dy")),
		tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

	while (word = words.pop()) {
	  line.push(word);
	  tspan.text(line.join(" "));
	  if (tspan.node().getComputedTextLength() > width) {
		line.pop();
		tspan.text(line.join(" "));
		line = [word];
		tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	  }
	}
  });
}//wrap

//http://stackoverflow.com/questions/14446511/what-is-the-most-efficient-method-to-groupby-on-a-javascript-array-of-objects
var dataGrouper = (function() {
    var has = function(obj, target) {
        return _.any(obj, function(value) {
            return _.isEqual(value, target);
        });
    };

    var keys = function(data, names) {
        return _.reduce(data, function(memo, item) {
            var key = _.pick(item, names);
            if (!has(memo, key)) {
                memo.push(key);
            }
            return memo;
        }, []);
    };

    var group = function(data, names) {
        var stems = keys(data, names);
        return _.map(stems, function(stem) {
            return {
                key: stem,
                vals:_.map(_.where(data, stem), function(item) {
                    return _.omit(item, names);
                })
            };
        });
    };

    group.register = function(name, converter) {
        return group[name] = function(data, names) {
            return _.map(group(data, names), converter);
        };
    };

    return group;
}());

dataGrouper.register("sum", function(item) {
    return _.extend({}, item.key, {
		n: _.reduce(item.vals, function(memo, node) {
        	return memo + node.n;
    	}, 0)
	});
});