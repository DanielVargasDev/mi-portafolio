import { iniciarEscena } from './escena.js'

const formas = ['esfera', 'nudo', 'retícula']
const elementosRevelables = document.querySelectorAll('.rev')

if ('IntersectionObserver' in window) {
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('vis')
          observador.unobserve(entrada.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )
  elementosRevelables.forEach((elemento) => observador.observe(elemento))
} else {
  elementosRevelables.forEach((elemento) => elemento.classList.add('vis'))
}

const cabecera = document.querySelector('.cabecera')
const botonMenu = document.querySelector('#menu-toggle')
const menuMovil = document.querySelector('#menu-movil')

function cambiarMenu(abierto) {
  botonMenu.classList.toggle('abierta', abierto)
  botonMenu.setAttribute('aria-expanded', String(abierto))
  botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú')
  menuMovil.classList.toggle('visible', abierto)
  menuMovil.setAttribute('aria-hidden', String(!abierto))
  menuMovil.querySelectorAll('a').forEach((enlace) => {
    enlace.tabIndex = abierto ? 0 : -1
  })
  cabecera.classList.toggle('solida', abierto || window.scrollY > 24)
  document.body.style.overflow = abierto ? 'hidden' : ''
}

botonMenu.addEventListener('click', () => {
  cambiarMenu(botonMenu.getAttribute('aria-expanded') !== 'true')
})

menuMovil.querySelectorAll('a').forEach((enlace) => {
  enlace.addEventListener('click', () => cambiarMenu(false))
})

document.querySelector('.logo').addEventListener('click', () => cambiarMenu(false))
window.addEventListener(
  'keydown',
  (evento) => {
    if (evento.key === 'Escape') cambiarMenu(false)
  },
  { passive: true },
)

const actualizarCabecera = () => {
  cabecera.classList.toggle(
    'solida',
    botonMenu.getAttribute('aria-expanded') === 'true' || window.scrollY > 24,
  )
}
window.addEventListener('scroll', actualizarCabecera, { passive: true })
actualizarCabecera()

const enlacesNavegacion = document.querySelectorAll('.menu a')
if ('IntersectionObserver' in window) {
  const observadorSecciones = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          enlacesNavegacion.forEach((enlace) => {
            enlace.classList.toggle('activo', enlace.hash === `#${entrada.target.id}`)
          })
        }
      })
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  document.querySelectorAll('#inicio, #sobre, #habilidades, #proyectos, #servicios, #contacto')
    .forEach((seccion) => observadorSecciones.observe(seccion))
}

document.querySelectorAll('.inclinar').forEach((elemento) => {
  const maximo = Number(elemento.dataset.inclinacion || (
    elemento.classList.contains('hueco') ? 9 :
    elemento.classList.contains('servicio') ? 5 : 7
  ))

  elemento.addEventListener('pointermove', (evento) => {
    if (evento.pointerType !== 'mouse') return
    const caja = elemento.getBoundingClientRect()
    const x = (evento.clientX - caja.left) / caja.width
    const y = (evento.clientY - caja.top) / caja.height
    elemento.style.setProperty('--ry', `${(x - 0.5) * maximo * 2}deg`)
    elemento.style.setProperty('--rx', `${(0.5 - y) * maximo * 2}deg`)
    elemento.style.setProperty('--mx', `${x * 100}%`)
    elemento.style.setProperty('--my', `${y * 100}%`)
  })

  elemento.addEventListener('pointerleave', () => {
    elemento.style.setProperty('--ry', '0deg')
    elemento.style.setProperty('--rx', '0deg')
  })
})

const correo = 'seoul.gv@gmail.com'
const botonCopiar = document.querySelector('#copiar-correo')
let temporizadorCopiado

botonCopiar.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(correo)
    botonCopiar.textContent = 'Copiado ✓'
    window.clearTimeout(temporizadorCopiado)
    temporizadorCopiado = window.setTimeout(() => {
      botonCopiar.textContent = 'Copiar'
    }, 2000)
  } catch {
    window.location.href = `mailto:${correo}`
  }
})

document.querySelector('#formulario-contacto').addEventListener('submit', (evento) => {
  evento.preventDefault()
  const datos = new FormData(evento.currentTarget)
  const nombre = String(datos.get('nombre') || '')
  const mensaje = String(datos.get('mensaje') || '')
  const asunto = `Contacto desde tu portafolio — ${nombre}`
  const cuerpo = `${mensaje}\n\n— ${nombre}`
  window.location.href =
    `mailto:${correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
})

document.querySelector('#anio').textContent = new Date().getFullYear()

iniciarEscena(document.querySelector('.lienzo'), (fase) => {
  document.querySelector('#forma-actual').textContent = `0${fase + 1} · ${formas[fase]}`
})
