#!/usr/bin/env python3
"""
Banda sonora del video de postulación de TodoEventos.

Todo está sintetizado acá: no hay ni una pista de librería. La idea es que
la música siga el arco del video —tensión mientras se muestra el problema,
resolución cuando aparece el producto— y que cada cosa que pasa en pantalla
tenga su sonido.

    La minor, 80 bpm   →  0 s a 74 s   (el problema)
    Do mayor, 96 bpm   → 74 s a 118 s  (la solución y el cierre)

El paso de La menor a Do mayor es el relativo mayor: la misma familia de
notas, pero el centro se mueve y suena como si algo se destrabara. Es el
momento exacto en que el video deja de mostrar el caos y muestra el panel.

Salida: banda.wav (estéreo, 48 kHz, 16 bits).
"""

import math
import struct
import wave

import numpy as np
from scipy import signal

SR = 48_000
DUR = 118.0
N = int(DUR * SR)

# ── Rejilla temporal ──────────────────────────────────────────────────────
BPM_A, BPM_B = 80.0, 96.0
BEAT_A = 60.0 / BPM_A          # 0.75 s
BAR_A = 4 * BEAT_A             # 3.0 s
T_GIRO = 74.0                  # donde entra la solución
BEAT_B = 60.0 / BPM_B          # 0.625 s
BAR_B = 4 * BEAT_B             # 2.5 s

izq = np.zeros(N, dtype=np.float64)
der = np.zeros(N, dtype=np.float64)


# ── Utilidades ────────────────────────────────────────────────────────────
def nota(n):
    """Frecuencia de una nota MIDI."""
    return 440.0 * 2 ** ((n - 69) / 12.0)


def mezclar(sig, t, gan=1.0, pan=0.0):
    """Suma `sig` en el segundo `t`. pan: -1 izquierda, +1 derecha."""
    i = int(t * SR)
    if i >= N or gan == 0:
        return
    s = sig[: max(0, N - i)]
    if not len(s):
        return
    gi = gan * math.sqrt(0.5 * (1.0 - pan))
    gd = gan * math.sqrt(0.5 * (1.0 + pan))
    izq[i : i + len(s)] += s * gi
    der[i : i + len(s)] += s * gd


def env(n, a, d, s, r, pico=1.0, sos=None):
    """Envolvente ADSR de `n` muestras."""
    a, d, r = max(int(a * SR), 1), max(int(d * SR), 1), max(int(r * SR), 1)
    sos = n - a - d - r if sos is None else int(sos * SR)
    sos = max(sos, 0)
    e = np.concatenate([
        np.linspace(0, pico, a),
        np.linspace(pico, s * pico, d),
        np.full(sos, s * pico),
        np.linspace(s * pico, 0, r),
    ])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def fase(f, n, detune=0.0):
    """Fase acumulada para una frecuencia (opcionalmente desafinada en cents)."""
    f = f * 2 ** (detune / 1200.0)
    return 2 * np.pi * f * np.arange(n) / SR


def sierra(f, n, armonicos=18, detune=0.0):
    """Diente de sierra por suma de armónicos: no produce aliasing."""
    out = np.zeros(n)
    ff = f * 2 ** (detune / 1200.0)
    for k in range(1, armonicos + 1):
        if ff * k >= SR / 2:
            break
        out += np.sin(2 * np.pi * ff * k * np.arange(n) / SR) / k
    return out * (2 / np.pi)


def triangulo(f, n, armonicos=9, detune=0.0):
    out = np.zeros(n)
    ff = f * 2 ** (detune / 1200.0)
    for j in range(armonicos):
        k = 2 * j + 1
        if ff * k >= SR / 2:
            break
        out += ((-1) ** j) * np.sin(2 * np.pi * ff * k * np.arange(n) / SR) / (k * k)
    return out * (8 / np.pi**2)


