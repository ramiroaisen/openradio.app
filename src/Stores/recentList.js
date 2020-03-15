import {store} from "./PersistentStore";
import {writable} from "svelte/store";

export let recentList;

if(process.browser){
  recentList = store("recent-stations-v1", []);
} else {
  recentList = writable([])
}