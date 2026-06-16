'use strict';
/* Shared WebGL gradient background — included on every page */
(function initGradientBg() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const VS = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;

  const FS = `
    precision highp float;
    uniform float uT;
    uniform vec2  uRes;

    vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}
    vec2 mod289v2(vec2 x){return x-floor(x*(1./289.))*289.;}
    vec3 permute3(vec3 x){return mod289v3(((x*34.)+1.)*x);}

    float snoise(vec2 v){
      const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
      vec2 i=floor(v+dot(v,C.yy));
      vec2 x0=v-i+dot(i,C.xx);
      vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
      vec4 x12=x0.xyxy+C.xxzz;
      x12.xy-=i1;
      i=mod289v2(i);
      vec3 p=permute3(permute3(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
      vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
      m=m*m; m=m*m;
      vec3 x=2.*fract(p*C.www)-1.;
      vec3 h=abs(x)-.5;
      vec3 ox=floor(x+.5);
      vec3 a0=x-ox;
      m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
      vec3 g;
      g.x =a0.x *x0.x +h.x *x0.y;
      g.yz=a0.yz*x12.xz+h.yz*x12.yw;
      return 130.*dot(m,g);
    }

    void main(){
      vec2 uv=gl_FragCoord.xy/uRes;
      float ang=radians(50.);
      vec2 pv=uv-vec2(.5);
      pv=vec2(pv.x*cos(ang)-pv.y*sin(ang), pv.x*sin(ang)+pv.y*cos(ang));
      pv+=vec2(.5);
      pv.x+=0.22;
      float t=uT*0.4;
      vec2 p=pv*1.8;
      vec2 warp=vec2(
        snoise(p*0.6+vec2(t*.5,t*.2)),
        snoise(p*0.6+vec2(t*.2,t*.5)+vec2(5.2,1.3))
      );
      vec2 wp=p+warp*0.55;
      float n1=snoise(wp+vec2(t*.8,t*.4));
      float n2=snoise(pv*0.9+vec2(-t*.3,t*.5))*0.4;
      float n=clamp((n1*0.5+0.5)*0.75+n2*0.25, 0.,1.);
      n=pow(n,0.55);
      vec3 c1=vec3(.290,.102,.435);
      vec3 c2=vec3(.706,.706,.859);
      vec3 c3=vec3(.910,.757,.839);
      vec3 col=mix(c1,c2,smoothstep(.22,.62,n));
      col=mix(col,c3,smoothstep(.55,.92,n));
      col=pow(col*0.88,vec3(1.55));
      float gs=dot(gl_FragCoord.xy,vec2(127.1,311.7));
      float grain=fract(sin(gs+uT*31.7)*43758.5453);
      col+=(grain-.5)*.044;
      gl_FragColor=vec4(clamp(col,0.,1.),1.);
    }
  `;

  function mkShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[bg-canvas]', gl.getShaderInfoLog(s)); return null;
    }
    return s;
  }

  const vs = mkShader(gl.VERTEX_SHADER, VS);
  const fs = mkShader(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uT  = gl.getUniformLocation(prog, 'uT');
  const uRes = gl.getUniformLocation(prog, 'uRes');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let start = null, last = 0;
  const INTERVAL = 1000 / 24;
  function render(ts) {
    if (!start) start = ts;
    if (ts - last >= INTERVAL) {
      last = ts;
      gl.uniform1f(uT, (ts - start) * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