def _un_polo(x, corte, zi=None):
    """Pasabajos de un polo con corte fijo, vía lfilter (velocidad de C)."""
    a = math.exp(-2 * math.pi * min(max(corte, 20.0), SR / 2 - 100) / SR)
    b, aa = [1 - a], [1.0, -a]
    if zi is None:
        return signal.lfilter(b, aa, x)
    return signal.lfilter(b, aa, x, zi=zi)


def pasabajos(x, corte, bloques=96):
    """Un polo. `corte` puede ser un número o una curva (barrido).

    Para el barrido se trocea la señal y cada trozo se filtra con corte fijo,
    arrastrando el estado del filtro: suena igual que variarlo muestra a
    muestra y evita un bucle de Python sobre millones de muestras.
    """
    if np.isscalar(corte):
        return _un_polo(x, float(corte))

    n = len(x)
    corte = np.asarray(corte, dtype=np.float64)
    bordes = np.linspace(0, n, min(bloques, max(n // 64, 1)) + 1).astype(int)
    y = np.empty_like(x)
    zi = np.zeros(1)
    for i in range(len(bordes) - 1):
        a, b = bordes[i], bordes[i + 1]
        if b <= a:
            continue
        c = float(corte[(a + b) // 2])
        y[a:b], zi = _un_polo(x[a:b], c, zi)
    return y


def pasaaltos(x, corte):
    return x - pasabajos(x, corte)


def ruido(n, semilla=None):
    r = np.random.default_rng(semilla)
    return r.standard_normal(n)


def reverb(x, cuartos=0.84, mezcla=0.30):
    """Reverb de Schroeder: seis peines en paralelo y dos allpass en serie.

    Cada peine es y[i] = x[i-d] + g·y[i-d] y cada allpass el de Schroeder;
    los dos se expresan como filtros IIR, así que los resuelve lfilter.
    """
    combs = [int(d * SR / 44100) for d in (1557, 1617, 1491, 1422, 1277, 1356)]
    acum = np.zeros(len(x))
    for d in combs:
        b = np.zeros(d + 1); b[d] = 1.0
        a = np.zeros(d + 1); a[0] = 1.0; a[d] = -cuartos
        acum += signal.lfilter(b, a, x)
    acum /= len(combs)

    for d in (int(225 * SR / 44100), int(556 * SR / 44100)):
        g = 0.5
        b = np.zeros(d + 1); b[0] = -g; b[d] = 1.0
        a = np.zeros(d + 1); a[0] = 1.0; a[d] = -g
        acum = signal.lfilter(b, a, acum)

    return x * (1 - mezcla) + acum * mezcla


# ══════════════════════════════════════════════════════════════════════════
#  INSTRUMENTOS
# ══════════════════════════════════════════════════════════════════════════
def pad(midis, dur, gan=1.0, brillo=900.0, ataque=0.9, detune=7.0, lado=0.0):
    """Colchón de cuerdas: tres sierras desafinadas por nota, filtradas.

    `lado` desplaza la desafinación para poder generar dos versiones algo
    distintas y abrirlas a izquierda y derecha: eso es lo que le da ancho
    a la mezcla en vez de dejarla pegada al centro.
    """
    n = int(dur * SR)
    out = np.zeros(n)
    for m in midis:
        f = nota(m)
        for d in (-detune + lado, lado * 0.4, detune + lado):
            out += sierra(f, n, 14, d)
    out /= max(len(midis) * 3, 1)
    out = pasabajos(out, brillo)
    return out * env(n, ataque, 0.5, 0.78, min(1.4, dur * 0.4)) * gan


def mezclar_pad(midis, t, dur, gan, brillo, ataque=0.5, apertura=0.62):
    """Coloca un pad abierto en estéreo (dos versiones distintas, una por lado).

    El canal derecho además sale unos milisegundos más tarde (efecto Haas):
    el oído lo lee como amplitud, no como eco, y el colchón se ensancha.
    """
    mezclar(pad(midis, dur, gan, brillo, ataque, 7.0, lado=-3.0), t, 1.0, -apertura)
    mezclar(pad(midis, dur, gan, brillo, ataque, 7.0, lado=+3.0), t + 0.011, 1.0, +apertura)


def pluck(midi, dur, gan=1.0, brillo=2600.0, cuerpo=0.5):
    """Nota pinzada: triangular + algo de sierra, decaimiento rápido."""
    n = int(dur * SR)
    f = nota(midi)
    x = triangulo(f, n) * (1 - cuerpo) + sierra(f, n, 12) * cuerpo
    x = pasabajos(x, brillo)
    e = env(n, 0.004, dur * 0.55, 0.10, dur * 0.4)
    return x * e * gan


def bajo(midi, dur, gan=1.0):
    n = int(dur * SR)
    f = nota(midi)
    x = np.sin(fase(f, n)) + 0.35 * np.sin(fase(f, n, -1200)) + 0.16 * sierra(f, n, 6)
    x = pasabajos(x, 320)
    return x * env(n, 0.012, 0.16, 0.72, dur * 0.35) * gan


def campana(midi, dur=2.4, gan=1.0):
    """Campanita de cierre: parciales inarmónicos, cola larga."""
    n = int(dur * SR)
    f = nota(midi)
    out = np.zeros(n)
    for k, a in ((1.0, 1.0), (2.01, 0.52), (3.02, 0.28), (4.17, 0.16), (5.43, 0.09)):
        out += a * np.sin(fase(f * k, n)) * np.exp(-np.arange(n) / SR * (1.6 + k * 0.55))
    return out / 2.0 * env(n, 0.002, 0.05, 0.85, dur * 0.9) * gan


def bombo(gan=1.0, dur=0.42, desde=132.0, hasta=44.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hasta + (desde - hasta) * np.exp(-t * 26)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 7.5)
    x += ruido(n, 7) * np.exp(-t * 180) * 0.28          # golpe del parche
    return x * gan


def charles(gan=1.0, dur=0.075, abierto=False):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = pasaaltos(ruido(n, None), 7200)
    return x * np.exp(-t * (14 if abierto else 52)) * gan


def tom(midi=41, gan=1.0, dur=0.55):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = nota(midi)
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.45 * np.exp(-t * 18))) / SR
    return (np.sin(ph) + 0.2 * ruido(n, 3) * np.exp(-t * 60)) * np.exp(-t * 5.5) * gan


def tic(gan=1.0):
    """El segundero: es el latido del bloque del problema."""
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    x = pasaaltos(ruido(n, None), 3800) * np.exp(-t * 150)
    x += np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 260) * 0.35
    return x * gan


# ── Efectos de interfaz ───────────────────────────────────────────────────
def pop(gan=1.0, alto=True):
    """Mensaje que entra."""
    dur = 0.13
    n = int(dur * SR)
    t = np.arange(n) / SR
    f0, f1 = (760, 1420) if alto else (420, 700)
    f = f0 + (f1 - f0) * (1 - np.exp(-t * 55))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 34)
    x += np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * np.exp(-t * 60) * 0.22
    return x * gan


def golpe_sordo(gan=1.0):
    """El 'visto' sin respuesta: un pop que se apaga, sin brillo."""
    dur = 0.30
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 13)
    x += np.sin(2 * np.pi * 90 * t) * np.exp(-t * 9) * 0.6
    return pasabajos(x, 700) * gan


