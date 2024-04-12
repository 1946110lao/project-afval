import * as d3 from "d3";
import { useEffect, useState, useRef } from "react";
import csvFile from "../data/Dataset_Afval Duurzaam Zuyd.csv";
import Trashbin from "./Trashbin";
import "./Preview.css";

const Preview = () => {
  const [trashData, setTrashData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [otherRectPropsArray, setOtherRectPropsArray] = useState([]);
  const [maxLocations, setMaxLocations] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [TrashbinComponent, setTrashbinComponent] = useState(false);
  

  useEffect(() => {
    d3.select(".preview").remove();
    d3.text(csvFile).then((data) => {
      // Parse the CSV data
      const parsedData = d3.dsvFormat(";").parse(data);

      // Data transformation
      const transformedData = parsedData.map((d) => ({
        Year: d.Periode ? d.Periode.substring(0, 4).trim() : "", // Extract the year from Periode and trim
        Naam: d.Naam ? d.Naam.trim() : "", // Trim and normalize Naam
        KG: +d.KG.replace(",", "."), // Always replace commas with dots before converting
      }));

      // Group data by Year and Naam
      const nestedData = d3.group(
        transformedData,
        (d) => d.Year,
        (d) => d.Naam
      );
      // Convert nested data to desired format
      const trashData = Array.from(nestedData, ([year, locations]) => ({
        year,
        locations: Array.from(locations, ([name, values]) => ({
          location: name,
          totalTrash: Math.round(values.reduce((sum, d) => sum + d.KG, 0)),
        })),
      }));

      const maxLocations = Math.max(
        ...trashData.map((d) => d.locations.length)
      );
      // Set the trash data state
      setTrashData(trashData);

      setMaxLocations(maxLocations);

      return () => {
        d3.select("body").selectAll(".mySvg").remove(); // Remove all SVGs with class "mySvg"
      };
    });
  }, []); // Empty dependency array to run the effect only once

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };


  const firstThreeRectProps = [
    {
      x: 50,
      y: 15,
      width: 800,
      height: 350,
    },
    {
      x: 920,
      y: 15,
      width: 520,
      height: 350,
    },
    {
      x: 50,
      y: 390,
      width: 400,
      height: 300,
    },
  ];

  // Add event listeners

  const smallRectWidth = 145;
  const smallRectHeight = 140;
  const smallRectSpacingX = 20; // Horizontal spacing
  const smallRectSpacingY = 20;

  const bottomLeftRect = firstThreeRectProps[2]; // The bottom left rectangle is the third one in the array

  const otherRectProps = {
    x: (i) =>
      bottomLeftRect.x +
      bottomLeftRect.width +
      smallRectSpacingX +
      i * (smallRectWidth + smallRectSpacingX),
    y: (j) => bottomLeftRect.y + j * (smallRectHeight + smallRectSpacingY),
    width: smallRectWidth,
    height: smallRectHeight,
  };

  useEffect(() => {
    const numColumns = Math.ceil((maxLocations - 3) / 2); // Subtract 3 for the firstThreeRectProps, divide by 2 for the number of rows
    const tempArray = [];
    for (let i = 0; i < maxLocations - 3; i++) {
      // Subtract 3 for the firstThreeRectProps
      const column = i % numColumns;
      const row = Math.floor(i / numColumns);
      const rectProps = {
        x: otherRectProps.x(column),
        y: otherRectProps.y(row),
        width: otherRectProps.width,
        height: otherRectProps.height,
      };
      tempArray.push(rectProps);
    }
    setOtherRectPropsArray(tempArray);
  }, [maxLocations]);

  const maxX = Math.max(
    ...firstThreeRectProps.map((rect) => rect.x + rect.width),
    otherRectProps.x(trashData.length - 1) + otherRectProps.width
  );
  const maxY = Math.max(
    ...firstThreeRectProps.map((rect) => rect.y + rect.height),
    otherRectProps.y(trashData.length - 1) + otherRectProps.height
  );

  return (
    <div>
      {TrashbinComponent ? (
        <Trashbin
          selectedLocation={selectedLocation}
          selectedYear={selectedYear}
       
        />
      ) : (
        <>
          <div>
            <select value={selectedYear} onChange={handleYearChange}>
              <option value="">Select a year</option>
              {trashData.map((item, index) => (
                <option key={index} value={item.year}>
                  {item.year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <svg width={maxX * 1.1} height={maxY}>
              {trashData
                .filter((item) => item.year === selectedYear)
                .map((item, index) => (
                  <g key={index}>
                    {item.locations
                      .sort((a, b) => a.totalTrash - b.totalTrash)
                      .map((location, i) => {
                        const rectProps =
                          i < 3
                            ? firstThreeRectProps[i]
                            : otherRectPropsArray[i - 3];
                        return (
                          <g key={i}>
                            <rect
                              className="rect"
                              x={
                                typeof rectProps.x === "function"
                                  ? rectProps.x(i)
                                  : rectProps.x
                              }
                              y={
                                typeof rectProps.y === "function"
                                  ? rectProps.y(i)
                                  : rectProps.y
                              }
                              width={rectProps.width}
                              height={rectProps.height}
                              rx={20}
                              ry={20}
                              style={{
                                fill: "rgba(0, 0, 0, 0)",
                                stroke: "black",
                                strokeWidth: 2,
                                transition: "transform 0.3s ease",
                                transformOrigin: `${
                                  (typeof rectProps.x === "function"
                                    ? rectProps.x(i)
                                    : rectProps.x) +
                                  rectProps.width / 2
                                }px ${
                                  (typeof rectProps.y === "function"
                                    ? rectProps.y(i)
                                    : rectProps.y) +
                                  rectProps.height / 2
                                }px`, // Calculate the center of the rectangle
                              }}
                              onMouseOver={(e) => {
                                e.target.style.transform = "scale(1.07)";
                              }}
                              onMouseOut={(e) => {
                                e.target.style.transform = "scale(1)";
                              }}
                              onClick={() => {
                                setTrashbinComponent(true);
                                setSelectedLocation(location.location);
                                setSelectedYear(item.year);
                                console.log(
                                  "TrashbinComponent:",
                                  TrashbinComponent
                                ); // Add this line
                                console.log(
                                  "selectedLocation:",
                                  location.location
                                ); // Add this line

                                console.log(
                                  "selectedYear",
                                  selectedYear
                                );
                              }}
                            />
                            <text
                              className="text"
                              x={rectProps.x + rectProps.width / 2} // Position the text in the horizontal center of the rectangle
                              y={rectProps.y + 20} // Position the text a bit down from the top edge of the rectangle
                              textAnchor="middle" // Center the text based on the x position
                              style={{
                                fontSize: `${Math.max(
                                  rectProps.width /
                                    (location.location.length +
                                      location.totalTrash.toString().length +
                                      17),
                                  8
                                )}px`, // Calculate font size based on box width and text length, but don't go below 10px
                              }}
                            >
                              <tspan
                                x={rectProps.x + rectProps.width / 2}
                                dy="0"
                              >
                                {location.location}
                              </tspan>
                              <tspan
                                x={rectProps.x + rectProps.width / 2}
                                dy="1.2em"
                              >
                                Total trash: {location.totalTrash} KG
                              </tspan>
                            </text>
                          </g>
                        );
                      })}
                  </g>
                ))}
            </svg>
          </div>
        </>
      )}
    </div>
  );
};

export default Preview;
