const addon = require('../native');

async function start(){
  const start = Date.now();
  await search({q: "", page: 1, pageSize: 1})
  console.log(`[search] index created in ${Date.now() - start}`);
}

function search(query){
  return new Promise((resolve, reject) => {
    addon.search(query, (err, result) => {
      if(err != null){
        reject(err);
      } else {
        resolve(result);
      }
    })
  })
}

/*
(async () => {
  console.log(JSON.stringify(await search(query), null, 2));
})()
*/

module.exports = {start, search}