def swoosh(gan=1.0, dur=0.55, subir=True):
    """Aire para los empujes de cámara y los cambios de toma."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    p = t / dur
    corte = (600 + 5200 * p) if subir else (5800 - 5200 * p)
    x = pasabajos(pasaaltos(ruido(n, None), 400), corte)
    forma = np.sin(np.pi * p) ** 1.5
    return x * forma * gan


def impacto(gan=1.0, dur=1.6):
    """El sello CRUCE y el arranque de la solución."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 150 * np.exp(-t * 11) + 38
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.6)
    x += pasabajos(ruido(n, 11), 1400) * np.exp(-t * 16) * 0.5
    return x * gan


def riser(dur=3.2, gan=1.0, midi=69):
    """Tensión que sube hacia el giro del video."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    p = t / dur
    # La frecuencia sube, así que el tono se arma acumulando fase armónico
    # por armónico (sierra() sirve solo para frecuencias fijas).
    f = nota(midi) * (1 + 0.55 * p**2)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tono = sum(np.sin(ph * k) / k for k in range(1, 9))
    aire = pasabajos(pasaaltos(ruido(n, 5), 300), 400 + 7000 * p**2)
    return (tono * 0.32 + aire) * (p**2) * gan


def blip(gan=1.0, midi=84):
    """Mensaje de Raymi: más limpio y amable que el pop del chat del problema."""
    dur = 0.22
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = nota(midi)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 19)
    x += np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t * 26) * 0.4
    return x * gan


def pluma(gan=1.0):
    """Trazo de lapicero sobre la libreta."""
    dur = 0.20
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = pasabajos(pasaaltos(ruido(n, None), 1800), 6000)
    return x * (np.sin(np.pi * t / dur) ** 2) * gan


# ══════════════════════════════════════════════════════════════════════════
#  ARREGLO
# ══════════════════════════════════════════════════════════════════════════
A2, A3, F2, F3, D3, E2, E3 = 45, 57, 41, 53, 50, 40, 52

# La menor: i – VI – iv – V. La cadencia clásica de "esto no está bien".
CICLO = [
    (A3, [57, 60, 64]),   # Am
    (F3, [53, 57, 60]),   # F
    (D3, [50, 53, 57]),   # Dm
    (E3, [52, 56, 59]),   # E   (mayor: es el que tensa)
]


def bloque_problema():
    """0 s → 74 s. Arranca casi vacío y va sumando peso."""
    # Colchón grave constante: el suelo de todo el bloque.
    mezclar_pad([45, 57], 0.0, 74.0, 0.055, 430, ataque=3.0, apertura=0.5)

    bar = 0
    t = 0.0
    while t < T_GIRO - 0.01:
        raiz, acorde = CICLO[bar % 4]
        dur = min(BAR_A, T_GIRO - t)

        # Intensidad por tramo: apertura tenue, cliente medio, proveedor pesado.
        if t < 6.0:
            g_pad, g_bajo = 0.30, 0.34
        elif t < 40.0:
            g_pad, g_bajo = 0.30, 0.42
        elif t < 67.0:
            g_pad, g_bajo = 0.38, 0.62
        else:
            g_pad, g_bajo = 0.34, 0.40

        mezclar_pad(acorde, t, dur + 0.7, g_pad * 0.62, 1150, ataque=0.55)
        mezclar(bajo(raiz, dur * 0.94, gan=g_bajo * 0.8), t, 1.0, 0.0)

        # El reloj: corcheas secas. Entra con el bloque del cliente.
        if 6.0 <= t < 71.0:
            for k in range(8):
                tk = t + k * BEAT_A / 2
                if tk >= T_GIRO:
                    break
                fuerte = k % 2 == 0
                mezclar(tic(0.24 if fuerte else 0.13), tk, 1.0, 0.34 if k % 4 else -0.28)

        # Arpegio de la tríada, en semicorcheas sueltas: la inquietud.
        if 12.0 <= t < 67.0:
            patron = [0, 2, 1, 2, 0, 1, 2, 1]
            for k, idx in enumerate(patron):
                tk = t + k * BEAT_A / 2
                if tk >= T_GIRO:
                    break
                m = acorde[idx % len(acorde)] + 12
                mezclar(pluck(m, 0.55, gan=0.23, brillo=3400), tk, 1.0, -0.52 + 1.04 * (k % 3) / 2)

        # Bloque del proveedor: entra el tom. Pesa más, avanza más.
        if 40.0 <= t < 67.0:
            for k in (0, 2, 3):
                tk = t + k * BEAT_A
                if tk >= 67.0:
                    break
                mezclar(tom(38 if k else 33, gan=0.30 if k == 0 else 0.19), tk, 1.0, -0.2)

        t += BAR_A
        bar += 1

    # Brecha: se va todo menos la tensión, y sube el riser al giro.
    mezclar(riser(3.4, gan=0.20, midi=69), T_GIRO - 3.4, 1.0, 0.0)
    mezclar_pad([57, 64], 67.4, 6.5, 0.17, 900, ataque=1.2, apertura=0.55)


# Do mayor: I – V – vi – IV. El giro.
CICLO_B = [
    (48, [60, 64, 67]),   # C
    (43, [59, 62, 67]),   # G/B
    (45, [57, 60, 64]),   # Am
    (41, [53, 57, 60]),   # F
]


def bloque_solucion():
    """74 s → 118 s. Luminoso, con pulso, y se abre al final."""
    t = T_GIRO
    bar = 0
    fin_ritmo = 108.0          # el ritmo para antes del cierre

    while t < DUR - 0.01:
        raiz, acorde = CICLO_B[bar % 4]
        dur = min(BAR_B, DUR - t)

        # El último acorde del video se sostiene y se apaga solo.
        if t >= 110.0:
            mezclar_pad([48, 55, 60, 64, 67], 110.0, 8.5, 0.21, 4200, ataque=0.5, apertura=0.7)
            mezclar(bajo(48, 7.5, gan=0.26), 110.0, 1.0, 0.0)
            mezclar(campana(84, 4.5, 0.46), 110.15, 1.0, 0.25)
            mezclar(campana(79, 5.0, 0.36), 110.5, 1.0, -0.25)
            mezclar(campana(91, 3.6, 0.26), 110.9, 1.0, 0.45)
            mezclar(campana(96, 3.0, 0.16), 111.4, 1.0, -0.4)
            # Un último charles suelto para que el cierre respire arriba.
            for k in range(6):
                mezclar(charles(0.15 * (1 - k / 7), abierto=(k > 3)), 110.0 + k * 0.625, 1.0, 0.3)
            break

        mezclar_pad(acorde, t, dur + 0.6, 0.19, 3800, ataque=0.30, apertura=0.66)
        mezclar(bajo(raiz, dur * 0.92, gan=0.33), t, 1.0, 0.0)

        if t < fin_ritmo:
            # Bombo en negras y charles en corcheas: da avance sin estorbar.
            for k in range(4):
                mezclar(bombo(0.44), t + k * BEAT_B, 1.0, 0.0)
            for k in range(8):
                mezclar(charles(0.22 if k % 2 else 0.34, abierto=(k == 7)),
                        t + k * BEAT_B / 2, 1.0, 0.34 if k % 2 else -0.22)

        # Arpegio brillante de ocho notas: es la melodía del bloque.
        patron = [0, 1, 2, 1, 2, 0, 1, 2]
        for k, idx in enumerate(patron):
            m = acorde[idx % len(acorde)] + 12
            if k in (3, 6):
                m += 12
            mezclar(pluck(m, 0.52, gan=0.30, brillo=6800, cuerpo=0.35),
                    t + k * BEAT_B / 2, 1.0, -0.55 + 1.10 * (k % 4) / 3)

        t += BAR_B
        bar += 1


# ══════════════════════════════════════════════════════════════════════════
#  EFECTOS, CLAVADOS A LO QUE PASA EN PANTALLA
#  (los tiempos salen del guion de escena.html)
# ══════════════════════════════════════════════════════════════════════════
def efectos():
    C, P, BR, S, CI = 6.0, 40.0, 67.0, 74.0, 110.0

    # ── Apertura: dos golpes secos bajo los títulos
    mezclar(impacto(0.40, 1.2), 0.20, 1.0, 0.0)
    mezclar(impacto(0.32, 1.0), 3.10, 1.0, 0.0)

    # ── Cliente: cada burbuja del chat suena
    for tb in (3.0, 4.1):
        mezclar(pop(0.34), C + tb, 1.0, 0.30)
    mezclar(golpe_sordo(0.40), C + 6.2, 1.0, 0.30)          # "Visto hace 2 días"

    for tb, mio in ((12.4, True), (13.6, False), (16.2, True)):
        mezclar(pop(0.32, alto=mio), C + tb, 1.0, 0.30)
    mezclar(tic(0.22), C + 15.2, 1.0, 0.0)                  # "3 días después"
    mezclar(golpe_sordo(0.38), C + 17.6, 1.0, 0.30)         # "Visto"

    for tb in (22.0, 23.2):
        mezclar(pop(0.32), C + tb, 1.0, 0.30)
    mezclar(pop(0.30, alto=False), C + 24.6, 1.0, 0.30)     # el precio que cambia

    for tz in (7.0, 18.0, 25.0):                            # los tres empujes
        mezclar(swoosh(0.20, 0.60), C + tz - 0.18, 1.0, 0.0)

    for i in range(6):                                      # rejilla de chats muertos
        mezclar(tic(0.13), C + 28.7 + i * 0.12, 1.0, -0.25 + 0.1 * i)
    for i, tk in enumerate((29.3, 29.7, 30.1)):             # los tres números
        mezclar(pluck(64 + i * 3, 0.5, gan=0.13, brillo=2400), C + tk, 1.0, 0.0)
    mezclar(impacto(0.26, 1.3), C + 32.4, 1.0, 0.0)         # remate del bloque

    # ── Proveedor: la avalancha de mensajes sin responder
    for i in range(8):
        mezclar(pop(0.26 + 0.02 * i, alto=False), P + 2.4 + i * 0.26, 1.0, -0.3 + 0.08 * i)
    mezclar(swoosh(0.20, 0.60), P + 4.8, 1.0, 0.0)

    for i in range(9):                                      # la libreta, a mano
        mezclar(pluma(0.19), P + 10.7 + i * 0.28, 1.0, 0.2)
    mezclar(swoosh(0.20, 0.60), P + 13.4, 1.0, 0.0)
    mezclar(impacto(0.52, 1.8), P + 15.2, 1.0, 0.0)         # sello CRUCE
    mezclar(tom(33, 0.34, 0.7), P + 15.2, 1.0, 0.0)

    for i in range(3):                                      # las tres tarjetas
        mezclar(swoosh(0.11, 0.42), P + 18.4 + i * 0.28, 1.0, -0.3 + 0.3 * i)
    mezclar(impacto(0.28, 1.4), P + 23.6, 1.0, 0.0)

    # ── Brecha: la pantalla se parte en dos
    mezclar(swoosh(0.26, 1.5, subir=False), BR + 0.30, 1.0, -0.5)
    mezclar(swoosh(0.26, 1.5, subir=False), BR + 0.30, 1.0, 0.5)
    mezclar(impacto(0.30, 1.6), BR + 2.40, 1.0, 0.0)

    # ── Solución: el golpe del giro y una campana por cada toma
    mezclar(impacto(0.46, 2.2), S + 0.20, 1.0, 0.0)
    mezclar(campana(88, 2.6, 0.18), S + 0.25, 1.0, 0.2)
    for tt in (3.4, 8.2, 15.8, 21.2, 25.6, 30.0):
        mezclar(swoosh(0.13, 0.50), S + tt - 0.16, 1.0, 0.0)

    # Raymi: los mensajes del asistente, con un timbre propio
    for dt, m in ((0.15, 81), (1.10, 76), (2.05, 88), (2.85, 81), (3.50, 84), (5.45, 81)):
        mezclar(blip(0.17, m), S + 8.2 + dt, 1.0, 0.28)

    # ── Cierre
    mezclar(impacto(0.34, 2.0), CI + 0.25, 1.0, 0.0)


def limitar(l, r, umbral=0.62, ataque=0.004, caida=0.22):
    """Limitador estéreo con un solo control de ganancia para los dos canales.

    Sigue el pico de la mezcla, y donde se pasa del umbral baja la ganancia.
    Al usar la misma curva en ambos canales, la imagen estéreo no se mueve.
    """
    pico = np.maximum(np.abs(l), np.abs(r))

    # Seguidor: sube rápido (ataque) y baja despacio (caída).
    a_at = math.exp(-1.0 / (ataque * SR))
    a_ca = math.exp(-1.0 / (caida * SR))
    env = signal.lfilter([1 - a_ca], [1.0, -a_ca], pico)
    env = np.maximum(env, signal.lfilter([1 - a_at], [1.0, -a_at], pico))

    g = np.minimum(1.0, umbral / np.maximum(env, 1e-6))
    # Se suaviza la ganancia para que no se note el bombeo.
    a_s = math.exp(-1.0 / (0.012 * SR))
    g = signal.lfilter([1 - a_s], [1.0, -a_s], g)
    return l * g, r * g


def ecualizar(x):
    """Tono final, pensado para parlantes chicos (laptop y celular).

    Tres cosas: se corta lo que está por debajo de 42 Hz (sólo retumba y come
    volumen), se baja un poco la zona de 200–320 Hz donde se amontonan el bajo
    y los pads, y se levanta de 2.5 kHz para arriba, que es donde viven los
    plucks y los efectos. Sin esto el 96 % de la energía se iba a los graves.
    """
    # Corte de subgraves
    sos = signal.butter(2, 42, 'highpass', fs=SR, output='sos')
    x = signal.sosfilt(sos, x)

    # Hueco suave en los medios-graves (barro)
    b, a = signal.iirpeak(250, Q=1.4, fs=SR)
    x = x - 0.28 * (signal.lfilter(b, a, x))

    # Realce de brillo: lo que pasa de 2.5 kHz se suma a la mezcla
    sos = signal.butter(2, 2200, 'highpass', fs=SR, output='sos')
    x = x + 0.95 * signal.sosfilt(sos, x)
    sos = signal.butter(2, 6500, 'highpass', fs=SR, output='sos')
    x = x + 0.70 * signal.sosfilt(sos, x)

    return x


# ══════════════════════════════════════════════════════════════════════════
def main():
    print('Sintetizando el bloque del problema…')
    bloque_problema()
    print('Sintetizando el bloque de la solución…')
    bloque_solucion()
    print('Colocando los efectos…')
    efectos()

    print('Reverb y mezcla final…')
    global izq, der
    izq, der = ecualizar(izq), ecualizar(der)
    # Reverb corta: da sala sin embarrar. Se aplica a la mezcla completa.
    izq = reverb(izq, cuartos=0.80, mezcla=0.22)
    der = reverb(der, cuartos=0.82, mezcla=0.22)

    # Fundido de entrada y de salida.
    fi = int(0.35 * SR)
    fo = int(3.2 * SR)
    for c in (izq, der):
        c[:fi] *= np.linspace(0, 1, fi)
        c[-fo:] *= np.linspace(1, 0, fo)

    # Limitador: sin esto los golpes se llevan todo el margen y la música
    # queda muy por debajo del nivel al que se escucha un video.
    izq, der = limitar(izq, der, umbral=0.45, ataque=0.030, caida=0.45)
    izq, der = limitar(izq, der, umbral=0.34, ataque=0.003, caida=0.16)

    pico = max(np.abs(izq).max(), np.abs(der).max())
    izq *= 0.92 / pico
    der *= 0.92 / pico
    izq = np.tanh(izq * 1.32) / np.tanh(1.32) * 0.95
    der = np.tanh(der * 1.32) / np.tanh(1.32) * 0.95

    print('Escribiendo banda.wav…')
    inter = np.empty(N * 2, dtype=np.float64)
    inter[0::2] = izq
    inter[1::2] = der
    pcm = np.clip(inter * 32767, -32768, 32767).astype('<i2')
    with wave.open('banda.wav', 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'Listo: {DUR:.0f} s, pico {max(abs(inter.min()), abs(inter.max())):.3f}')


if __name__ == '__main__':
    main()
