import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import csvFile from "../data/Dataset_Afval Duurzaam Zuyd.csv";

const Trashbin = () => {
  const ref = useRef();
  const [data, setData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");

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

      if (selectedLocation) {
        console.log("Filtered data for location:", selectedLocation);
        processedData = processedData.filter(
          (d) => d.Naam === selectedLocation
        );
        console.log("Filtered data:", processedData);
      }

      setData(processedData);
    });
  }, [selectedLocation]);

  useEffect(() => {
    if (data.length > 0) {
      const container = d3.select(ref.current);

      const groupedData = d3.group(
        data,
        (d) => d.Naam,
        (d) => d.Periode
      );

      const colorScale = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.Afvalsoort)) // Use the unique values of "Afvalsoort" as the domain
        .range(d3.schemeCategory10);
      container.selectAll("svg").remove(); // Remove previous charts

      groupedData.forEach((locationData, Naam) => {
        locationData.forEach((periodData, Periode) => {
          const svg = container
            .append("svg")
            .attr("width", 600)
            .attr("height", 600);
            
            let binWidth = 500;
            let rectWidth = 50;
          const maxKG = d3.max(data, (d) => d.KG);
          const xScale = d3.scaleLinear().domain([0, maxKG]).range([0, 500]);

          const yScale = d3.scaleLinear().domain([0, maxKG]).range([500, 0]);

          // Position the bars on top of each other
          svg
            .selectAll("rect")
            .data(periodData)
            .join("rect")
            .attr("x", (500 - 50) / 2)
            .attr("y", (d) => yScale(d.KG))
            .attr("width", 50)
            .attr("height", (d) => 500 - yScale(d.KG))
            .attr("fill", (d) => colorScale(d.Afvalsoort)) // Use the color scale to set the color\
        

          // Create a bin shape using SVG around the bars
          const bin = svg
            .append("rect")
            .attr("x", (600 - 200) / 2)  
            .attr("y", (600 - 300) / 2) 
            .attr("width", 200)
            .attr("height", 300)
            .attr("fill", "none")
            .attr("stroke", "black");

          svg
            .append("text")
            .attr("x", 600 / 2)  // Divide the width of the SVG by 2
            .attr("y", 200 / 2) 
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text(`${Naam} - ${Periode}`);
        });
      });
    }
  }, [data]);

  return (
    <div>
      <select
        value={selectedLocation}
        onChange={(e) => setSelectedLocation(e.target.value)}
      >
        <option value="">Select a location</option>
        {Array.from(new Set(data.map((d) => d.Naam))).map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>
      <div ref={ref} />
    </div>
  );
};

export default Trashbin;
