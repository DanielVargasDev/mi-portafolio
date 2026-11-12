const vert = `
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
`

const frag = `
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
`

function crearDatos(n) {
  const datos = new Float32Array(n * 10)
  const aleatorio = Math.random
  const gauss = () => (aleatorio() + aleatorio() + aleatorio() - 1.5) / 1.5
  const dorada = Math.PI * (1 + Math.sqrt(5))

  for (let i = 0; i < n; i++) {
    const offset = i * 10
    const k = i + 0.5
    const phi = Math.acos(1 - (2 * k) / n)
    const theta = dorada * k
    const radio = 1.5 * (0.97 + aleatorio() * 0.06)
    datos[offset] = radio * Math.cos(theta) * Math.sin(phi)
    datos[offset + 1] = radio * Math.cos(phi)
    datos[offset + 2] = radio * Math.sin(theta) * Math.sin(phi)

    const t = aleatorio() * Math.PI * 2
    const rr = Math.cos(3 * t) + 2
    datos[offset + 3] = 0.52 * rr * Math.cos(2 * t) + gauss() * 0.09
    datos[offset + 4] = 0.52 * rr * Math.sin(2 * t) + gauss() * 0.09
    datos[offset + 5] = -0.7 * Math.sin(3 * t) + gauss() * 0.09

    const eje = Math.floor(aleatorio() * 3)
    const signo = aleatorio() > 0.5 ? 1 : -1
    const lado = 1.25
    const paso = 0.31
    const a = Math.round(((aleatorio() * 2 - 1) * lado) / paso) * paso
    const b = Math.round(((aleatorio() * 2 - 1) * lado) / paso) * paso
    const punto = [0, 0, 0]
    punto[eje] = signo * lado
    punto[(eje + 1) % 3] = a
    punto[(eje + 2) % 3] = b
    datos[offset + 6] = punto[0]
    datos[offset + 7] = punto[1]
    datos[offset + 8] = punto[2]
    datos[offset + 9] = aleatorio()
  }
  return datos
}

function compilar(gl, tipo, codigo) {
  const shader = gl.createShader(tipo)
  if (!shader) throw new Error('No se pudo crear el shader de WebGL')
  gl.shaderSource(shader, codigo)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || 'Error al compilar el shader')
  }
  return shader
}

