import{S as s,i as t,s as e,e as a,D as l,b as c,g as n,E as r,d as h,h as o,k as i,j as f,F as u,a as d,f as p,M as x,c as m,l as v,m as $,n as b,r as E}from"./client.d8002e50.js";function g(s){let t,e,d,p;return{c(){t=a("span"),e=l("("),d=l(s[2]),p=l(")"),this.h()},l(a){t=c(a,"SPAN",{class:!0});var l=n(t);e=r(l,"("),d=r(l,s[2]),p=r(l,")"),l.forEach(h),this.h()},h(){o(t,"class","desc svelte-5xmtb9")},m(s,a){i(s,t,a),f(t,e),f(t,d),f(t,p)},p(s,t){4&t&&u(d,s[2])},d(s){s&&h(t)}}}function A(s){let t,e,m,v,$=s[2]&&g(s);return{c(){t=a("a"),e=a("span"),m=l(s[1]),v=d(),$&&$.c(),this.h()},l(a){t=c(a,"A",{class:!0,href:!0});var l=n(t);e=c(l,"SPAN",{class:!0});var o=n(e);m=r(o,s[1]),o.forEach(h),v=p(l),$&&$.l(l),l.forEach(h),this.h()},h(){o(e,"class","text svelte-5xmtb9"),o(t,"class","no-a svelte-5xmtb9"),o(t,"href",s[0])},m(s,a){i(s,t,a),f(t,e),f(e,m),f(t,v),$&&$.m(t,null)},p(s,[e]){2&e&&u(m,s[1]),s[2]?$?$.p(s,e):($=g(s),$.c(),$.m(t,null)):$&&($.d(1),$=null),1&e&&o(t,"href",s[0])},i:x,o:x,d(s){s&&h(t),$&&$.d()}}}function D(s,t,e){let{href:a}=t,{text:l}=t,{desc:c}=t;return s.$set=s=>{"href"in s&&e(0,a=s.href),"text"in s&&e(1,l=s.text),"desc"in s&&e(2,c=s.desc)},[a,l,c]}class S extends s{constructor(s){super(),t(this,s,D,A,e,{href:0,text:1,desc:2})}}function j(s){let t,e,l;const r=s[1].default,u=m(r,s,s[0],null);return{c(){t=a("div"),e=a("div"),u&&u.c(),this.h()},l(s){t=c(s,"DIV",{class:!0});var a=n(t);e=c(a,"DIV",{class:!0});var l=n(e);u&&u.l(l),l.forEach(h),a.forEach(h),this.h()},h(){o(e,"class","box svelte-1gogfsi"),o(t,"class","link-list-box svelte-1gogfsi")},m(s,a){i(s,t,a),f(t,e),u&&u.m(e,null),l=!0},p(s,[t]){u&&u.p&&1&t&&u.p(v(r,s,s[0],null),$(r,s[0],t,null))},i(s){l||(b(u,s),l=!0)},o(s){E(u,s),l=!1},d(s){s&&h(t),u&&u.d(s)}}}function k(s,t,e){let{$$slots:a={},$$scope:l}=t;return s.$set=s=>{"$$scope"in s&&e(0,l=s.$$scope)},[l,a]}class I extends s{constructor(s){super(),t(this,s,k,j,e,{})}}export{I as L,S as U};