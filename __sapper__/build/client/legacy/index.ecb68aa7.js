import{A as n,B as t,p as a,P as r,_ as s,a as i,b as o,c as e,i as c,s as u,d as f,S as p,C as l,D as g,E as $,v as d,y as m,F as y,G as h,H as v,I as x,J as U,f as b,M as j,g as C,h as I,l as w,N as P,j as k,k as E,o as H,n as R,O as q}from"./client.b3e63f2a.js";import{P as A}from"./Page.8812cebb.js";import{R as B}from"./RadioList.16b0f023.js";function D(n){var t,a,r,s,i=n[5]("countryIndex.title",{country:n[5]("countries.".concat(n[6]))})+"",o=new B({props:{url:n[0],apiUrl:n[1],stations:n[2],paging:n[3]}});return{c:function(){t=b("h1"),a=j(i),r=C(),l(o.$$.fragment)},l:function(n){t=I(n,"H1",{});var s=w(t);a=P(s,i),s.forEach(k),r=E(n),g(o.$$.fragment,n)},m:function(n,i){H(n,t,i),R(t,a),H(n,r,i),$(o,n,i),s=!0},p:function(n,t){(!s||96&t)&&i!==(i=n[5]("countryIndex.title",{country:n[5]("countries.".concat(n[6]))})+"")&&q(a,i);var r={};1&t&&(r.url=n[0]),2&t&&(r.apiUrl=n[1]),4&t&&(r.stations=n[2]),8&t&&(r.paging=n[3]),o.$set(r)},i:function(n){s||(d(o.$$.fragment,n),s=!0)},o:function(n){m(o.$$.fragment,n),s=!1},d:function(n){n&&k(t),n&&k(r),y(o,n)}}}function F(n){var t,r=new A({props:{meta:n[4],$$slots:{default:[D]},$$scope:{ctx:n}}});return{c:function(){l(r.$$.fragment)},l:function(n){g(r.$$.fragment,n)},m:function(n,a){$(r,n,a),t=!0},p:function(n,t){var s=a(t,1)[0],i={};16&s&&(i.meta=n[4]),4207&s&&(i.$$scope={dirty:s,ctx:n}),r.$set(i)},i:function(n){t||(d(r.$$.fragment,n),t=!0)},o:function(n){m(r.$$.fragment,n),t=!1},d:function(n){y(r,n)}}}function G(n,t){return J.apply(this,arguments)}function J(){return(J=n(t.mark(function n(s,i){var o,e,c,u,f,p,l;return t.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return o=s.params.langCountry.split("-"),e=a(o,2),c=e[0],u=e[1],f=r({lang:c,countryCode:u}),p="/api/stations/".concat(u),n.next=5,this.fetch(p+"?page="+(s.query.page||1)).then(function(n){return n.json()});case 5:return l=n.sent,n.abrupt("return",{url:f,apiUrl:p,stations:l.items,paging:l.paging});case 7:case"end":return n.stop()}},n,this)}))).apply(this,arguments)}function L(n,t,a){h().page;var s,i,o,e=v(),c=e.trans,u=e.lang,f=e.countryCode;x(n,c,function(n){return a(5,s=n)}),x(n,u,function(n){return a(10,o=n)}),x(n,f,function(n){return a(6,i=n)});var p,l=t.url,g=t.apiUrl,$=t.stations,d=t.paging;return n.$set=function(n){"url"in n&&a(0,l=n.url),"apiUrl"in n&&a(1,g=n.apiUrl),"stations"in n&&a(2,$=n.stations),"paging"in n&&a(3,d=n.paging)},n.$$.update=function(){1120&n.$$.dirty&&a(4,p={title:s("countryIndex.head.title",{country:s("countries.".concat(i))}),desc:s("countryIndex.head.desc",{country:s("countries.".concat(i))}),canonical:U(r({lang:o,countryCode:i}))})},[l,g,$,d,p,s,i,c,u,f]}export default(function(n){function t(n){var a;return i(this,t),a=o(this,e(t).call(this)),c(f(a),n,L,F,u,{url:0,apiUrl:1,stations:2,paging:3}),a}return s(t,p),t}());export{G as preload};