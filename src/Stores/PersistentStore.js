import {writable} from "svelte/store";

export function store(key, value){
  
  const _get = () => {
    const json = localStorage.getItem(key);
    if(json != null){
      return JSON.parse(json);
    } else {
      return null;
    }
  }

  const _set = (value) => localStorage.setItem(key, JSON.stringify(value));

  let current = _get();
  
  if(current == null){
    _set(value);
    current = value;
  }

  const store = writable(current);

  const set = (newValue) => {
    current = newValue;
    _set(newValue);
    store.set(newValue);
  }

  const update = (callback) => set(callback(current));

  const get = () => current;

  const subscribe = (...args) => store.subscribe(...args);

  window.addEventListener("storage", (event) => {
    if(event.key !== key) return;
    current = JSON.parse(event.newValue);
    store.set(current);
  })

  return {get, set, update, subscribe, key}
}