// ColorAssigner.js

// Define your colors
const colors = {
  'Bedrijfsafval': ' #FF0038 ',
  'Bedrijfsafval, grof': 'orange',
  'Glas, bont flessen-': 'yellow',
  'Ongesorteerd papier en karton, Ind': ' #0094ff ',
  'Koffiedik': 'grey',
  'PBD Bedrijven': 'grey',
  'Swill': 'grey',
  'Afvalolie (geen afgewerkte olie)': 'grey',
  'Anorganische basen': 'grey',
  'Anorganische zuren': 'grey',
  'Archief': 'grey',
  'Oplosmiddelen halogeenarm (kvp)': 'grey',
  'Oplosmiddelen, halogeenrijk': 'grey',
  'Opruimafval/filters met chem.resten': 'grey',
  'Risico houdend medisch afval/Specifiek z': 'grey',
  'BSA gemengd': 'grey',
  'Frituurvet': 'grey',
  'Detergenten / reinigingsmiddelen (kvp)': 'grey',
  'Verf/inkt vast/pasteus, milieugev (kvp)': 'grey',
  'Kwikhoudend afval': 'grey',
  'RMA/Specifiek Ziekenhuis Afval': 'grey',
  'Batterijen (droog)': 'grey',
  'Desinfectiemiddel obv BCDMH': 'grey',
  'Kantoorafval KGA': 'grey',
  'Labchemicalien': 'grey',
  'Vertrouwelijk Archief': 'grey',
  'Vertrouw.archief, sterk vervuild': 'grey',
  'Bedrijfsafval ter vernietiging shredderi': 'grey',
  'Klein kunststof ter vernietiging': 'grey',
  'Ontwikkelaar, plaat': 'grey',
  'Spuitbussen': 'grey',
  'Oliefilters': 'grey',
  'TL lampen, rechte': 'grey',
  'Polyamide (PA)': 'grey',
  'Boor-, snij-, slijp-, walsolie en emulsi': 'grey',
  'Beeldschermen': 'grey',
  'Elektronica': 'grey',
  'Koelkasten (witgoed)': 'grey',
  'PD Bedrijven': 'grey',
  'Lampen, ongesorteerd': 'grey',
  'Inktafval vast/pasteus (kvp)': 'grey',
  'Latex (kvp)': 'grey',
  'Lijm/hars/kit vast/pasteus (kvp)': 'grey',
  'TL lampen, overig': 'grey'

  };
  
 
  export function getColor(AfvalSoort) {
    return colors[AfvalSoort];}
