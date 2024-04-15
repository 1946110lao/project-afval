import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import csvFile from "../data/Dataset_Afval Duurzaam Zuyd.csv";
import { getColor } from "../ColorAssigner";
import "./Trashbin.css";
import Preview from "./Preview";
import { interpolateRainbow } from "d3";
import moment from "moment";

const Trashbin = ({ selectedLocation, selectedYear }) => {
  const ref = useRef();
  const [data, setData] = useState([]);
  const [selectedPeriode, setSelectedPeriode] = useState("");
  const [periods, setPeriods] = useState([]);
  const [processedData, setProcessedData] = useState([]); // Add this line

  const csvParse = d3.dsvFormat(";");

  const sizeScale = d3
    .scaleThreshold()
    .domain([100, 5000, 10000])
    .range([0.8, 1, 1.25]);

  useEffect(() => {
    d3.text(csvFile).then((textData) => {
      const csvData = csvParse.parse(textData);
      let processedData = csvData.map((d) => ({
        Afvalsoort: d.Afvalsoort.trim(),
        KG: +d.KG,
        Naam: d.Naam.trim(),
        Periode: d.Periode.trim(),
      }));

      const uniquePeriods = [...new Set(processedData.map((d) => d.Periode))];
      setPeriods(uniquePeriods);

      console.log(selectedLocation, selectedYear);
      let displayChosenResults = processedData.filter(
        (d) =>
          d.Naam === selectedLocation && d.Periode.slice(0, 4) === selectedYear
      );

      const totalKGPerPeriod = displayChosenResults.reduce((acc, curr) => {
        acc[curr.Periode] = (acc[curr.Periode] || 0) + curr.KG;
        return acc;
      }, {});
      console.log(totalKGPerPeriod);

      if (selectedPeriode !== "") {
        displayChosenResults = displayChosenResults.filter(
          (d) => d.Periode === selectedPeriode
        );
      }

      setData(displayChosenResults);
    });
  }, [selectedLocation, selectedYear, selectedPeriode]);

  useEffect(() => {
    if (data.length > 0) {
      const container = d3.select(ref.current);

      const groupedData = d3.group(
        data,
        (d) => d.Naam,
        (d) => d.Periode
      );

      container.selectAll("svg").remove();

      groupedData.forEach((locationData, Naam) => {
        locationData.forEach((periodData, Periode) => {
          periodData.sort((a, b) => d3.ascending(a.Afvalsoort, b.Afvalsoort));

          const trashTypeTotals = Array.from(
            d3.rollup(
              periodData,
              (v) => d3.sum(v, (d) => d.KG),
              (d) => d.Afvalsoort
            )
          );

          const svgWidth = 600;
          const svgHeight = 600;
          const svg = container
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

          const totalKG = d3.sum(trashTypeTotals, ([Afvalsoort, kg]) => kg);
          const binSize = sizeScale(totalKG);

          //Change position trashBin
          let manualAdjustX, manualAdjustY;
          if (binSize === 0.8) {
            manualAdjustX = 70;
            manualAdjustY = 0;
          } else if (binSize === 1) {
            manualAdjustX = 10;
            manualAdjustY = 0;
          } else {
            manualAdjustX = -60;
            manualAdjustY = -30;
          }

          //Y-Axis Creation part
          let maxTotalKG;
          if (binSize === 0.8) {
            maxTotalKG = 100;
          } else if (binSize === 1) {
            maxTotalKG = 5000;
          } else {
            maxTotalKG = 10000;
          }

          const yScale = d3.scaleLinear().domain([0, maxTotalKG]);
          if (binSize === 0.8) {
            yScale.range([240, 80]);
          } else if (binSize === 1) {
            yScale.range([300, 100]);
          } else if (binSize === 1.25) {
            yScale.range([375, 125]);
          }
          const yAxis = d3.axisLeft(yScale);

          let yAxisGroup = svg
            .append("g")
            .attr("class", "y-axis")

            .call(yAxis);

          if (manualAdjustX < 0) {
            yAxisGroup.attr("transform", `translate(0, ${manualAdjustY})`);
          } else {
            yAxisGroup.attr(
              "transform",
              `translate(${145 * binSize + manualAdjustX}, ${manualAdjustY})`
            );
          }

          yAxisGroup.attr(
            "transform",
            `translate(${145 * binSize + manualAdjustX}, ${manualAdjustY})`
          );

          //Bin Creation group
          const binGroup = svg
            .append("g")
            .attr("class", "binGroup")
            .attr("transform", `translate(${manualAdjustX}, ${manualAdjustY})`);

          // Define color scale for afvalsoort categories
          const colorScale = d3
            .scaleOrdinal()
            .domain(trashTypeTotals.map(([Afvalsoort]) => Afvalsoort))
            .range(d3.schemeCategory10);

          // Bar Creation group
          const barGroup = binGroup.append("g").attr("class", "barGroup");

          let stack = 0;

          barGroup
            .selectAll("g")
            .data(trashTypeTotals)
            .enter()
            .append("g")
            .attr("class", "trashTypeGroup")
            .attr(
              "transform",
              (d, i) => `translate(${145 * binSize}, ${svgHeight - yScale(0)})` // Show the right values on the y-axis
            )
            .selectAll("rect")
            .data(([afvalsoort, kg]) => [{ afvalsoort, kg }])
            .enter()
            .append("rect")

            .attr("y", (d) => {
              let barHeight = yScale(0) - yScale(d.kg);
              let y = stack; // Start from the end of the previous bar
              stack += barHeight; // Add the height of the current bar to the stack
              return y;
            })
            .attr("width", (435 - 145) * binSize)
            .attr("height", (d) => {
              // Adjust height based on the range of yScale
              const binHeight = yScale(0);
              const barHeight = binHeight - yScale(d.kg);
              return barHeight >= 0 ? barHeight : 0; // Ensure non-negative height
            })
            .attr("fill", (d) => colorScale(d.afvalsoort));

          binGroup
            .append("rect")
            .attr("x", 145 * binSize)
            .attr("y", 100 * binSize)
            .attr("width", (435 - 145) * binSize)
            .attr("height", (300 - 100) * binSize)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 3 * binSize);

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

          let newGroup = binGroup.append("g");
          newGroup
            .append("circle")
            .attr("cx", 185 * binSize)
            .attr("cy", 340 * binSize)
            .attr("r", 20 * binSize)
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", 3 * binSize);

          newGroup
            .append("circle")
            .attr("cx", 350 * binSize)
            .attr("cy", 340 * binSize)
            .attr("r", 20 * binSize)
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", 3 * binSize);

          newGroup
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
          newGroup
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

          newGroup
            .append("rect")
            .attr("x", 190 * binSize)
            .attr("y", 301 * binSize)
            .attr("width", 30 * binSize)
            .attr("height", 10 * binSize)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 5 * binSize);

          newGroup
            .append("rect")
            .attr("x", 355 * binSize)
            .attr("y", 301 * binSize)
            .attr("width", 30 * binSize)
            .attr("height", 10 * binSize)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 5 * binSize);

          //Add name and perid from csv to the trashbin
          svg
            .append("text")
            .attr("x", 600 / 2)
            .attr("y", 200 / 5)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text(`${Naam} - ${Periode}`);
        });
      });
    }
  }, [data]);

  return (
    <div className="trashbinBackground">
      <select
        value={selectedPeriode}
        onChange={(e) => setSelectedPeriode(e.target.value)}
      >
        <option value="">Select a period</option>
        {periods
          .filter((period) => period.startsWith(selectedYear))
          .map((period) => ({
            period,
            parsedDate: new Date(period + "-01"), // Convert period to a Date object
          }))
          .sort((a, b) => a.parsedDate - b.parsedDate) // Sort by Date object
          .map(({ period }) => (
            <option key={period} value={period}>
              {period}
            </option>
          ))}
      </select>
      <div ref={ref} />
    </div>
  );
};

export default Trashbin;
