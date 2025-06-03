import{r as x}from"./chunk-DQRVZFIR-CI4QRDf9.js";var p={exports:{}},a={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var c;function R(){if(c)return a;c=1;var t=Symbol.for("react.transitional.element"),n=Symbol.for("react.fragment");function r(m,e,s){var o=null;if(s!==void 0&&(o=""+s),e.key!==void 0&&(o=""+e.key),"key"in e){s={};for(var u in e)u!=="key"&&(s[u]=e[u])}else s=e;return e=s.ref,{$$typeof:t,type:m,key:o,ref:e!==void 0?e:null,props:s}}return a.Fragment=n,a.jsx=r,a.jsxs=r,a}var l;function E(){return l||(l=1,p.exports=R()),p.exports}var j=E();const h=/&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g,f={"&amp;":"&","&#38;":"&","&lt;":"<","&#60;":"<","&gt;":">","&#62;":">","&apos;":"'","&#39;":"'","&quot;":'"',"&#34;":'"',"&nbsp;":" ","&#160;":" ","&copy;":"©","&#169;":"©","&reg;":"®","&#174;":"®","&hellip;":"…","&#8230;":"…","&#x2F;":"/","&#47;":"/"},v=t=>f[t],N=t=>t.replace(h,v);let i={bindI18n:"languageChanged",bindI18nStore:"",transEmptyNodeValue:"",transSupportBasicHtmlNodes:!0,transWrapTextNodes:"",transKeepBasicHtmlNodesFor:["br","strong","i","p"],useSuspense:!0,unescape:N};const k=(t={})=>{i={...i,...t}},I=()=>i;let d;const T=t=>{d=t},_=()=>d,q=x.createContext();class C{constructor(){this.usedNamespaces={}}addUsedNamespaces(n){n.forEach(r=>{this.usedNamespaces[r]||(this.usedNamespaces[r]=!0)})}getUsedNamespaces(){return Object.keys(this.usedNamespaces)}}export{q as I,C as R,I as a,T as b,_ as g,j,k as s};
