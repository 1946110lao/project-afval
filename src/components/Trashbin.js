import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import csvFile from "../data/Dataset_Afval Duurzaam Zuyd.csv";
import { getColor } from "../ColorAssigner";
import "./Trashbin.css";
import RecyclePercentage from "./RecyclePercentage";

const Trashbin = ({ selectedLocation, selectedYear, setSelectedLocation }) => {
  // Set up refs and states of the component
  const ref = useRef();
  const [data, setData] = useState([]);
  const [selectedPeriode, setSelectedPeriode] = useState("");
  const [trashTypeTotals, setTrashTypeTotals] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [locations, setLocations] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [percentagesArray, setPercentagesArray] = useState([]);

  // Parse the csv file
  const csvParse = d3.dsvFormat(";");

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  // Define the scale of kg amount from each location for the size of the trashbin
  const sizeScale = d3
    .scaleThreshold()
    .domain([100, 5000, 10000, 25000])
    .range([0.8, 1, 1.25, 1.6]);

  //useEffect to fetch data from csv
  useEffect(() => {
    // Fetch data from csv
    d3.text(csvFile).then((textData) => {
      const csvData = csvParse.parse(textData);
      let processedData = csvData.map((d) => ({
        Afvalsoort: d.Afvalsoort.trim(),
        KG: +d.KG,
        Naam: d.Naam.trim(),
        Periode: d.Periode.trim(),
      }));

      // This line to use the processed data in other functions
      setProcessedData(processedData);

      // Display chosen results based on selected period and location from Preview.js
      let displayChosenResults = processedData.filter(
        (d) =>
          d.Naam === selectedLocation && d.Periode.slice(0, 4) === selectedYear
      );

      // Filter by selected location if it's not empty
      if (selectedLocation !== "") {
        displayChosenResults = displayChosenResults.filter(
          (d) => d.Naam === selectedLocation
        );
      }

      // Filter by selected period if it's not empty
      if (selectedPeriode !== "") {
        displayChosenResults = displayChosenResults.filter(
          (d) => d.Periode === selectedPeriode
        );
      }

      // Log the total kg per period per location
      const totalKGPerPeriod = displayChosenResults.reduce((acc, curr) => {
        acc[curr.Periode] = (acc[curr.Periode] || 0) + curr.KG;
        return acc;
      }, {});
      console.log(totalKGPerPeriod);

      // Set the unique periods and locations
      const uniquePeriods = Object.keys(totalKGPerPeriod);
      setPeriods(uniquePeriods);

      const uniqueLocations = [...new Set(processedData.map((d) => d.Naam))];
      setLocations(uniqueLocations);

      // Set the data to be displayed
      setData(displayChosenResults);
    });
  }, [selectedLocation, selectedYear, selectedPeriode]);

  // useEffect runs when data is updated
  useEffect(() => {
    // Initialize the SVG if data is available
    if (data.length > 0) {
      const container = d3.select(ref.current);

      // Group data by location and period
      const groupedData = d3.group(
        data,
        (d) => d.Naam,
        (d) => d.Periode
      );

      container.selectAll("svg").remove();

      // Make Bin for each location in the csv file
      let percentages = new Map();
      groupedData.forEach((locationData, Naam) => {
        locationData.forEach((periodData, Periode) => {
          let totalKG = d3.sum(periodData, (d) => d.KG);
          let bedrijfsAfvalKG = d3.sum(periodData, (d) => {
            return d.Afvalsoort === "Bedrijfsafval" ? d.KG : 0;
          });

          let bedrijfsAfvalGrofKG = d3.sum(periodData, (d) => {
            return d.Afvalsoort === "Bedrijfsafval, grof" ? d.KG : 0;
          });
          let recycledKG = totalKG - bedrijfsAfvalKG - bedrijfsAfvalGrofKG;

          let percentage = (recycledKG / totalKG) * 100;
          if (!percentages.has(Naam)) {
            percentages.set(Naam, new Map());
          }
          percentages.get(Naam).set(Periode, percentage);

          let array = [];
          percentages.forEach((locationData, Naam) => {
            locationData.forEach((percentage, Periode) => {
              array.push({ location: Naam, period: Periode, percentage });
            });
          });
          setPercentagesArray(array);

          periodData.sort((a, b) => d3.ascending(a.Afvalsoort, b.Afvalsoort));

          // Fetch the total kg per trash type
          const trashTypeTotals = Array.from(
            d3.rollup(
              periodData,
              (v) => d3.sum(v, (d) => d.KG),
              (d) => d.Afvalsoort
            )
          );

          

          // Define SVG size
          const svgWidth = 1300;
          const svgHeight = 600;

          if (periodData.length > 0) {
          const div = container
            .append("div")
            .style("width", svgWidth + "px")
            .style("height", svgHeight + "px")
            .style("border", "2px solid black"); //

          // Append the SVG to the div instead of the container
          const svg = div
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

          // Sum trashTypeTotals to get the total kg per location
          const totalkg = d3.sum(trashTypeTotals, ([Afvalsoort, kg]) => kg);

          // Define binsizes based on total kg per location
          const binSize = sizeScale(totalkg);

          setTrashTypeTotals(trashTypeTotals);

          //Postioning trashbins
          let binAdjustX, binAdjustY;
          if (binSize === 0.8) {
            binAdjustX = 70;
            binAdjustY = 80;
            svg.attr("height", 400);
          } else if (binSize === 1) {
            binAdjustX = 5;
            binAdjustY = 40;
            svg.attr("height", 500);
          } else if (binSize === 1.25) {
            binAdjustX = -65;
            binAdjustY = 40;
            svg.attr("height", 600);
          } else {
            binAdjustX = -170;
            binAdjustY = 10;
            svg.attr("height", 700);
          }

          //Set values for the y-axis
          let yAxismaxTotalKG;
          if (binSize === 0.8) {
            yAxismaxTotalKG = 100;
          } else if (binSize === 1) {
            yAxismaxTotalKG = 5000;
          } else if (binSize === 1.25) {
            yAxismaxTotalKG = 10000;
          } else {
            yAxismaxTotalKG = 25000;
          }

          // Align the y-axis to the bottom of the bin
          const yScaleAxis = d3.scaleLinear().domain([0, yAxismaxTotalKG]);
          if (binSize === 0.8) {
            yScaleAxis.range([240, 80]);
          } else if (binSize === 1) {
            yScaleAxis.range([300, 100]);
          } else if (binSize === 1.25) {
            yScaleAxis.range([375, 125]);
          } else {
            yScaleAxis.range([480, 150]);
          }
          const AxisY = d3.axisLeft(yScaleAxis);

          // Change Y-axis text position
          let YAxisMeasurementX, YAxisMeasurementY;
          if (binSize === 0.8) {
            YAxisMeasurementX = "-15";
            YAxisMeasurementY = "-200";
          } else if (binSize === 1) {
            YAxisMeasurementX = "-300";
            YAxisMeasurementY = "105";
          } else if (binSize === 1.25) {
            YAxisMeasurementX = "-350";
            YAxisMeasurementY = "150";
          } else {
            YAxisMeasurementX = "-290";
            YAxisMeasurementY = "12";
          }

          // Y-Axis Creation group
          let yAxisGroup = svg.append("g").attr("class", "y-axis").call(AxisY);

          yAxisGroup.attr(
            "transform",
            `translate(${145 * binSize + binAdjustX}, ${binAdjustY})`
          );

          //Bin Creation group
          const binGroup = svg
            .append("g")
            .attr("class", "binGroup")
            .attr("transform", `translate(${binAdjustX}, ${binAdjustY})`);

          // Add unit of measurement next to the y-axis
          binGroup
            .append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", YAxisMeasurementX) // Manually adjusted x position
            .attr("y", YAxisMeasurementY) // Manually adjusted y position
            .style("text-anchor", "middle")
            .style("font-size", "17px") // Adjust font size if needed
            .attr("transform", `translate(${binAdjustX}, ${binAdjustY})`)
            .attr("transform", "rotate(-90)")
            .text("KG");

          // Barchart Creation group
          const barGroup = binGroup.append("g").attr("class", "barGroup");

          let stack = 0;

          // Create a div for the tooltip and hide it by default
          const tooltip = d3
            .select("body")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#e81a31")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "white");

          barGroup
            .selectAll("g")
            .data(trashTypeTotals)
            .enter()
            .append("g")
            .attr("class", "trashTypeGroup")
            .attr(
              "transform",
              (d, i) => `translate(${145 * binSize}, 0)` // Adjust the y position to 0
            )
            .selectAll("rect")
            .data(([afvalsoort, kg]) => [{ afvalsoort, kg }])
            .enter()
            .append("rect")
            .attr("y", (d) => {
              let barHeight = yScaleAxis(0) - yScaleAxis(d.kg);
              let y = yScaleAxis(0) - barHeight - stack; // Calculate y position based on kg value
              stack += barHeight; // Add the height of the current bar to the stack
              return y;
            })
            .attr("width", (435 - 145) * binSize)
            .attr("height", (d) => {
              // Adjust height based on the range of yScale
              const binHeight = yScaleAxis(0);
              const barHeight = binHeight - yScaleAxis(d.kg);
              return barHeight >= 0 ? barHeight : 0; // Ensure non-negative height
            })
            .attr("fill", (d) => getColor(d.afvalsoort))
            .on("mouseover", function (event, d) {
              // Show the tooltip
              tooltip.style("visibility", "visible");

              // Clear the tooltip
              tooltip.html(
                "Afvalsoort: " + d.afvalsoort + "<br>" + "KG: " + d.kg
              );
            })
            .on("mousemove", function (event) {
              tooltip
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px"); // Update the tooltip position
            })
            .on("mouseout", function () {
              tooltip.style("visibility", "hidden"); // Hide the tooltip
            });
          // SVG for the trashbin
          binGroup
            .append("rect")
            .attr("x", 145 * binSize)
            .attr("y", 100 * binSize)
            .attr("width", (435 - 145) * binSize)
            .attr("height", (300 - 100) * binSize)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 3 * binSize);

          // SVG for the trashlid
          binGroup
            .append("path")
            .attr(
              "d",
              `
            M ${143 * binSize},${97 * binSize} 
            Q ${143 * binSize},${67 * binSize} ${163 * binSize},${67 * binSize}
            L ${403 * binSize},${67 * binSize}
            Q ${435 * binSize},${67 * binSize} ${435 * binSize},${97 * binSize} 
            L ${435 * binSize},${97 * binSize} 
            L ${143 * binSize},${97 * binSize}
            `
            )
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 3 * binSize);

          // SVG's for the wheels
          let wheelGroup = binGroup.append("g");
          wheelGroup
            .append("circle")
            .attr("cx", 185 * binSize)
            .attr("cy", 340 * binSize)
            .attr("r", 20 * binSize)
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", 3 * binSize);

          wheelGroup
            .append("circle")
            .attr("cx", 350 * binSize)
            .attr("cy", 340 * binSize)
            .attr("r", 20 * binSize)
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", 3 * binSize);

          wheelGroup
            .append("polygon")
            .attr(
              "points",
              `${180 * binSize},${315 * binSize} ${180 * binSize},${
                350 * binSize
              } ${220 * binSize},${315 * binSize}`
            )
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 3 * binSize)
            .attr(
              "transform",
              `rotate(360, ${220 * binSize}, ${310 * binSize})`
            );
          wheelGroup
            .append("polygon")
            .attr(
              "points",
              `${345 * binSize},${315 * binSize} ${345 * binSize},${
                350 * binSize
              } ${385 * binSize},${315 * binSize}`
            )
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 3 * binSize)
            .attr(
              "transform",
              `rotate(360, ${300 * binSize}, ${310 * binSize})`
            );

          wheelGroup
            .append("rect")
            .attr("x", 190 * binSize)
            .attr("y", 301 * binSize)
            .attr("width", 30 * binSize)
            .attr("height", 10 * binSize)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 5 * binSize);

          wheelGroup
            .append("rect")
            .attr("x", 355 * binSize)
            .attr("y", 301 * binSize)
            .attr("width", 30 * binSize)
            .attr("height", 10 * binSize)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 5 * binSize);

          // Display Location and Period

          svg
            .append("text")
            .attr("x", 650)
            .attr("y", 50)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")

            .text(`${Naam} - ${Periode}`);

          // Display Total Trash

          svg
            .append("text")
            .attr("x", 300)
            .attr("y", 100)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text(`Totaal KG Afval: ${totalkg.toFixed(0)} KG`);

          // Display Recycling Percentage
          svg
            .append("text")
            .attr("x", 1000)
            .attr("y", 100) // Adjust the y position based on your layout
            .attr("text-anchor", "middle")
            .style("font-size", "20px") // Adjust font size if needed
            .text(`Recycling Percentage: ${percentage.toFixed(2)}%`);
          }
        });
      });
    }
  }, [data]);

  return (
    <div>
      <select value={selectedLocation} onChange={handleLocationChange}>
        {/* Filter on location */}
        {locations
          // Filter out locations that don't have data for the selected year
          .filter((location) => {
            // Check if there is any data for this location in the selected year and period
            return processedData.some(
              (d) => d.Naam === location && d.Periode.startsWith(selectedYear)
            );
          })
          .map((location, index) => (
            <option key={index} value={location}>
              {location}
            </option>
          ))}
      </select>

      <select
        value={selectedPeriode}
        onChange={(e) => setSelectedPeriode(e.target.value)}
      >
        {/* Filter by period of a certain location*/}
        <option value="">Toon alle Periodes</option>
        {periods
          .filter((period) => period.startsWith(selectedYear))
          .map((period) => ({
            period,
            parsedDate: new Date(period + "-01"),
          }))
          .sort((a, b) => a.parsedDate - b.parsedDate)
          .map(({ period }) => (
            <option key={period} value={period}>
              {period}
            </option>
          ))}
      </select>

      <div className="trashbinBackground" ref={ref} />
    </div>
  );
};

export default Trashbin;
