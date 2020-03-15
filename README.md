# Openradio.app

This is the main repo to the [openradio.app](https://openradio.app) app

This repo is divided into three subfolders

**./src** contains the code for the sapper app that runs the site (it executes client and server side)

**./server** contains the server side only code (backend)

**./rs** contains code for the search engine written in [Rust](https://rust-lang.org)

For more info see the readme's for each subdir

### Run
This repo provides precompiled files of the typescript and sapper part but you need to compile the rust part to make it run
```sh
git clone https://github.com/ramiroaisen/openradio
cd openradio
npm i
cd server && npm i && cd ..
cd rs && cargo build --release && cd ..
node run
```


### Build
**server** 
```sh
cd server
npx tsc
```

**rs**
```sh
cd rs
cargo build --release
```

**app**
```sh
npm run build
```
Then you can run the app with
```sh
node run
```


### Used technologies
[Rust](https://rust-lang.org). Rust is an alternative to C and C++. It provides memory safety and concurrency with performance similar (sometimes faster) to C and C++. It is used to make the search engine of the app 

[svelte](https://svelte.dev). Awesome library that provides reactivity to Javascript and **surgically** updates the DOM accordingly. As it is a compiler, it has no runtime dependencies. If you like React you'll love svelte.

[sapper](https://sapper.svelte.dev). Sapper provides a way to SSR svelte components and then hydrates them client side with the same source code.

[express](https://expressjs.com). Http framework for node

[nginx](https://nginx.com). Reverse proxy for ssl (production only).

[typescript](https://www.typescriptlang.org/) Strongly typed JS compiler.

[mongodb](https://www.mongodb.com) NoSQL database with real time [change streams](https://www.mongodb.com/blog/post/an-introduction-to-change-streams)

