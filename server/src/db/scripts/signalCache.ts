import { getCollection, Station } from "../Station";

const main = async () => {
  const stations = await getCollection();

  const cursor = stations.find().project({_id: 1, mt: 1, origin:1, signal: 1, name: 1});

  const total = await cursor.count();
  let i = 0;
  while(true){
    console.log(++i, "/", total);
    let item = await cursor.next();
    if(item == null)
      break;
    
    let fm: number[] = [];
    let am: number[] = [];
    if(item.signal?.type === "fm"){
      fm.push(item.signal?.frec);
    } else if(item.signal?.type === "am"){
      am.push(item.signal?.frec);
    }
    
    if(item.mt){
      for(const signal of item.mt.signals){
        if(signal.type === "fm"){
          fm.push(signal.frec);
        } else if(signal.type === "am"){
          am.push(signal.frec);
        }
      }
    }

    await stations.updateOne({_id: item._id}, {
      $set: {signalCache: {am, fm}}
    })
  }
}

main();