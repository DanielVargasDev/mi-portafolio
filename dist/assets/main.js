var ht=`
attribute vec3 pa;
attribute vec3 pb;
attribute vec3 pc;
attribute float sem;
uniform float uT;
uniform float uM;
uniform float uAsp;
uniform float uRotY;
uniform float uRotX;
uniform float uPix;
uniform float uEsc;
uniform vec2 uOff;
varying float vSem;
varying float vLuz;

void main() {
  float m1 = smoothstep(0.0, 1.0, clamp(uM, 0.0, 1.0));
  float m2 = smoothstep(0.0, 1.0, clamp(uM - 1.0, 0.0, 1.0));
  vec3 p = mix(pa, pb, m1);
  p = mix(p, pc, m2);

  p += 0.035 * vec3(
    sin(uT * 0.8 + sem * 40.0),
    cos(uT * 0.7 + sem * 30.0),
    sin(uT * 0.9 + sem * 20.0)
  );

  float cy = cos(uRotY), sy = sin(uRotY);
  p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
  float cx = cos(uRotX), sx = sin(uRotX);
  p = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);
  p *= uEsc;

  float w = 4.6 - p.z;
  float f = 2.414;
  gl_Position = vec4(p.x * f / uAsp + uOff.x * w, p.y * f + uOff.y * w, 0.0, w);
  gl_PointSize = uPix * (0.9 + 1.8 * fract(sem * 7.0)) * 13.0 / w;
  vSem = sem;
  vLuz = clamp(1.5 - (w - 3.2) / 3.0, 0.25, 1.0);
}
`,vt=`
precision mediump float;
uniform float uAlfa;
varying float vSem;
varying float vLuz;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d);
  vec3 lima = vec3(0.776, 0.957, 0.196);
  vec3 hielo = vec3(0.56, 0.77, 0.83);
  vec3 c = mix(hielo, lima, smoothstep(0.55, 0.85, vSem));
  gl_FragColor = vec4(c * vLuz * a * uAlfa, 1.0);
}
`;function gt(e){let o=new Float32Array(e*10),t=Math.random,r=()=>(t()+t()+t()-1.5)/1.5,i=Math.PI*(1+Math.sqrt(5));for(let c=0;c<e;c++){let s=c*10,l=c+.5,y=Math.acos(1-2*l/e),A=i*l,a=1.5*(.97+t()*.06);o[s]=a*Math.cos(A)*Math.sin(y),o[s+1]=a*Math.cos(y),o[s+2]=a*Math.sin(A)*Math.sin(y);let h=t()*Math.PI*2,S=Math.cos(3*h)+2;o[s+3]=.52*S*Math.cos(2*h)+r()*.09,o[s+4]=.52*S*Math.sin(2*h)+r()*.09,o[s+5]=-.7*Math.sin(3*h)+r()*.09;let b=Math.floor(t()*3),q=t()>.5?1:-1,x=1.25,v=.31,F=Math.round((t()*2-1)*x/v)*v,I=Math.round((t()*2-1)*x/v)*v,f=[0,0,0];f[b]=q*x,f[(b+1)%3]=F,f[(b+2)%3]=I,o[s+6]=f[0],o[s+7]=f[1],o[s+8]=f[2],o[s+9]=t()}return o}function et(e,o,t){let r=e.createShader(o);if(!r)throw new Error("No se pudo crear el shader de WebGL");if(e.shaderSource(r,t),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(r)||"Error al compilar el shader");return r}function ot(e,o){if(!e)return;let t=e.getContext("webgl",{alpha:!1,antialias:!1,powerPreference:"high-performance"});if(!t)return;let r=window.matchMedia("(max-width: 767px)").matches,i=window.matchMedia("(prefers-reduced-motion: reduce)").matches,c=r?2600:5200,s=r?1.5:2,l;try{if(l=t.createProgram(),!l||(t.attachShader(l,et(t,t.VERTEX_SHADER,ht)),t.attachShader(l,et(t,t.FRAGMENT_SHADER,vt)),t.linkProgram(l),!t.getProgramParameter(l,t.LINK_STATUS)))return}catch{return}t.useProgram(l);let y=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,y),t.bufferData(t.ARRAY_BUFFER,gt(c),t.STATIC_DRAW);let A=40;[["pa",3,0],["pb",3,12],["pc",3,24],["sem",1,36]].forEach(([n,m,d])=>{let P=t.getAttribLocation(l,n);t.enableVertexAttribArray(P),t.vertexAttribPointer(P,m,t.FLOAT,!1,A,d)});let a=n=>t.getUniformLocation(l,n),h=a("uT"),S=a("uM"),b=a("uAsp"),q=a("uRotY"),x=a("uRotX"),v=a("uPix"),F=a("uEsc"),I=a("uOff"),f=a("uAlfa");t.enable(t.BLEND),t.blendFunc(t.ONE,t.ONE),t.clearColor(.027,.035,.039,1);let g=0,u=0,L=1,H=(n=!1)=>{let m=window.innerWidth,d=window.innerHeight;!n&&m===g&&Math.abs(d-u)<160||(g=m,u=d,L=Math.min(window.devicePixelRatio||1,s),e.width=Math.round(g*L),e.height=Math.round(u*L),t.viewport(0,0,e.width,e.height))};H(!0);let V=0,W=0,O=0,Y=0,E=0,z=1,$=0,_=0,G=0,K=0,j=0,J=performance.now(),X=J,M=0,R=(n,m)=>{let d=window.scrollY,P=Math.max(1,document.documentElement.scrollHeight-u),tt=Math.min(1,Math.max(0,d/P)),D=Math.min(1,d/u),N=g/u<1,p=i?1:1-Math.exp(-m*4);O+=(V-O)*p,Y+=(W-Y)*p,E+=(tt*2-E)*p,j+=(Math.min(Math.abs(d-K)*.01,.6)-j)*p,K=d;let ft=1-.68*D;z+=(ft-z)*p;let mt=N?0:.34*(1-D),pt=N?.26*(1-D):0;$+=(mt-$)*p,_+=(pt-_)*p;let k=E<.5?0:E<1.5?1:2;k!==G&&(G=k,o?.(k)),t.clear(t.COLOR_BUFFER_BIT),t.uniform1f(h,n),t.uniform1f(S,E),t.uniform1f(b,g/u),t.uniform1f(q,n*.16+O*.55+tt*5),t.uniform1f(x,.22+Y*.3),t.uniform1f(v,L*Math.min(1.25,Math.max(.65,u/820))),t.uniform1f(F,(N?.78:1)*(1+j*.08)),t.uniform2f(I,$,_),t.uniform1f(f,z*.95),t.drawArrays(t.POINTS,0,c)},Q=n=>{let m=Math.min((n-X)/1e3,.1);X=n,R((n-J)/1e3,m),M=requestAnimationFrame(Q)},Z=()=>{i||M||(X=performance.now(),M=requestAnimationFrame(Q))},ct=()=>{cancelAnimationFrame(M),M=0},st=n=>{V=(n.clientX/g-.5)*2,W=(n.clientY/u-.5)*2},lt=()=>{H(),i&&R(0,1)},ut=()=>document.hidden?ct():Z(),dt=()=>{i&&R(0,1)};window.addEventListener("pointermove",st,{passive:!0}),window.addEventListener("resize",lt),window.addEventListener("scroll",dt,{passive:!0}),document.addEventListener("visibilitychange",ut),e.addEventListener("webglcontextlost",n=>n.preventDefault()),i?R(0,1):Z()}var wt=["esfera","nudo","ret\xEDcula"],rt=document.querySelectorAll(".rev");if("IntersectionObserver"in window){let e=new IntersectionObserver(o=>{o.forEach(t=>{t.isIntersecting&&(t.target.classList.add("vis"),e.unobserve(t.target))})},{threshold:.12,rootMargin:"0px 0px -6% 0px"});rt.forEach(o=>e.observe(o))}else rt.forEach(e=>e.classList.add("vis"));var at=document.querySelector(".cabecera"),w=document.querySelector("#menu-toggle"),T=document.querySelector("#menu-movil");function C(e){w.classList.toggle("abierta",e),w.setAttribute("aria-expanded",String(e)),w.setAttribute("aria-label",e?"Cerrar men\xFA":"Abrir men\xFA"),T.classList.toggle("visible",e),T.setAttribute("aria-hidden",String(!e)),T.querySelectorAll("a").forEach(o=>{o.tabIndex=e?0:-1}),at.classList.toggle("solida",e||window.scrollY>24),document.body.style.overflow=e?"hidden":""}w.addEventListener("click",()=>{C(w.getAttribute("aria-expanded")!=="true")});T.querySelectorAll("a").forEach(e=>{e.addEventListener("click",()=>C(!1))});document.querySelector(".logo").addEventListener("click",()=>C(!1));window.addEventListener("keydown",e=>{e.key==="Escape"&&C(!1)},{passive:!0});var it=()=>{at.classList.toggle("solida",w.getAttribute("aria-expanded")==="true"||window.scrollY>24)};window.addEventListener("scroll",it,{passive:!0});it();var yt=document.querySelectorAll(".menu a");if("IntersectionObserver"in window){let e=new IntersectionObserver(o=>{o.forEach(t=>{t.isIntersecting&&yt.forEach(r=>{r.classList.toggle("activo",r.hash===`#${t.target.id}`)})})},{rootMargin:"-45% 0px -50% 0px"});document.querySelectorAll("#inicio, #sobre, #habilidades, #proyectos, #servicios, #contacto").forEach(o=>e.observe(o))}document.querySelectorAll(".inclinar").forEach(e=>{let o=Number(e.dataset.inclinacion||(e.classList.contains("hueco")?9:e.classList.contains("servicio")?5:7));e.addEventListener("pointermove",t=>{if(t.pointerType!=="mouse")return;let r=e.getBoundingClientRect(),i=(t.clientX-r.left)/r.width,c=(t.clientY-r.top)/r.height;e.style.setProperty("--ry",`${(i-.5)*o*2}deg`),e.style.setProperty("--rx",`${(.5-c)*o*2}deg`),e.style.setProperty("--mx",`${i*100}%`),e.style.setProperty("--my",`${c*100}%`)}),e.addEventListener("pointerleave",()=>{e.style.setProperty("--ry","0deg"),e.style.setProperty("--rx","0deg")})});var U="seoul.gv@gmail.com",B=document.querySelector("#copiar-correo"),nt;B.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(U),B.textContent="Copiado \u2713",window.clearTimeout(nt),nt=window.setTimeout(()=>{B.textContent="Copiar"},2e3)}catch{window.location.href=`mailto:${U}`}});document.querySelector("#formulario-contacto").addEventListener("submit",e=>{e.preventDefault();let o=new FormData(e.currentTarget),t=String(o.get("nombre")||""),r=String(o.get("mensaje")||""),i=`Contacto desde tu portafolio \u2014 ${t}`,c=`${r}

\u2014 ${t}`;window.location.href=`mailto:${U}?subject=${encodeURIComponent(i)}&body=${encodeURIComponent(c)}`});document.querySelector("#anio").textContent=new Date().getFullYear();ot(document.querySelector(".lienzo"),e=>{document.querySelector("#forma-actual").textContent=`0${e+1} \xB7 ${wt[e]}`});
