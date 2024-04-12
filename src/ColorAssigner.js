// ColorAssigner.js

// Define your colors
const colors = {
    "Bedrijfsafval": "yellow",  // Replace "AfvalSoort1" with your actual AfvalSoort value and "#ff0000" with the color you wan
  'Glas, bont flessen-': "yellow",
  

  'Swill': "green",
  'Ongesorteerd papier en karton, Ind': "blue",
  'Afvalolie (geen afgewerkte olie)': "purple",

  'Bedrijfsafval, grof': "salmon",
  'Frituurvet': "gold",
  
  'Bedrijfsafval ter vernietiging shredderi': "dark red",
  
 // Do this for each unique AfvalSoort value
    // ... add more as needed ...
  };
  
 
  export function getColor(AfvalSoort) {
    return colors[AfvalSoort];}
