import{S as t,i as e,s as a,v as s,w as n,x as r,n as o,r as l,y as c,z as $,A as f,B as i,N as g,C as m,O as p,e as d,D as u,a as h,b as x,g as v,E as j,d as b,f as w,k as y,j as B,F as L,M as P,P as k,H as C,I as E,J as H,K as N}from"./client.d8002e50.js";import{P as O}from"./Page.0abb2221.js";import{L as z,U as A}from"./LinkListBox.2588c818.js";function D(t,e,a){const s=t.slice();return s[4]=e[a],s}function F(t){let e;const a=new A({props:{href:N({lang:t[4].code}),text:t[4].native,desc:t[4].en}});return{c(){s(a.$$.fragment)},l(t){n(a.$$.fragment,t)},m(t,s){r(a,t,s),e=!0},p:P,i(t){e||(o(a.$$.fragment,t),e=!0)},o(t){l(a.$$.fragment,t),e=!1},d(t){c(a,t)}}}function I(t){let e,a,s=t[3],n=[];for(let e=0;e<s.length;e+=1)n[e]=F(D(t,s,e));const r=t=>l(n[t],1,1,()=>{n[t]=null});return{c(){for(let t=0;t<n.length;t+=1)n[t].c();e=k()},l(t){for(let e=0;e<n.length;e+=1)n[e].l(t);e=k()},m(t,s){for(let e=0;e<n.length;e+=1)n[e].m(t,s);y(t,e,s),a=!0},p(t,a){if(8&a){let l;for(s=t[3],l=0;l<s.length;l+=1){const r=D(t,s,l);n[l]?(n[l].p(r,a),o(n[l],1)):(n[l]=F(r),n[l].c(),o(n[l],1),n[l].m(e.parentNode,e))}for(C(),l=s.length;l<n.length;l+=1)r(l);E()}},i(t){if(!a){for(let t=0;t<s.length;t+=1)o(n[t]);a=!0}},o(t){n=n.filter(Boolean);for(let t=0;t<n.length;t+=1)l(n[t]);a=!1},d(t){H(n,t),t&&b(e)}}}function J(t){let e,a,$,f,i=t[1]("langs.title")+"";const g=new z({props:{$$slots:{default:[I]},$$scope:{ctx:t}}});return{c(){e=d("h1"),a=u(i),$=h(),s(g.$$.fragment)},l(t){e=x(t,"H1",{});var s=v(e);a=j(s,i),s.forEach(b),$=w(t),n(g.$$.fragment,t)},m(t,s){y(t,e,s),B(e,a),y(t,$,s),r(g,t,s),f=!0},p(t,e){(!f||2&e)&&i!==(i=t[1]("langs.title")+"")&&L(a,i);const s={};512&e&&(s.$$scope={dirty:e,ctx:t}),g.$set(s)},i(t){f||(o(g.$$.fragment,t),f=!0)},o(t){l(g.$$.fragment,t),f=!1},d(t){t&&b(e),t&&b($),c(g,t)}}}function K(t){let e;const a=new O({props:{meta:t[0],$$slots:{default:[J]},$$scope:{ctx:t}}});return{c(){s(a.$$.fragment)},l(t){n(a.$$.fragment,t)},m(t,s){r(a,t,s),e=!0},p(t,[e]){const s={};1&e&&(s.meta=t[0]),514&e&&(s.$$scope={dirty:e,ctx:t}),a.$set(s)},i(t){e||(o(a.$$.fragment,t),e=!0)},o(t){l(a.$$.fragment,t),e=!1},d(t){c(a,t)}}}function M(t,e,a){let s,n;const{page:r}=$(),{lang:o,trans:l}=f();i(t,o,t=>a(5,n=t)),i(t,l,t=>a(1,s=t));const c=Object.values(g).sort((t,e)=>{t.native.localeCompare(e.native)});let d;return t.$$.update=()=>{34&t.$$.dirty&&a(0,d={title:s("langs.head.title"),desc:s("langs.head.desc"),canonical:m(p({lang:n}))})},[d,s,l,c,o]}export default class extends t{constructor(t){super(),e(this,t,M,K,a,{})}}