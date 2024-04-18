// import * as d3 from "d3";
// import { useEffect, useRef } from "react";

// const WheelGroup = ({ binSize, container}) => {
//   const ref = useRef();
//   useEffect(() => {
//     const svg = d3.select(ref.current);
//     // Calculate binSize based on the total kg per location
  


//     const wheelGroup = container.append("g");

//     wheelGroup
//       .append("circle")
//       .attr("cx", 185 * binSize)
//       .attr("cy", 340 * binSize)
//       .attr("r", 20 * binSize)
//       .attr("fill", "black")
//       .attr("stroke", "black")
//       .attr("stroke-width", 3 * binSize);

//     wheelGroup
//       .append("circle")
//       .attr("cx", 350 * binSize)
//       .attr("cy", 340 * binSize)
//       .attr("r", 20 * binSize)
//       .attr("fill", "black")
//       .attr("stroke", "black")
//       .attr("stroke-width", 3 * binSize);

//     wheelGroup
//       .append("polygon")
//       .attr(
//         "points",
//         `${180 * binSize},${315 * binSize} ${180 * binSize},${350 * binSize} ${
//           220 * binSize
//         },${315 * binSize}`
//       )
//       .attr("fill", "white")
//       .attr("stroke", "black")
//       .attr("stroke-width", 3 * binSize)
//       .attr("transform", `rotate(360, ${220 * binSize}, ${310 * binSize})`);
//     wheelGroup
//       .append("polygon")
//       .attr(
//         "points",
//         `${345 * binSize},${315 * binSize} ${345 * binSize},${350 * binSize} ${
//           385 * binSize
//         },${315 * binSize}`
//       )
//       .attr("fill", "white")
//       .attr("stroke", "black")
//       .attr("stroke-width", 3 * binSize)
//       .attr("transform", `rotate(360, ${300 * binSize}, ${310 * binSize})`);

//     wheelGroup
//       .append("rect")
//       .attr("x", 190 * binSize)
//       .attr("y", 301 * binSize)
//       .attr("width", 30 * binSize)
//       .attr("height", 10 * binSize)
//       .attr("fill", "white")
//       .attr("stroke", "black")
//       .attr("stroke-width", 5 * binSize);

//     wheelGroup
//       .append("rect")
//       .attr("x", 355 * binSize)
//       .attr("y", 301 * binSize)
//       .attr("width", 30 * binSize)
//       .attr("height", 10 * binSize)
//       .attr("fill", "white")
//       .attr("stroke", "black")
//       .attr("stroke-width", 5 * binSize);
//   }, [binSize, container]);

//   return null
// };

// export default WheelGroup;
