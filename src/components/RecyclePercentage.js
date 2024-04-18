// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";
// import csvFile from "../data/Dataset_Afval Duurzaam Zuyd.csv";

// import "./Trashbin.css";
// const RecyclePercentage = () => {
//   const [percentagesArray, setPercentagesArray] = useState([]);

//   const csvParse = d3.dsvFormat(";");

//   const ref = useRef();

//   useEffect(() => {
//     // Fetch data from csv
//     d3.text(csvFile).then((textData) => {
//       const csvData = csvParse.parse(textData);
//       let processedData = csvData.map((d) => ({
//         Afvalsoort: d.Afvalsoort.trim(),
//         KG: +d.KG,
//         Naam: d.Naam.trim(),
//         Periode: d.Periode.trim(),
//       }));

//       // Group data by location and period
//       let groupedData = d3.group(
//         processedData,
//         (d) => d.Naam,
//         (d) => d.Periode
//       );

//       // Calculate the percentage of recycled trash for each group
//       let percentages = new Map();
//       groupedData.forEach((locationData, location) => {
//         locationData.forEach((periodData, period) => {
//           let totalKG = d3.sum(periodData, (d) => d.KG);
//           let bedrijfsAfvalKG = d3.sum(periodData, (d) => {
//             // Log the 'Afvalsoort' and 'KG' values for debugging

//             return d.Afvalsoort === "Bedrijfsafval" ? d.KG : 0;
//           });

//           let bedrijfsAfvalGrofKG = d3.sum(periodData, (d) => {
//             // Log the 'Afvalsoort' and 'KG' values for debugging

//             return d.Afvalsoort === "Bedrijfsafval, grof" ? d.KG : 0;
//           });
//           let recycledKG = totalKG - bedrijfsAfvalKG - bedrijfsAfvalGrofKG;

         
//           let percentage = (recycledKG / totalKG) * 100;
//           if (!percentages.has(location)) {
//             percentages.set(location, new Map());
//           }
//           percentages.get(location).set(period, percentage);
//         });
//       });

//       // Convert the Map to an array of objects and store it in state
//       let array = [];
//       percentages.forEach((locationData, location) => {
//         locationData.forEach((percentage, period) => {
//           array.push({ location, period, percentage });
//         });
//       });
//       setPercentagesArray(array);

      
//     });
//   }, []);

//   return (
//     <div ref={ref} className="trashbin">
//       {percentagesArray.map((item, index) => (
//         <div key={index}>
//           <p>Location: {item.location}</p>
//           <p>Period: {item.period}</p>
//           <p>Percentage: {item.percentage.toFixed(2)}%</p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default RecyclePercentage;
