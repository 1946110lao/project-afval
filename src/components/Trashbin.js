import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import csvFile from "../data/Dataset_Afval Duurzaam Zuyd.csv";
import { getColor } from "../ColorAssigner";
import "./Trashbin.css";
import Preview from "./Preview";

const Trashbin = ({ selectedLocation, selectedYear }) => {
  const ref = useRef();
  const [data, setData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  const csvParse = d3.dsvFormat(";");

  useEffect(() => {
    d3.text(csvFile).then((textData) => {
      const csvData = csvParse.parse(textData);
      let processedData = csvData.map((d) => ({
        Afvalsoort: d.Afvalsoort,
        KG: +d.KG,
        Naam: d.Naam,
        Periode: d.Periode,
      }));
      let displayChosenResults = processedData.filter(
        (d) => d.Naam === selectedLocation && d.Periode.slice(0, 4) === selectedYear
      );

      
    if (selectedMonth !== "") {
      displayChosenResults = displayChosenResults.filter(
        (d) => d.Periode.slice(-2) === selectedMonth.slice(1)
      );
    }

      setData(displayChosenResults);
    });
  }, [selectedLocation, selectedYear, selectedMonth]);

  useEffect(() => {
    if (data.length > 0) {
      const container = d3.select(ref.current);

      const groupedData = d3.group(
        data,
        (d) => d.Naam,
        (d) => d.Periode
      );

      container.selectAll("svg").remove(); // Remove previous charts

      groupedData.forEach((locationData, Naam) => {
        locationData.forEach((periodData, Periode) => {
          periodData.sort((a, b) => d3.ascending(a.Afvalsoort, b.Afvalsoort));
          const svg = container
            .append("svg")
            .attr("width", 600)
            .attr("height", 600);

          // Position the bars on top of each other
          // svg
          //   .selectAll("rect")
          //   .data(periodData)
          //   .join("rect")
          //   .attr("transform", "translate(0,-50)")
          //   .attr("x", (600 - 200) / 2) // Match the bin's x attribute
          //   .attr("y", (d) => yScale(d.KG))
          //   .attr("width", 200) // Match the bin's width
          //   .attr("height", (d) => 500 - yScale(d.KG))
          //   .attr("fill", (d) => getColor(d.Afvalsoort)); // Use lsoort)); // Use the color scale to set the color\

          // Create a bin shape using SVG around the bars
          // Create a flipped trapezoid shape using SVG around the bars
          const bin = svg
            .append("polygon")
            .attr("points", "180,300 405,300 435,100 145,100")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 3);
          const lid = svg
            .append("path")
            .attr(
              "d",
              `
              M 143,97 
              Q 143,67 163,67
              L 403,67
              Q 435,67 435,97 
              L 435,97 
              L 143,97
            `
            )
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 3);

          const circle1 = svg
            .append("circle")
            .attr("cx", 185) // x-coordinate of the center
            .attr("cy", 340) // y-coordinate of the center
            .attr("r", 20) // radius
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", 3);

          const circle2 = svg
            .append("circle")
            .attr("cx", 350) // x-coordinate of the center
            .attr("cy", 340) // y-coordinate of the center
            .attr("r", 20) // radius
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", 3);

          const triangle1 = svg
            .append("polygon")
            .attr("points", "180,315 180,350 220,315")
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .attr("transform", "rotate(360, 220, 310)");

          const triangle2 = svg
            .append("polygon")
            .attr("points", "345,315 345,350 385,315") // Adjust these points
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .attr("transform", "rotate(360, 300, 310)"); // Adjust the center of rotation

          const rect1 = svg
            .append("rect")
            .attr("x", 190) // x-coordinate of the top-left corner
            .attr("y", 301) // y-coordinate of the top-left corner
            .attr("width", 30) // width of the rectangle
            .attr("height", 10) // height of the rectangle
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 5);

          const rect2 = svg
            .append("rect")
            .attr("x", 355) // x-coordinate of the top-left corner
            .attr("y", 301) // y-coordinate of the top-left corner
            .attr("width", 30) // width of the rectangle
            .attr("height", 10) // height of the rectangle
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 5);

          svg
            .append("text")
            .attr("x", 600 / 2) // Divide the width of the SVG by 2
            .attr("y", 200 / 5)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text(`${Naam} - ${Periode}`);
        });
      });
    }
    console.log("data:", data);
  }, [data]);

  return (
    <div className="trashbinBackground">
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      >
        <option value="">Select a month</option>
        <option value="-01">January</option>
        <option value="-02">February</option>
        <option value="-03">March</option>
        <option value="-04">April</option>
        <option value="-05">May</option>
        <option value="-06">June</option>
        <option value="-07">July</option>
        <option value="-08">August</option>
        <option value="-09">September</option>
        <option value="-10">October</option>
        <option value="-11">November</option>
        <option value="-12">December</option>
      </select>
      <div ref={ref} />
    </div>
  );
};

export default Trashbin;
