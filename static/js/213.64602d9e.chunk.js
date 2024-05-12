"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[213],{213:(t,e,i)=>{i.r(e),i.d(e,{Paginator:()=>mt});var n=i(473),s=i(341);const r=t=>1-(1-t)*(1-t),o=function(t,e,i){let n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:i;const s=t.createRange();return s.setStart(e,i),s.setEnd(e,n),s},a=function(t,e,i){let n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0,s=arguments.length>4&&void 0!==arguments[4]?arguments[4]:e.nodeValue.length;if(s-n===1){return i(o(t,e,n),o(t,e,s))<0?n:s}const r=Math.floor(n+(s-n)/2),h=i(o(t,e,n,r),o(t,e,r,s));return h<0?a(t,e,i,n,r):h>0?a(t,e,i,r,s):r},{SHOW_ELEMENT:h,SHOW_TEXT:l,SHOW_CDATA_SECTION:c,FILTER_ACCEPT:d,FILTER_REJECT:u,FILTER_SKIP:A}=NodeFilter,p=h|l|c,g=(t,e,i,n)=>{var s,r;const o=t.createTreeWalker(t.body,p,{acceptNode:s=>{var r;const o=null===(r=s.localName)||void 0===r?void 0:r.toLowerCase();if("script"===o||"style"===o)return u;if(1===s.nodeType){const{left:t,right:r}=n(s.getBoundingClientRect());if(r<e||t>i)return u;if(t>=e&&r<=i)return d}else{var a;if(null===(a=s.nodeValue)||void 0===a||!a.trim())return A;const r=t.createRange();r.selectNodeContents(s);const{left:o,right:h}=n(r.getBoundingClientRect());if(h>=e&&o<=i)return d}return A}}),h=[];for(let a=o.nextNode();a;a=o.nextNode())h.push(a);const l=null!==(s=h[0])&&void 0!==s?s:t.body,c=null!==(r=h[h.length-1])&&void 0!==r?r:l,g=1===l.nodeType?0:a(t,l,((t,i)=>{const s=n(t.getBoundingClientRect()),r=n(i.getBoundingClientRect());return s.right<e&&r.left>e?0:r.left>e?-1:1})),v=1===c.nodeType?0:a(t,c,((t,e)=>{const s=n(t.getBoundingClientRect()),r=n(e.getBoundingClientRect());return s.right<i&&r.left>i?0:r.left>i?-1:1})),m=t.createRange();return m.setStart(l,g),m.setEnd(c,v),m},v=t=>{const e=t.defaultView.getComputedStyle(t.body);return"rgba(0, 0, 0, 0)"===e.backgroundColor&&"none"===e.backgroundImage?t.defaultView.getComputedStyle(t.documentElement).background:e.background},m=(t,e)=>Array.from({length:t},(()=>{const t=document.createElement("div"),i=document.createElement("div");return t.append(i),i.setAttribute("part",e),t})),f=(t,e)=>{const{style:i}=t;for(const[n,s]of Object.entries(e))i.setProperty(n,s,"important")};var b=(0,s.A)("observer"),y=(0,s.A)("element"),w=(0,s.A)("iframe"),x=(0,s.A)("contentRange"),P=(0,s.A)("overlayer"),O=(0,s.A)("vertical"),E=(0,s.A)("rtl"),j=(0,s.A)("column"),C=(0,s.A)("size"),z=(0,s.A)("layout");class _{constructor(t){let{container:e,onExpand:i}=t;Object.defineProperty(this,b,{writable:!0,value:new ResizeObserver((()=>this.expand()))}),Object.defineProperty(this,y,{writable:!0,value:document.createElement("div")}),Object.defineProperty(this,w,{writable:!0,value:document.createElement("iframe")}),Object.defineProperty(this,x,{writable:!0,value:document.createRange()}),Object.defineProperty(this,P,{writable:!0,value:void 0}),Object.defineProperty(this,O,{writable:!0,value:!1}),Object.defineProperty(this,E,{writable:!0,value:!1}),Object.defineProperty(this,j,{writable:!0,value:!0}),Object.defineProperty(this,C,{writable:!0,value:void 0}),Object.defineProperty(this,z,{writable:!0,value:{}}),this.container=e,this.onExpand=i,(0,n.A)(this,w)[w].setAttribute("part","filter"),(0,n.A)(this,y)[y].append((0,n.A)(this,w)[w]),Object.assign((0,n.A)(this,y)[y].style,{boxSizing:"content-box",position:"relative",overflow:"hidden",flex:"0 0 auto",width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"}),Object.assign((0,n.A)(this,w)[w].style,{overflow:"hidden",border:"0",display:"none",width:"100%",height:"100%"}),(0,n.A)(this,w)[w].setAttribute("sandbox","allow-same-origin allow-scripts"),(0,n.A)(this,w)[w].setAttribute("scrolling","no")}get element(){return(0,n.A)(this,y)[y]}get document(){return(0,n.A)(this,w)[w].contentDocument}async load(t,e,i){if("string"!==typeof t)throw new Error("".concat(t," is not string"));return new Promise((s=>{(0,n.A)(this,w)[w].addEventListener("load",(()=>{const t=this.document;null===e||void 0===e||e(t),(0,n.A)(this,w)[w].style.display="block";const{vertical:r,rtl:o}=(t=>{const{defaultView:e}=t,{writingMode:i,direction:n}=e.getComputedStyle(t.body);return{vertical:"vertical-rl"===i||"vertical-lr"===i,rtl:"rtl"===t.body.dir||"rtl"===n||"rtl"===t.documentElement.dir}})(t),a=v(t);(0,n.A)(this,w)[w].style.display="none",(0,n.A)(this,O)[O]=r,(0,n.A)(this,E)[E]=o,(0,n.A)(this,x)[x].selectNodeContents(t.body);const h=null===i||void 0===i?void 0:i({vertical:r,rtl:o,background:a});(0,n.A)(this,w)[w].style.display="block",this.render(h),(0,n.A)(this,b)[b].observe(t.body),t.fonts.ready.then((()=>this.expand())),s()}),{once:!0}),(0,n.A)(this,w)[w].src=t}))}render(t){t&&((0,n.A)(this,j)[j]="scrolled"!==t.flow,(0,n.A)(this,z)[z]=t,(0,n.A)(this,j)[j]?this.columnize(t):this.scrolled(t))}scrolled(t){let{gap:e,columnWidth:i}=t;const s=(0,n.A)(this,O)[O],r=this.document;f(r.documentElement,{"box-sizing":"border-box",padding:s?"".concat(e,"px 0"):"0 ".concat(e,"px"),"column-width":"auto",height:"auto",width:"auto"}),f(r.body,{[s?"max-height":"max-width"]:"".concat(i,"px"),margin:"auto"}),this.setImageSize(),this.expand()}columnize(t){let{width:e,height:i,gap:s,columnWidth:r}=t;const o=(0,n.A)(this,O)[O];(0,n.A)(this,C)[C]=o?i:e;const a=this.document;f(a.documentElement,{"box-sizing":"border-box","column-width":"".concat(Math.trunc(r),"px"),"column-gap":"".concat(s,"px"),"column-fill":"auto",...o?{width:"".concat(e,"px")}:{height:"".concat(i,"px")},padding:o?"".concat(s/2,"px 0"):"0 ".concat(s/2,"px"),overflow:"hidden","overflow-wrap":"break-word",position:"static",border:"0",margin:"0","max-height":"none","max-width":"none","min-height":"none","min-width":"none","-webkit-line-box-contain":"block glyphs replaced"}),f(a.body,{"max-height":"none","max-width":"none",margin:"0"}),this.setImageSize(),this.expand()}setImageSize(){const{width:t,height:e,margin:i}=(0,n.A)(this,z)[z],s=(0,n.A)(this,O)[O],r=this.document;for(const n of r.body.querySelectorAll("img, svg, video")){const{maxHeight:o,maxWidth:a}=r.defaultView.getComputedStyle(n);f(n,{"max-height":s?"none"!==o&&"0px"!==o?o:"100%":"".concat(e-2*i,"px"),"max-width":s?"".concat(t-2*i,"px"):"none"!==a&&"0px"!==a?a:"100%","object-fit":"contain","page-break-inside":"avoid","break-inside":"avoid","box-sizing":"border-box"})}}expand(){const{documentElement:t}=this.document;if((0,n.A)(this,j)[j]){const e=(0,n.A)(this,O)[O]?"height":"width",i=(0,n.A)(this,O)[O]?"width":"height",s=(0,n.A)(this,x)[x].getBoundingClientRect(),r=t.getBoundingClientRect(),o=((0,n.A)(this,O)[O]?0:(0,n.A)(this,E)[E]?r.right-s.right:s.left-r.left)+s[e],a=Math.ceil(o/(0,n.A)(this,C)[C])*(0,n.A)(this,C)[C];(0,n.A)(this,y)[y].style.padding="0",(0,n.A)(this,w)[w].style[e]="".concat(a,"px"),(0,n.A)(this,y)[y].style[e]="".concat(a+2*(0,n.A)(this,C)[C],"px"),(0,n.A)(this,w)[w].style[i]="100%",(0,n.A)(this,y)[y].style[i]="100%",t.style[e]="".concat((0,n.A)(this,C)[C],"px"),(0,n.A)(this,P)[P]&&((0,n.A)(this,P)[P].element.style.margin="0",(0,n.A)(this,P)[P].element.style.left=(0,n.A)(this,O)[O]?"0":"".concat((0,n.A)(this,C)[C],"px"),(0,n.A)(this,P)[P].element.style.top=(0,n.A)(this,O)[O]?"".concat((0,n.A)(this,C)[C],"px"):"0",(0,n.A)(this,P)[P].element.style[e]="".concat(a,"px"),(0,n.A)(this,P)[P].redraw())}else{const e=(0,n.A)(this,O)[O]?"width":"height",i=(0,n.A)(this,O)[O]?"height":"width",s=t.getBoundingClientRect()[e],{margin:r}=(0,n.A)(this,z)[z],o=(0,n.A)(this,O)[O]?"0 ".concat(r,"px"):"".concat(r,"px 0");(0,n.A)(this,y)[y].style.padding=o,(0,n.A)(this,w)[w].style[e]="".concat(s,"px"),(0,n.A)(this,y)[y].style[e]="".concat(s,"px"),(0,n.A)(this,w)[w].style[i]="100%",(0,n.A)(this,y)[y].style[i]="100%",(0,n.A)(this,P)[P]&&((0,n.A)(this,P)[P].element.style.margin=o,(0,n.A)(this,P)[P].element.style.left="0",(0,n.A)(this,P)[P].element.style.top="0",(0,n.A)(this,P)[P].element.style[e]="".concat(s,"px"),(0,n.A)(this,P)[P].redraw())}this.onExpand()}set overlayer(t){(0,n.A)(this,P)[P]=t,(0,n.A)(this,y)[y].append(t.element)}get overlayer(){return(0,n.A)(this,P)[P]}destroy(){this.document&&(0,n.A)(this,b)[b].unobserve(this.document.body)}}var S=(0,s.A)("root"),T=(0,s.A)("observer"),k=(0,s.A)("top"),M=(0,s.A)("background"),R=(0,s.A)("container"),L=(0,s.A)("header"),B=(0,s.A)("footer"),I=(0,s.A)("view"),V=(0,s.A)("vertical"),N=(0,s.A)("rtl"),F=(0,s.A)("margin"),W=(0,s.A)("index"),D=(0,s.A)("anchor"),H=(0,s.A)("justAnchored"),q=(0,s.A)("locked"),X=(0,s.A)("styles"),Q=(0,s.A)("styleMap"),Y=(0,s.A)("mediaQuery"),G=(0,s.A)("mediaQueryListener"),J=(0,s.A)("scrollBounds"),K=(0,s.A)("touchState"),U=(0,s.A)("touchScrolled"),Z=(0,s.A)("createView"),$=(0,s.A)("beforeRender"),tt=(0,s.A)("onTouchStart"),et=(0,s.A)("onTouchMove"),it=(0,s.A)("onTouchEnd"),nt=(0,s.A)("getRectMapper"),st=(0,s.A)("scrollToRect"),rt=(0,s.A)("scrollTo"),ot=(0,s.A)("scrollToPage"),at=(0,s.A)("selectAnchor"),ht=(0,s.A)("getVisibleRange"),lt=(0,s.A)("afterScroll"),ct=(0,s.A)("display"),dt=(0,s.A)("canGoToIndex"),ut=(0,s.A)("goTo"),At=(0,s.A)("scrollPrev"),pt=(0,s.A)("scrollNext"),gt=(0,s.A)("adjacentIndex"),vt=(0,s.A)("turnPage");class mt extends HTMLElement{constructor(){super(),Object.defineProperty(this,vt,{value:Bt}),Object.defineProperty(this,gt,{value:Lt}),Object.defineProperty(this,pt,{value:Rt}),Object.defineProperty(this,At,{value:Mt}),Object.defineProperty(this,ut,{value:kt}),Object.defineProperty(this,dt,{value:Tt}),Object.defineProperty(this,ct,{value:St}),Object.defineProperty(this,lt,{value:_t}),Object.defineProperty(this,ht,{value:zt}),Object.defineProperty(this,at,{value:Ct}),Object.defineProperty(this,ot,{value:jt}),Object.defineProperty(this,rt,{value:Et}),Object.defineProperty(this,st,{value:Ot}),Object.defineProperty(this,nt,{value:Pt}),Object.defineProperty(this,it,{value:xt}),Object.defineProperty(this,et,{value:wt}),Object.defineProperty(this,tt,{value:yt}),Object.defineProperty(this,$,{value:bt}),Object.defineProperty(this,Z,{value:ft}),Object.defineProperty(this,S,{writable:!0,value:this.attachShadow({mode:"closed"})}),Object.defineProperty(this,T,{writable:!0,value:new ResizeObserver((()=>this.render()))}),Object.defineProperty(this,k,{writable:!0,value:void 0}),Object.defineProperty(this,M,{writable:!0,value:void 0}),Object.defineProperty(this,R,{writable:!0,value:void 0}),Object.defineProperty(this,L,{writable:!0,value:void 0}),Object.defineProperty(this,B,{writable:!0,value:void 0}),Object.defineProperty(this,I,{writable:!0,value:void 0}),Object.defineProperty(this,V,{writable:!0,value:!1}),Object.defineProperty(this,N,{writable:!0,value:!1}),Object.defineProperty(this,F,{writable:!0,value:0}),Object.defineProperty(this,W,{writable:!0,value:-1}),Object.defineProperty(this,D,{writable:!0,value:0}),Object.defineProperty(this,H,{writable:!0,value:!1}),Object.defineProperty(this,q,{writable:!0,value:!1}),Object.defineProperty(this,X,{writable:!0,value:void 0}),Object.defineProperty(this,Q,{writable:!0,value:new WeakMap}),Object.defineProperty(this,Y,{writable:!0,value:matchMedia("(prefers-color-scheme: dark)")}),Object.defineProperty(this,G,{writable:!0,value:void 0}),Object.defineProperty(this,J,{writable:!0,value:void 0}),Object.defineProperty(this,K,{writable:!0,value:void 0}),Object.defineProperty(this,U,{writable:!0,value:void 0}),(0,n.A)(this,S)[S].innerHTML='<style>\n        :host {\n            display: block;\n            container-type: size;\n        }\n        :host, #top {\n            box-sizing: border-box;\n            position: relative;\n            overflow: hidden;\n            width: 100%;\n            height: 100%;\n        }\n        #top {\n            --_gap: 7%;\n            --_margin: 48px;\n            --_max-inline-size: 720px;\n            --_max-block-size: 1440px;\n            --_max-column-count: 2;\n            --_max-column-count-portrait: 1;\n            --_max-column-count-spread: var(--_max-column-count);\n            --_half-gap: calc(var(--_gap) / 2);\n            --_max-width: calc(var(--_max-inline-size) * var(--_max-column-count-spread));\n            --_max-height: var(--_max-block-size);\n            display: grid;\n            grid-template-columns:\n                minmax(var(--_half-gap), 1fr)\n                minmax(0, var(--_max-width))\n                minmax(var(--_half-gap), 1fr);\n            grid-template-rows:\n                minmax(var(--_margin), 1fr)\n                minmax(0, var(--_max-height))\n                minmax(var(--_margin), 1fr);\n            &.vertical {\n                --_max-column-count-spread: var(--_max-column-count-portrait);\n                --_max-width: var(--_max-block-size);\n                --_max-height: calc(var(--_max-inline-size) * var(--_max-column-count-spread));\n            }\n            @container (orientation: portrait) {\n                & {\n                    --_max-column-count-spread: var(--_max-column-count-portrait);\n                }\n                &.vertical {\n                    --_max-column-count-spread: var(--_max-column-count);\n                }\n            }\n        }\n        #background {\n            grid-column-start: 1;\n            grid-column-end: 4;\n            grid-row-start: 1;\n            grid-row-end: 4;\n        }\n        #container {\n            grid-column-start: 2;\n            grid-row-start: 2;\n            overflow: hidden;\n        }\n        :host([flow="scrolled"]) #container {\n            grid-column-start: 1;\n            grid-column-end: 4;\n            grid-row-start: 1;\n            grid-row-end: 4;\n            overflow: auto;\n        }\n        #header {\n            grid-column-start: 2;\n            grid-row-start: 1;\n        }\n        #footer {\n            grid-column-start: 2;\n            grid-row-start: 3;\n            align-self: end;\n        }\n        #header, #footer {\n            display: grid;\n            height: var(--_margin);\n        }\n        :is(#header, #footer) > * {\n            display: flex;\n            align-items: center;\n            min-width: 0;\n        }\n        :is(#header, #footer) > * > * {\n            width: 100%;\n            overflow: hidden;\n            white-space: nowrap;\n            text-overflow: ellipsis;\n            text-align: center;\n            font-size: .75em;\n            opacity: .6;\n        }\n        </style>\n        <div id="top">\n            <div id="background" part="filter"></div>\n            <div id="header"></div>\n            <div id="container"></div>\n            <div id="footer"></div>\n        </div>\n        ',(0,n.A)(this,k)[k]=(0,n.A)(this,S)[S].getElementById("top"),(0,n.A)(this,M)[M]=(0,n.A)(this,S)[S].getElementById("background"),(0,n.A)(this,R)[R]=(0,n.A)(this,S)[S].getElementById("container"),(0,n.A)(this,L)[L]=(0,n.A)(this,S)[S].getElementById("header"),(0,n.A)(this,B)[B]=(0,n.A)(this,S)[S].getElementById("footer"),(0,n.A)(this,T)[T].observe((0,n.A)(this,R)[R]),(0,n.A)(this,R)[R].addEventListener("scroll",((t,e,i)=>{let n;return function(){for(var s=arguments.length,r=new Array(s),o=0;o<s;o++)r[o]=arguments[o];const a=i&&!n;n&&clearTimeout(n),n=setTimeout((()=>{n=null,i||t(...r)}),e),a&&t(...r)}})((()=>{this.scrolled&&((0,n.A)(this,H)[H]?(0,n.A)(this,H)[H]=!1:(0,n.A)(this,lt)[lt]("scroll"))}),250));const t={passive:!1};this.addEventListener("touchstart",(0,n.A)(this,tt)[tt].bind(this),t),this.addEventListener("touchmove",(0,n.A)(this,et)[et].bind(this),t),this.addEventListener("touchend",(0,n.A)(this,it)[it].bind(this)),this.addEventListener("load",(e=>{let{detail:{doc:i}}=e;i.addEventListener("touchstart",(0,n.A)(this,tt)[tt].bind(this),t),i.addEventListener("touchmove",(0,n.A)(this,et)[et].bind(this),t),i.addEventListener("touchend",(0,n.A)(this,it)[it].bind(this))})),(0,n.A)(this,G)[G]=()=>{(0,n.A)(this,I)[I]&&((0,n.A)(this,M)[M].style.background=v((0,n.A)(this,I)[I].document))},(0,n.A)(this,Y)[Y].addEventListener("change",(0,n.A)(this,G)[G])}attributeChangedCallback(t,e,i){switch(t){case"flow":this.render();break;case"gap":case"margin":case"max-block-size":case"max-column-count":(0,n.A)(this,k)[k].style.setProperty("--_"+t,i);break;case"max-inline-size":(0,n.A)(this,k)[k].style.setProperty("--_"+t,i),this.render()}}open(t){this.bookDir=t.dir,this.sections=t.sections}render(){(0,n.A)(this,I)[I]&&((0,n.A)(this,I)[I].render((0,n.A)(this,$)[$]({vertical:(0,n.A)(this,V)[V],rtl:(0,n.A)(this,N)[N]})),this.scrollToAnchor((0,n.A)(this,D)[D]))}get scrolled(){return"scrolled"===this.getAttribute("flow")}get scrollProp(){const{scrolled:t}=this;return(0,n.A)(this,V)[V]?t?"scrollLeft":"scrollTop":t?"scrollTop":"scrollLeft"}get sideProp(){const{scrolled:t}=this;return(0,n.A)(this,V)[V]?t?"width":"height":t?"height":"width"}get size(){return(0,n.A)(this,R)[R].getBoundingClientRect()[this.sideProp]}get viewSize(){return(0,n.A)(this,I)[I].element.getBoundingClientRect()[this.sideProp]}get start(){return Math.abs((0,n.A)(this,R)[R][this.scrollProp])}get end(){return this.start+this.size}get page(){return Math.floor((this.start+this.end)/2/this.size)}get pages(){return Math.round(this.viewSize/this.size)}scrollBy(t,e){const i=(0,n.A)(this,V)[V]?e:t,s=(0,n.A)(this,R)[R],{scrollProp:r}=this,[o,a,h]=(0,n.A)(this,J)[J],l=(0,n.A)(this,N)[N],c=l?o-h:o-a,d=l?o+a:o+h;s[r]=Math.max(c,Math.min(d,s[r]+i))}snap(t,e){const i=(0,n.A)(this,V)[V]?e:t,[s,r,o]=(0,n.A)(this,J)[J],{start:a,end:h,pages:l,size:c}=this,d=Math.abs(s)-r,u=Math.abs(s)+o,A=i*((0,n.A)(this,N)[N]?-c:c),p=Math.floor(Math.max(d,Math.min(u,(a+h)/2+(isNaN(A)?0:A)))/c);(0,n.A)(this,ot)[ot](p,"snap").then((()=>{const t=p<=0?-1:p>=l-1?1:null;if(t)return(0,n.A)(this,ut)[ut]({index:(0,n.A)(this,gt)[gt](t),anchor:t<0?()=>1:()=>0})}))}async scrollToAnchor(t,e){var i,s;(0,n.A)(this,D)[D]=t;const r=null===(i=(t=>{if(null===t||void 0===t||!t.collapsed)return t;const{endOffset:e,endContainer:i}=t;if(1===i.nodeType)return i;if(e+1<i.length)t.setEnd(i,e+1);else{if(!(e>1))return i.parentNode;t.setStart(i,e-1)}return t})(t))||void 0===i||null===(s=i.getClientRects)||void 0===s?void 0:s.call(i);if(r){const t=Array.from(r).find((t=>t.width>0&&t.height>0))||r[0];if(!t)return;return await(0,n.A)(this,st)[st](t,"anchor"),void(e&&(0,n.A)(this,at)[at]())}if(this.scrolled)return void await(0,n.A)(this,rt)[rt](t*this.viewSize,"anchor");const{pages:o}=this;if(!o)return;const a=o-2,h=Math.round(t*(a-1));await(0,n.A)(this,ot)[ot](h+1,"anchor")}async goTo(t){if((0,n.A)(this,q)[q])return;const e=await t;return(0,n.A)(this,dt)[dt](e.index)?(0,n.A)(this,ut)[ut](e):void 0}get atStart(){return null==(0,n.A)(this,gt)[gt](-1)&&this.page<=1}get atEnd(){return null==(0,n.A)(this,gt)[gt](1)&&this.page>=this.pages-2}prev(t){return(0,n.A)(this,vt)[vt](-1,t)}next(t){return(0,n.A)(this,vt)[vt](1,t)}prevSection(){return this.goTo({index:(0,n.A)(this,gt)[gt](-1)})}nextSection(){return this.goTo({index:(0,n.A)(this,gt)[gt](1)})}firstSection(){const t=this.sections.findIndex((t=>"no"!==t.linear));return this.goTo({index:t})}lastSection(){const t=this.sections.findLastIndex((t=>"no"!==t.linear));return this.goTo({index:t})}getContents(){return(0,n.A)(this,I)[I]?[{index:(0,n.A)(this,W)[W],overlayer:(0,n.A)(this,I)[I].overlayer,doc:(0,n.A)(this,I)[I].document}]:[]}setStyles(t){var e,i,s,r,o;(0,n.A)(this,X)[X]=t;const a=(0,n.A)(this,Q)[Q].get(null===(e=(0,n.A)(this,I)[I])||void 0===e?void 0:e.document);if(!a)return;const[h,l]=a;if(Array.isArray(t)){const[e,i]=t;h.textContent=e,l.textContent=i}else l.textContent=t;(0,n.A)(this,M)[M].style.background=v((0,n.A)(this,I)[I].document),null===(i=(0,n.A)(this,I)[I])||void 0===i||null===(s=i.document)||void 0===s||null===(r=s.fonts)||void 0===r||null===(o=r.ready)||void 0===o||o.then((()=>(0,n.A)(this,I)[I].expand()))}destroy(){var t,e;(0,n.A)(this,T)[T].unobserve(this),(0,n.A)(this,I)[I].destroy(),(0,n.A)(this,I)[I]=null,null===(t=this.sections[(0,n.A)(this,W)[W]])||void 0===t||null===(e=t.unload)||void 0===e||e.call(t),(0,n.A)(this,Y)[Y].removeEventListener("change",(0,n.A)(this,G)[G])}}function ft(){return(0,n.A)(this,I)[I]&&((0,n.A)(this,I)[I].destroy(),(0,n.A)(this,R)[R].removeChild((0,n.A)(this,I)[I].element)),(0,n.A)(this,I)[I]=new _({container:this,onExpand:()=>this.scrollToAnchor((0,n.A)(this,D)[D])}),(0,n.A)(this,R)[R].append((0,n.A)(this,I)[I].element),(0,n.A)(this,I)[I]}function bt(t){let{vertical:e,rtl:i,background:s}=t;(0,n.A)(this,V)[V]=e,(0,n.A)(this,N)[N]=i,(0,n.A)(this,k)[k].classList.toggle("vertical",e),(0,n.A)(this,M)[M].style.background=s;const{width:r,height:o}=(0,n.A)(this,R)[R].getBoundingClientRect(),a=e?o:r,h=getComputedStyle((0,n.A)(this,k)[k]),l=parseFloat(h.getPropertyValue("--_max-inline-size")),c=parseInt(h.getPropertyValue("--_max-column-count-spread")),d=parseFloat(h.getPropertyValue("--_margin"));(0,n.A)(this,F)[F]=d;const u=parseFloat(h.getPropertyValue("--_gap"))/100,A=-u/(u-1)*a,p=this.getAttribute("flow");if("scrolled"===p){this.setAttribute("dir",e?"rtl":"ltr"),(0,n.A)(this,k)[k].style.padding="0";const t=l;return this.heads=null,this.feet=null,(0,n.A)(this,L)[L].replaceChildren(),(0,n.A)(this,B)[B].replaceChildren(),{flow:p,margin:d,gap:A,columnWidth:t}}const g=Math.min(c,Math.ceil(a/l)),v=a/g-A;this.setAttribute("dir",i?"rtl":"ltr");const f=e?Math.min(2,Math.ceil(r/l)):g,b={gridTemplateColumns:"repeat(".concat(f,", 1fr)"),gap:"".concat(A,"px"),padding:e?"0":"0 ".concat(A/2,"px"),direction:"rtl"===this.bookDir?"rtl":"ltr"};Object.assign((0,n.A)(this,L)[L].style,b),Object.assign((0,n.A)(this,B)[B].style,b);const y=m(f,"head"),w=m(f,"foot");return this.heads=y.map((t=>t.children[0])),this.feet=w.map((t=>t.children[0])),(0,n.A)(this,L)[L].replaceChildren(...y),(0,n.A)(this,B)[B].replaceChildren(...w),{height:o,width:r,margin:d,gap:A,columnWidth:v}}function yt(t){const e=t.changedTouches[0];(0,n.A)(this,K)[K]={x:null===e||void 0===e?void 0:e.screenX,y:null===e||void 0===e?void 0:e.screenY,t:t.timeStamp,vx:0,xy:0}}function wt(t){const e=(0,n.A)(this,K)[K];if(e.pinched)return;if(e.pinched=globalThis.visualViewport.scale>1,this.scrolled||e.pinched)return;if(t.touches.length>1)return void((0,n.A)(this,U)[U]&&t.preventDefault());t.preventDefault();const i=t.changedTouches[0],s=i.screenX,r=i.screenY,o=e.x-s,a=e.y-r,h=t.timeStamp-e.t;e.x=s,e.y=r,e.t=t.timeStamp,e.vx=o/h,e.vy=a/h,(0,n.A)(this,U)[U]=!0,this.scrollBy(o,a)}function xt(){(0,n.A)(this,U)[U]=!1,this.scrolled||requestAnimationFrame((()=>{1===globalThis.visualViewport.scale&&this.snap((0,n.A)(this,K)[K].vx,(0,n.A)(this,K)[K].vy)}))}function Pt(){if(this.scrolled){const t=this.viewSize,e=(0,n.A)(this,F)[F];return(0,n.A)(this,V)[V]?i=>{let{left:n,right:s}=i;return{left:t-s-e,right:t-n-e}}:t=>{let{top:i,bottom:n}=t;return{left:i+e,right:n+e}}}const t=this.pages*this.size;return(0,n.A)(this,N)[N]?e=>{let{left:i,right:n}=e;return{left:t-n,right:t-i}}:(0,n.A)(this,V)[V]?t=>{let{top:e,bottom:i}=t;return{left:e,right:i}}:t=>t}async function Ot(t,e){if(this.scrolled){const i=(0,n.A)(this,nt)[nt]()(t).left-(0,n.A)(this,F)[F];return(0,n.A)(this,rt)[rt](i,e)}const i=(0,n.A)(this,nt)[nt]()(t).left+(0,n.A)(this,F)[F]/2;return(0,n.A)(this,ot)[ot](Math.floor(i/this.size)+((0,n.A)(this,N)[N]?-1:1),e)}async function Et(t,e,i){const s=(0,n.A)(this,R)[R],{scrollProp:o,size:a}=this;return s[o]===t?((0,n.A)(this,J)[J]=[t,this.atStart?0:a,this.atEnd?0:a],void(0,n.A)(this,lt)[lt](e)):(this.scrolled&&(0,n.A)(this,V)[V]&&(t=-t),("snap"===e||i)&&this.hasAttribute("animated")?(h=s[o],l=t,c=300,d=r,u=t=>s[o]=t,new Promise((t=>{let e;const i=n=>{var s;null!==(s=e)&&void 0!==s||(e=n);const r=Math.min(1,(n-e)/c);var o,a;u((o=h,a=l,d(r)*(a-o)+o)),r<1?requestAnimationFrame(i):t()};requestAnimationFrame(i)}))).then((()=>{(0,n.A)(this,J)[J]=[t,this.atStart?0:a,this.atEnd?0:a],(0,n.A)(this,lt)[lt](e)})):(s[o]=t,(0,n.A)(this,J)[J]=[t,this.atStart?0:a,this.atEnd?0:a],void(0,n.A)(this,lt)[lt](e)));var h,l,c,d,u}async function jt(t,e,i){const s=this.size*((0,n.A)(this,N)[N]?-t:t);return(0,n.A)(this,rt)[rt](s,e,i)}function Ct(){const{defaultView:t}=(0,n.A)(this,I)[I].document;if((0,n.A)(this,D)[D].startContainer){const e=t.getSelection();e.removeAllRanges(),e.addRange((0,n.A)(this,D)[D])}}function zt(){if(this.scrolled)return g((0,n.A)(this,I)[I].document,this.start+(0,n.A)(this,F)[F],this.end-(0,n.A)(this,F)[F],(0,n.A)(this,nt)[nt]());const t=(0,n.A)(this,N)[N]?-this.size:this.size;return g((0,n.A)(this,I)[I].document,this.start-t,this.end-t,(0,n.A)(this,nt)[nt]())}function _t(t){const e=(0,n.A)(this,ht)[ht]();"anchor"!==t?(0,n.A)(this,D)[D]=e:(0,n.A)(this,H)[H]=!0;const i={reason:t,range:e,index:(0,n.A)(this,W)[W]};if(this.scrolled)i.fraction=this.start/this.viewSize;else if(this.pages>0){const{page:t,pages:e}=this;(0,n.A)(this,L)[L].style.visibility=t>1?"visible":"hidden",i.fraction=(t-1)/(e-2),i.size=1/(e-2)}this.dispatchEvent(new CustomEvent("relocate",{detail:i}))}async function St(t){var e;const{index:i,src:s,anchor:r,onLoad:o,select:a}=await t;if((0,n.A)(this,W)[W]=i,s){const t=(0,n.A)(this,Z)[Z](),e=t=>{if(t.head){const e=t.createElement("style");t.head.prepend(e);const i=t.createElement("style");t.head.append(i),(0,n.A)(this,Q)[Q].set(t,[e,i])}null===o||void 0===o||o({doc:t,index:i})},r=(0,n.A)(this,$)[$].bind(this);await t.load(s,e,r),this.dispatchEvent(new CustomEvent("create-overlayer",{detail:{doc:t.document,index:i,attach:e=>t.overlayer=e}})),(0,n.A)(this,I)[I]=t}await this.scrollToAnchor(null!==(e="function"===typeof r?r((0,n.A)(this,I)[I].document):r)&&void 0!==e?e:0,a)}function Tt(t){return t>=0&&t<=this.sections.length-1}async function kt(t){let{index:e,anchor:i,select:s}=t;if(e===(0,n.A)(this,W)[W])await(0,n.A)(this,ct)[ct]({index:e,anchor:i,select:s});else{const t=(0,n.A)(this,W)[W],r=e=>{var i,s;null===(i=this.sections[t])||void 0===i||null===(s=i.unload)||void 0===s||s.call(i),this.setStyles((0,n.A)(this,X)[X]),this.dispatchEvent(new CustomEvent("load",{detail:e}))};await(0,n.A)(this,ct)[ct](Promise.resolve(this.sections[e].load()).then((t=>({index:e,src:t,anchor:i,onLoad:r,select:s}))).catch((t=>(console.warn(t),console.warn(new Error("Failed to load section ".concat(e))),{}))))}}function Mt(t){if(!(0,n.A)(this,I)[I])return!0;if(this.scrolled)return!(this.start>0)||(0,n.A)(this,rt)[rt](Math.max(0,this.start-(null!==t&&void 0!==t?t:this.size)),null,!0);if(this.atStart)return;const e=this.page-1;return(0,n.A)(this,ot)[ot](e,"page",!0).then((()=>e<=0))}function Rt(t){if(!(0,n.A)(this,I)[I])return!0;if(this.scrolled)return!(this.viewSize-this.end>2)||(0,n.A)(this,rt)[rt](Math.min(this.viewSize,t?this.start+t:this.end),null,!0);if(this.atEnd)return;const e=this.page+1,i=this.pages;return(0,n.A)(this,ot)[ot](e,"page",!0).then((()=>e>=i-1))}function Lt(t){for(let i=(0,n.A)(this,W)[W]+t;(0,n.A)(this,dt)[dt](i);i+=t){var e;if("no"!==(null===(e=this.sections[i])||void 0===e?void 0:e.linear))return i}}async function Bt(t,e){if((0,n.A)(this,q)[q])return;(0,n.A)(this,q)[q]=!0;const i=-1===t,s=await(i?(0,n.A)(this,At)[At](e):(0,n.A)(this,pt)[pt](e));var r;s&&await(0,n.A)(this,ut)[ut]({index:(0,n.A)(this,gt)[gt](t),anchor:i?()=>1:()=>0}),!s&&this.hasAttribute("animated")||await(r=100,new Promise((t=>setTimeout(t,r)))),(0,n.A)(this,q)[q]=!1}mt.observedAttributes=["flow","gap","margin","max-inline-size","max-block-size","max-column-count"],customElements.define("foliate-paginator",mt)}}]);
//# sourceMappingURL=213.64602d9e.chunk.js.map