export function iniciarEscena(canvas, alCambiarFase) {
  if (!canvas) return

  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    powerPreference: 'high-performance',
  })
  if (!gl) return

  const movil = window.matchMedia('(max-width: 767px)').matches
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cantidad = movil ? 2600 : 5200
  const dprMax = movil ? 1.5 : 2

  let programa
  try {
    programa = gl.createProgram()
    if (!programa) return
    gl.attachShader(programa, compilar(gl, gl.VERTEX_SHADER, vert))
    gl.attachShader(programa, compilar(gl, gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(programa)
    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return
  } catch {
    return
  }
  gl.useProgram(programa)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, crearDatos(cantidad), gl.STATIC_DRAW)
  const stride = 40
  ;[
    ['pa', 3, 0],
    ['pb', 3, 12],
    ['pc', 3, 24],
    ['sem', 1, 36],
  ].forEach(([nombre, tamano, offset]) => {
    const ubicacion = gl.getAttribLocation(programa, nombre)
    gl.enableVertexAttribArray(ubicacion)
    gl.vertexAttribPointer(ubicacion, tamano, gl.FLOAT, false, stride, offset)
  })

  const uniform = (nombre) => gl.getUniformLocation(programa, nombre)
  const uT = uniform('uT')
  const uM = uniform('uM')
  const uAsp = uniform('uAsp')
  const uRotY = uniform('uRotY')
  const uRotX = uniform('uRotX')
  const uPix = uniform('uPix')
  const uEsc = uniform('uEsc')
  const uOff = uniform('uOff')
  const uAlfa = uniform('uAlfa')

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE)
  gl.clearColor(0.027, 0.035, 0.039, 1)

  let ancho = 0
  let alto = 0
  let dpr = 1
  const ajustar = (forzar = false) => {
    const nuevoAncho = window.innerWidth
    const nuevoAlto = window.innerHeight
    if (!forzar && nuevoAncho === ancho && Math.abs(nuevoAlto - alto) < 160) return
    ancho = nuevoAncho
    alto = nuevoAlto
    dpr = Math.min(window.devicePixelRatio || 1, dprMax)
    canvas.width = Math.round(ancho * dpr)
    canvas.height = Math.round(alto * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  ajustar(true)

  let punX = 0
  let punY = 0
  let sx = 0
  let sy = 0
  let morph = 0
  let alfa = 1
  let offX = 0
  let offY = 0
  let fase = 0
  let scrollPrev = 0
  let empuje = 0
  const inicio = performance.now()
  let ultimo = inicio
  let raf = 0

  const dibujar = (tiempo, dt) => {
    const y = window.scrollY
    const max = Math.max(1, document.documentElement.scrollHeight - alto)
    const progreso = Math.min(1, Math.max(0, y / max))
    const heroT = Math.min(1, y / alto)
    const vertical = ancho / alto < 1
    const suavizado = sinMovimiento ? 1 : 1 - Math.exp(-dt * 4)

    sx += (punX - sx) * suavizado
    sy += (punY - sy) * suavizado
    morph += (progreso * 2 - morph) * suavizado
    empuje += (Math.min(Math.abs(y - scrollPrev) * 0.01, 0.6) - empuje) * suavizado
    scrollPrev = y

    const objetivoAlfa = 1 - 0.68 * heroT
    alfa += (objetivoAlfa - alfa) * suavizado
    const objetivoX = vertical ? 0 : 0.34 * (1 - heroT)
    const objetivoY = vertical ? 0.26 * (1 - heroT) : 0
    offX += (objetivoX - offX) * suavizado
    offY += (objetivoY - offY) * suavizado

    const nuevaFase = morph < 0.5 ? 0 : morph < 1.5 ? 1 : 2
    if (nuevaFase !== fase) {
      fase = nuevaFase
      alCambiarFase?.(nuevaFase)
    }

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform1f(uT, tiempo)
    gl.uniform1f(uM, morph)
    gl.uniform1f(uAsp, ancho / alto)
    gl.uniform1f(uRotY, tiempo * 0.16 + sx * 0.55 + progreso * 5)
    gl.uniform1f(uRotX, 0.22 + sy * 0.3)
    gl.uniform1f(uPix, dpr * Math.min(1.25, Math.max(0.65, alto / 820)))
    gl.uniform1f(uEsc, (vertical ? 0.78 : 1) * (1 + empuje * 0.08))
    gl.uniform2f(uOff, offX, offY)
    gl.uniform1f(uAlfa, alfa * 0.95)
    gl.drawArrays(gl.POINTS, 0, cantidad)
  }

  const bucle = (ahora) => {
    const dt = Math.min((ahora - ultimo) / 1000, 0.1)
    ultimo = ahora
    dibujar((ahora - inicio) / 1000, dt)
    raf = requestAnimationFrame(bucle)
  }
  const iniciar = () => {
    if (sinMovimiento || raf) return
    ultimo = performance.now()
    raf = requestAnimationFrame(bucle)
  }
  const parar = () => {
    cancelAnimationFrame(raf)
    raf = 0
  }

  const alPuntero = (evento) => {
    punX = (evento.clientX / ancho - 0.5) * 2
    punY = (evento.clientY / alto - 0.5) * 2
  }
  const alRedimensionar = () => {
    ajustar()
    if (sinMovimiento) dibujar(0, 1)
  }
  const alVisibilidad = () => (document.hidden ? parar() : iniciar())
  const alScroll = () => {
    if (sinMovimiento) dibujar(0, 1)
  }

  window.addEventListener('pointermove', alPuntero, { passive: true })
  window.addEventListener('resize', alRedimensionar)
  window.addEventListener('scroll', alScroll, { passive: true })
  document.addEventListener('visibilitychange', alVisibilidad)
  canvas.addEventListener('webglcontextlost', (evento) => evento.preventDefault())

  if (sinMovimiento) dibujar(0, 1)
  else iniciar()
}