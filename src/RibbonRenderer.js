// Recovered from the original Azeperevod deployment supplied by the owner.
// Palette attribution: public/assets/ribbon-credits.txt
const G = `
uint spin(uint x) { return (x << 17u) | (x >> 15u); }
float lattice(vec2 cell) {
  uvec2 bits = floatBitsToUint(cell);
  uint state = spin(0x165667b9u + bits.x * 0xc2b2ae3du) * 0x27d4eb2fu;
  state = spin(state + bits.y * 0xc2b2ae3du) * 0x27d4eb2fu;
  state = (state ^ (state >> 15u)) * 0x85ebca77u;
  state = (state ^ (state >> 13u)) * 0xc2b2ae3du;
  state ^= state >> 16u;
  return uintBitsToFloat(0x3f800000u | (state >> 9u)) - 1.0;
}
float simplex(vec2 p) {
  vec2 cell = floor(p + (p.x + p.y) * 0.366025404);
  vec2 delta = p - cell + (cell.x + cell.y) * 0.211324865;
  vec2 middle = delta.x >= delta.y ? vec2(1,0) : vec2(0,1);
  float sum = 0.0;
  for(int k=0;k<3;k++) {
    vec2 corner = k == 0 ? vec2(0) : (k == 1 ? middle : vec2(1));
    vec2 d = delta - corner + float(k) * 0.211324865;
    float weight = max(0.0, 0.5 - dot(d,d));
    float angle = lattice(cell + corner) * 6.283185307;
    sum += weight*weight*weight * dot(d, vec2(cos(angle),sin(angle)));
  }
  return sum * 32.99;
}
`, z = `
precision highp float;
precision highp int;
in vec3 position;
in vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float elapsed;
out vec2 surface;
${G}
vec3 turn(vec3 p, vec3 axis, float radians) {
  axis=normalize(axis);
  return p*cos(radians) + cross(axis,p)*sin(radians) + axis*dot(axis,p)*(1.0-cos(radians));
}
float taper(float coordinate, float exponent) {
  return exp2(-exp2(exponent) * pow(coordinate, exponent));
}
void main() {
  surface=uv;
  vec3 p=position;
  float phase=(elapsed+35000.0)*0.00004;
  p.y -= 7.821 * simplex(vec2(p.x*.005831,p.z*.016001)+phase);
  p=turn(p,vec3(1,0,1), .41*taper(uv.x,.7));
  p=turn(p,vec3(0,1,1), -.65*taper(uv.y,3.63));
  p=turn(p,vec3(1,0,1), -.58*taper(uv.y,3.95));
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1);
}
`, j = `
precision highp float;
precision highp int;
in vec2 surface;
uniform sampler2D palette;
uniform float pixelHeight;
out vec4 outputColor;
${G}
void main() {
  vec3 base=texture(palette,surface).rgb;
  float glow=clamp(.5 + .99*dFdy(surface.y)*pixelHeight,0.0,1.0);
  glow=smoothstep(0.0,.834,pow(glow,.806));
  float warp=simplex(surface*vec2(.1,.5));
  float thread=.5+.5*simplex(vec2(surface.x*600.0*(1.0+.5*warp),surface.y*4.0*warp));
  float edge=1.0-pow(4.0*surface.x*(1.0-surface.x),3.0);
  base+=vec3(thread*.2*(1.0-.9*base.b)*glow*edge);
  // Tiny rotation around the neutral color axis preserves the pastel palette.
  vec3 axis=normalize(vec3(1));
  float angle=-.001592653589793;
  base=base*cos(angle)+cross(axis,base)*sin(angle)+axis*dot(axis,base)*(1.0-cos(angle));
  base+=vec3((1.0-glow)*.25);
  outputColor=vec4(clamp(base,0.0,1.0),1.0);
}
`, K = `
precision highp float;
in vec3 position;
in vec2 uv;
out vec2 coord;
void main(){coord=uv;gl_Position=vec4(position.xy,0,1);}
`, q = `
precision highp float;
in vec2 coord;
uniform sampler2D sceneImage;
out vec4 outputColor;
void main(){
  vec2 p=coord-.5;
  vec4 softened=vec4(0);
  for(int i=0;i<8;i++){
    float angle=-.02*float(i)/8.0;
    vec2 q=vec2(p.x*cos(angle)-p.y*sin(angle),p.x*sin(angle)+p.y*cos(angle));
    softened+=texture(sceneImage,q+.5)/8.0;
  }
  float sharpness=smoothstep(0.0,.7,coord.y)-smoothstep(.2,1.0,coord.y);
  vec4 color=mix(softened,texture(sceneImage,coord),sharpness);
  float grain=fract(sin(dot(gl_FragCoord.xy*.01,vec2(12.9898,78.233)))*43758.5453);
  color.rgb+=(1.0-2.0*grain)*1.1*4.0/255.0;
  outputColor=vec4(clamp(color.rgb,0.0,1.0),color.a);
}
`, $ = (R, p) => {
  const i = new Float32Array(16);
  for (let e = 0; e < 4; e++) for (let m = 0; m < 4; m++) {
    let n = 0;
    for (let t = 0; t < 4; t++) n += R[t * 4 + m] * p[e * 4 + t];
    i[e * 4 + m] = n;
  }
  return i;
};
function Q(R, p) {
  const i = -0.449592653589793, e = -0.117592653589793, m = 1.87440734641021, n = Math.cos(i), t = Math.sin(i), s = Math.cos(e), u = Math.sin(e), c = Math.cos(m), a = Math.sin(m), b = [s * c * 9, (n * a + t * c * u) * 9, (t * a - n * c * u) * 9, 0, -s * a * 8, (n * c - t * a * u) * 8, (t * c + n * a * u) * 8, 0, u * 5, -t * s * 5, n * s * 5, 0, 380, -301.7, -11.1, 1], E = Math.hypot(100, 5e3), d = 100 / E, h = 5e3 / E, T = [h, 0, d, 0, 0, 1, 0, 0, -d, 0, h, 0, 0, 0, -E, 1], o = new Float32Array([2 / R, 0, 0, 0, 0, 2 / p, 0, 0, 0, 0, -2 / 9999, 0, 0, 0, -10001 / 9999, 1]);
  return { modelView: $(T, b), projection: o };
}
async function J(R, p) {
  const n = new Float32Array(165765), t = new Uint16Array(128 * 256 * 6);
  let s = 0, u = 0;
  for (let c = 0; c <= 256; c++) {
    p == null || p.throwIfAborted();
    const a = 1 - c / 256, b = 4 - 2 * Math.pow(4 * a * (1 - a), 9.5);
    for (let E = 0; E <= 128; E++) {
      let d = 400 * E / 128 - 200, h;
      if (d < -16) h = b;
      else if (d >= 16) d = -d, h = -b;
      else {
        const T = (d + 16) * Math.PI / 32;
        h = Math.cos(T) * b, d = Math.sin(T) * b - 16;
      }
      if (n[s++] = 200 - 400 * c / 256, n[s++] = h, n[s++] = d + 100, n[s++] = E / 128, n[s++] = a, c < 256 && E < 128) {
        const T = c * 129 + E, o = T + 129;
        t[u++] = T, t[u++] = o, t[u++] = T + 1, t[u++] = o, t[u++] = o + 1, t[u++] = T + 1;
      }
    }
    c % 8 === 7 && await R();
  }
  return { vertices: n, indices: t };
}
const X = () => {
  var R;
  return (R = globalThis.scheduler) != null && R.yield ? globalThis.scheduler.yield() : new Promise((p) => setTimeout(p, 0));
};
async function Z(R, p, { signal: i } = {}) {
  const e = R.getContext("webgl2", { alpha: true, antialias: false, powerPreference: "low-power" });
  if (!e) throw new Error("WebGL2 unavailable");
  const m = [];
  let n = false, t = 0, s = 0, u = 0, c;
  const a = (o) => {
    const l = e["create" + o]();
    if (!l) throw new Error("Cannot allocate " + o);
    return m.push([o, l]), l;
  }, b = () => {
    if (!n) {
      n = true;
      for (const [o, l] of m.reverse()) e["delete" + o](l);
    }
  }, E = () => {
    if (i == null || i.throwIfAborted(), n || e.isContextLost()) throw new Error("WebGL context unavailable");
  }, d = (o, l) => {
    const r = e.createShader(o);
    if (!r) throw new Error("Cannot allocate shader");
    return m.push(["Shader", r]), e.shaderSource(r, `#version 300 es
` + l), e.compileShader(r), r;
  }, h = async (o, l) => {
    E();
    const r = a("Program");
    e.attachShader(r, d(e.VERTEX_SHADER, o)), e.attachShader(r, d(e.FRAGMENT_SHADER, l)), e.linkProgram(r);
    const x = e.getExtension("KHR_parallel_shader_compile");
    if (x) for (; !e.getProgramParameter(r, x.COMPLETION_STATUS_KHR); ) E(), await new Promise((_) => setTimeout(_, 16));
    else await X();
    if (E(), !e.getProgramParameter(r, e.LINK_STATUS)) throw new Error(e.getProgramInfoLog(r) || "Shader link failed");
    return r;
  }, T = () => new Promise((o, l) => {
    const r = new Image(), x = () => {
      r.onload = null, r.onerror = null, i == null || i.removeEventListener("abort", _);
    }, _ = () => {
      x(), l(new DOMException("Aborted", "AbortError"));
    };
    r.onload = () => {
      x(), o(r);
    }, r.onerror = () => {
      x(), l(new Error("Ribbon palette unavailable"));
    }, i == null || i.addEventListener("abort", _, { once: true }), r.src = "/assets/ribbon-palette.webp";
  });
  try {
    E();
    const o = await J(X, i), l = await h(z, j), r = await h(K, q), x = await T();
    E();
    const _ = a("VertexArray");
    e.bindVertexArray(_);
    const H = a("Buffer");
    e.bindBuffer(e.ARRAY_BUFFER, H), e.bufferData(e.ARRAY_BUFFER, o.vertices, e.STATIC_DRAW);
    const V = a("Buffer");
    e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, V), e.bufferData(e.ELEMENT_ARRAY_BUFFER, o.indices, e.STATIC_DRAW);
    const D = (f) => {
      for (const [M, F, A] of [["position", 3, 0], ["uv", 2, 12]]) {
        const O = e.getAttribLocation(f, M);
        e.enableVertexAttribArray(O), e.vertexAttribPointer(O, F, e.FLOAT, false, 20, A);
      }
    };
    D(l);
    const L = a("VertexArray");
    e.bindVertexArray(L);
    const k = a("Buffer");
    e.bindBuffer(e.ARRAY_BUFFER, k), e.bufferData(e.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 0, 0, 1, -1, 0, 1, 0, -1, 1, 0, 0, 1, 1, 1, 0, 1, 1]), e.STATIC_DRAW), D(r);
    const I = a("Texture");
    e.bindTexture(e.TEXTURE_2D, I), e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, true), e.texImage2D(e.TEXTURE_2D, 0, e.SRGB8_ALPHA8, e.RGBA, e.UNSIGNED_BYTE, x), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.MIRRORED_REPEAT), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.MIRRORED_REPEAT), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR_MIPMAP_LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.generateMipmap(e.TEXTURE_2D), e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, false);
    const g = a("Texture");
    e.bindTexture(e.TEXTURE_2D, g), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE);
    const y = a("Renderbuffer"), P = a("Framebuffer"), W = Array.from(e.getInternalformatParameter(e.RENDERBUFFER, e.RGBA8, e.SAMPLES)), Y = Array.from(e.getInternalformatParameter(e.RENDERBUFFER, e.DEPTH_COMPONENT24, e.SAMPLES)), B = Math.max(0, ...W.filter((f) => f <= 4 && Y.includes(f))), w = B > 1 ? a("Framebuffer") : null, S = w ? a("Renderbuffer") : null, v = (f) => e.getUniformLocation(l, f), U = { model: v("modelViewMatrix"), projection: v("projectionMatrix"), time: v("elapsed"), height: v("pixelHeight") };
    e.useProgram(l), e.uniform1i(v("palette"), 0), e.useProgram(r), e.uniform1i(e.getUniformLocation(r, "sceneImage"), 0), e.disable(e.CULL_FACE), e.disable(e.BLEND), e.depthFunc(e.LEQUAL), e.clearColor(1, 1, 1, 0);
    const N = (f) => {
      n || !t || e.isContextLost() || (u = f, e.viewport(0, 0, t, s), e.activeTexture(e.TEXTURE0), e.bindFramebuffer(e.FRAMEBUFFER, w || P), e.enable(e.DEPTH_TEST), e.depthMask(true), e.clear(e.COLOR_BUFFER_BIT | e.DEPTH_BUFFER_BIT), e.useProgram(l), e.bindVertexArray(_), e.bindTexture(e.TEXTURE_2D, I), e.uniform1f(U.time, f), e.uniform1f(U.height, s), e.uniformMatrix4fv(U.model, false, c.modelView), e.uniformMatrix4fv(U.projection, false, c.projection), e.drawElements(e.TRIANGLES, o.indices.length, e.UNSIGNED_SHORT, 0), w && (e.bindFramebuffer(e.READ_FRAMEBUFFER, w), e.bindFramebuffer(e.DRAW_FRAMEBUFFER, P), e.blitFramebuffer(0, 0, t, s, 0, 0, t, s, e.COLOR_BUFFER_BIT, e.NEAREST)), e.bindFramebuffer(e.FRAMEBUFFER, null), e.disable(e.DEPTH_TEST), e.clear(e.COLOR_BUFFER_BIT), e.useProgram(r), e.bindVertexArray(L), e.bindTexture(e.TEXTURE_2D, g), e.drawArrays(e.TRIANGLE_STRIP, 0, 4));
    }, C = () => {
      if (n || e.isContextLost()) return;
      const f = R.getBoundingClientRect();
      if (!f.width || !f.height) return;
      const M = Math.min(window.devicePixelRatio || 1, 1.25, 1440 / f.width), F = Math.round(f.width * M), A = Math.round(f.height * M);
      if (c = Q(975 * f.width / f.height, 975), F !== t || A !== s) {
        if (t = R.width = F, s = R.height = A, e.bindTexture(e.TEXTURE_2D, g), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA8, F, A, 0, e.RGBA, e.UNSIGNED_BYTE, null), e.bindFramebuffer(e.FRAMEBUFFER, P), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, g, 0), w) {
          if (e.checkFramebufferStatus(e.FRAMEBUFFER) !== e.FRAMEBUFFER_COMPLETE) throw new Error("Incomplete resolve framebuffer");
          e.bindFramebuffer(e.FRAMEBUFFER, w), e.bindRenderbuffer(e.RENDERBUFFER, S), e.renderbufferStorageMultisample(e.RENDERBUFFER, B, e.RGBA8, F, A), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.RENDERBUFFER, S);
        }
        if (e.bindRenderbuffer(e.RENDERBUFFER, y), w ? e.renderbufferStorageMultisample(e.RENDERBUFFER, B, e.DEPTH_COMPONENT24, F, A) : e.renderbufferStorage(e.RENDERBUFFER, e.DEPTH_COMPONENT24, F, A), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.RENDERBUFFER, y), e.checkFramebufferStatus(e.FRAMEBUFFER) !== e.FRAMEBUFFER_COMPLETE) throw new Error("Incomplete ribbon framebuffer");
      }
      N(u);
    };
    return C(), p(), { draw: N, resize: C, dispose: b };
  } catch (o) {
    throw b(), o;
  }
}
export {
  Z as createRibbonRenderer
};
