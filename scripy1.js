const fs = require('fs');
const { json } = require('stream/consumers');
// const data = JSON.parse(fs.readFileSync(`${__dirname}/scripy1.js`, 'utf-8'));
// console.log(data);
function splitting(data) {
  return data.split('<br/>');
}
const data = fs.readFileSync('./history.json', 'utf-8', (err, da) => {
  console.log('hhhh');
});
const value = ['lord'];
const dataparse = JSON.parse(data);
// const newData = { ...dataparse };
value.map((item) => {
  if (dataparse[item] && dataparse[item].description) {
    const main = dataparse[item].description;
    const description = main.split('<br/>');
    dataparse[item].description = description;
  }
  dataparse[item].subTitle.map((eachItem) => {
    // console.log('eachItem', eachItem.data);
    eachItem?.data?.map((values) => {
      // console.log(values.description);
      if (values && values.description) {
        let newValues = values.description.split('<br/>');
        values.description = newValues;
        // console.log(newValues);
      }
    });
  });
});
// console.log(JSON.stringify(dataparse));
fs.writeFileSync(
  './history.json',
  JSON.stringify(dataparse),
  'utf-8',
  (err) => {
    console.log('hell');
  },
);
