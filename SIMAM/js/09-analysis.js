function anaOld(){const g=G[cell(R.x,R.y)],Kw=V.kw*g.k,t=V.tau,Ts=.01,Kz=(V.umax-V.umin)/V.zd,K=Kz*Kw,a=Math.exp(-Ts/t),b1=Ts-t*(1-a),b0=t*(1-a)-Ts*a,D=Math.PI/180,mag=w=>K/(w*Math.sqrt(1+t*t*w*w)),ph=w=>-90-Math.atan(t*w)/D-w*Ts/2/D,wc=Math.sqrt((-1+Math.sqrt(1+4*t*t*K*K))/(2*t*t)),PM=180+ph(wc);let w180=null,GM=null;for(let l=-1;l<=3.5;l+=.002){const w=10**l;if(ph(w)<=-180){w180=w;GM=-20*Math.log10(mag(w));break}}
const ws=[];for(let l=-1;l<=3;l+=.025)ws.push(10**l);const B1=ws.map(w=>[Math.log10(w),20*Math.log10(mag(w))]),B2=ws.map(w=>[Math.log10(w),ph(w)]),xt=[-1,0,1,2,3].map(v=>[v,'10^'+v]),lo1=Math.floor(Math.min(...B1.map(p=>p[1]))/40)*40,hi1=Math.ceil(Math.max(...B1.map(p=>p[1]))/20)*20,lo2=Math.floor(Math.min(...B2.map(p=>p[1]))/90)*90;
const vl=(X,Y,v,c)=>`<path d='M${X(v)} 12V300' stroke=${c} stroke-dasharray='3 3' />`;
const bd1=pl('b1',460,170,[-1,3],[lo1,hi1],[[B1,MCOL.CRUCERO]],xt,[lo1,lo1/2,0,hi1].map(v=>[v,v]),(X,Y)=>`<path d='M${X(-1)} ${Y(0)}H${X(3)}' stroke=currentColor stroke-dasharray='4 3' />`+vl(X,Y,Math.log10(wc),MCOL['CORRECCIÓN']),'ω (rad/s, log)','|L| (dB)'),bd2=pl('b2',460,170,[-1,3],[lo2,-60],[[B2,MCOL['DESACELERACIÓN']]],xt,[-90,-180,-270,-360,-450].filter(v=>v>=lo2).map(v=>[v,v]),(X,Y)=>`<path d='M${X(-1)} ${Y(-180)}H${X(3)}' stroke=currentColor stroke-dasharray='4 3' />`+vl(X,Y,Math.log10(wc),MCOL['CORRECCIÓN']),'ω (rad/s, log)','fase (°)');
const nq=[];for(let l=-.5;l<=3;l+=.02){const w=10**l,m=mag(w),p=ph(w)*D;nq.push([m*Math.cos(p),m*Math.sin(p)])}const nq2=nq.map(q=>[q[0],-q[1]]);const ny=pl('nq',330,300,[-1.6,1.2],[-2.5,2.5],[[nq,MCOL.CRUCERO],[nq2,MCOL.AVANCE]],[-1.5,-1,-.5,0,.5,1].map(v=>[v,v]),[-2,-1,0,1,2].map(v=>[v,v]),(X,Y)=>`<path d='M${X(-1)-6} ${Y(0)}h12M${X(-1)} ${Y(0)-6}v12' stroke='${MCOL['CORRECCIÓN']}' stroke-width=2 />`,'Re','Im');
const kc=(1-a)/b0,pa=[],pb=[],rt=k=>{const p=k*b1-(1+a),q=a+k*b0,d=p*p-4*q;return d>=0?[[(-p+Math.sqrt(d))/2,0],[(-p-Math.sqrt(d))/2,0]]:[[-p/2,Math.sqrt(-d)/2],[-p/2,-Math.sqrt(-d)/2]]};for(let i=0;i<=200;i++){const r=rt(kc*1.25*(i/200)**2);pa.push(r[0]);pb.push(r[1])}const r0=rt(K);
const lg=pl('lg',330,300,[-1.3,1.3],[-1.3,1.3],[[pa,MCOL.CRUCERO],[pb,MCOL.AVANCE]],[-1,-.5,0,.5,1].map(v=>[v,v]),[-1,-.5,0,.5,1].map(v=>[v,v]),(X,Y)=>`<ellipse cx=${X(0)} cy=${Y(0)} rx=${X(1)-X(0)} ry=${Y(0)-Y(1)} fill=none stroke=currentColor stroke-dasharray='5 3' />`+r0.map(q=>`<circle cx=${X(q[0])} cy=${Y(q[1])} r=4 fill='${MCOL['CORRECCIÓN']}' />`).join('')+[1,a].map(v=>`<path d='M${X(v)-4} ${Y(0)-4}l8 8M${X(v)-4} ${Y(0)+4}l8 -8' stroke=currentColor />`).join(''),'Re(z)','Im(z)');
return `<p><b>Postulado.</b> El giro se modela como G(s) = Θ(s)/ΔU(s) con ganancia de suelo; el simulador recalcula G(z), los márgenes y los lugares gráficos con cada deslizador. Suelo bajo el robot: <b>${g.n}</b>.</p>${EQ(`${FR(I('Ω')+'(s)',I('ΔU')+'(s)')} = ${FR(`${kw}·${I('g','suelo')}`,`${tv}s + 1`)},&nbsp;&nbsp; ${I('G')}(s) = ${FR(I('Θ')+'(s)',I('ΔU')+'(s)')} = ${FR(`${kw}·${I('g','suelo')}`,`s(${tv}s + 1)`)}`)}${EQ(`${I('G')}(z) = ${FR(`${kw}${I('g','suelo')}[(${I('T','s')} − ${tv}(1 − ${I('e')}<sup>−${I('T','s')}/${tv}</sup>))z + (${tv}(1 − ${I('e')}<sup>−${I('T','s')}/${tv}</sup>) − ${I('T','s')}${I('e')}<sup>−${I('T','s')}/${tv}</sup>)]`,`(z − 1)(z − ${I('e')}<sup>−${I('T','s')}/${tv}</sup>)`)}`)}${EQ(`${I('G')}(z) = ${FR(`${Kw.toFixed(2)}[${b1.toExponential(2)}z + ${b0.toExponential(2)}]`,`(z − 1)(z − ${a.toFixed(4)})`)}`)}${TB(['Magnitud','Valor'],[['Ganancia de lazo K = K_zona·K_ω·g',K.toFixed(3)+' 1/s'],['Frecuencia de cruce ω_c',wc.toFixed(2)+' rad/s'],['Margen de fase PM (incluye retardo ZOH T_s/2)',PM.toFixed(1)+'°'],['Frecuencia de fase −180°',w180?w180.toFixed(0)+' rad/s':'no cruza'],['Margen de ganancia GM',GM!=null?GM.toFixed(1)+' dB':'infinito'],['K crítica (polos sobre |z| = 1)',kc.toFixed(0)+' (K_zona crítica ≈ '+(kc/Kw).toFixed(0)+' %/°)'],['Polos de lazo cerrado en z',r0.map(q=>q[1]?q[0].toFixed(3)+(q[1]>0?'+':'−')+'j'+Math.abs(q[1]).toFixed(3):q[0].toFixed(3)).join(', ')]].map(r=>r.map(ss2)))}<h3>Bode</h3>${bd1}${bd2}<p class=note><b>Figura D5.</b> Diagrama de Bode de L(jω) = K e<sup>−jωT_s/2</sup>/[jω(jτ_vω + 1)]. La línea roja marca ω_c; la discontinua en 0 dB y −180° sirve para leer PM y GM.</p><div class=row><div>${ny}<p class=note><b>Figura D6.</b> Nyquist (−∞ < ω < ∞), punto crítico (−1, j0) en rojo.</p></div><div>${lg}<p class=note><b>Figura D7.</b> LGR en el plano z al variar K; círculo unitario discontinuo, × = polos de lazo abierto, ● = operación actual.</p></div></div><p><b>Interpretación.</b> (1) Con PM > 45° el lazo es robusto; el tiempo muerto de ZOH y de la IMU es el que limita la ganancia. (2) El ancho de banda ω_c fija cuánto ruido de la IMU (σ_IMU) pasa al PWM: bajarla atenaúa ruido pero alarga la respuesta. (3) La banda muerta u_d y el suelo u_f son no linealidades; Nyquist solo describe el lazo lineal y la fricción seca puede causar ciclos límite que el supervisor corrige con β. (4) Aumentar K_zona acerca los polos al círculo unitario; la distancia a |z| = 1 es el margen de estabilidad discreto.</p><button data-ref=1>↻ Actualizar con los parámetros actuales</button>`}
const GLO=`Planta|θ|Rumbo (Yaw)|Orientación del robot, positiva en sentido horario (°).
Planta|ω = θ̇|Velocidad angular|Derivada del rumbo (°/s).
Planta|K_ω|Ganancia de giro|°/s por % de PWM en giro sobre el eje.
Planta|τ_v|Constante de tiempo del motor|Respuesta de primer orden de la rueda (s).
Planta|K_v|Ganancia de avance|0.006 m/s por % de PWM.
Planta|g_suelo|Ganancia del suelo|Factor del material que escala K_ω y la velocidad.
Planta|u_d|Banda muerta|PWM mínimo que vence la fricción: d_suelo + 0.4·α + 100·μ·m (%).
Planta|A|Asimetría de motores|Diferencia relativa entre motor izquierdo y derecho (%).
Planta|α|Pendiente|Inclinación del plano (°).
Planta|ψ|Dirección cuesta abajo|Ángulo de la línea de máxima pendiente (°).
Planta|σ_IMU|Ruido del IMU|Desviación del ruido del MPU6050 (°).
Planta|deriva|Deriva del IMU|Sesgo acumulado del giroscopio (°/min).
Planta|μ, m|Fricción y masa del bloque|Coeficiente de fricción y masa (kg) de un bloque empujado.
Planta|b|Separación entre ruedas|Distancia entre ruedas (m).
Control|e_θ|Error angular|θ_ref − θ_m, normalizado a ±180°.
Control|θ_ref, θ_goal|Rumbo objetivo|Referencia de la maniobra (°).
Control|Z_d|Zona de desaceleración|Error angular donde empieza a bajar el PWM (°).
Control|Z|Zona efectiva|El menor entre Z_d y el giro total solicitado (°).
Control|u_max|PWM de crucero|PWM de la instrucción (%).
Control|u_f|Suelo de PWM|Mínimo en desaceleración: u_min + β (%).
Control|β|Boost anti-estancamiento|Sube u_f de 2 en 2 hasta 6 % tras 600 ms sin progreso.
Control|K_zona|Ganancia de zona|(u_max − u_f)/Z, en %/°.
Control|ε|Tolerancia|Error aceptable para declarar convergencia (°).
Control|u_c, e_ref|Corrección inversa|PWM y error de referencia de la corrección tras sobrepaso.
Control|stable_ms|Estabilidad mínima|Tiempo dentro de ε para terminar (ms).
Control|K_p, c, c_max|Trayectoria lineal|Ganancia proporcional, corrección diferencial y su límite.
Control|T_s|Periodo de muestreo|10 ms (100 Hz).
Control|τ_cola|Constante de cola|1/(K_zona·K_ω) (s).
Control|e_pm|Punto muerto|Z·u_f/(u_max − u_f) (°).
Modos|CRUCERO|Modo del supervisor|PWM máximo mientras el error es mayor o igual que Z.
Modos|DESACELERACIÓN|Modo del supervisor|PWM afin decreciente dentro de la zona Z.
Modos|CONVERGENCIA|Modo del supervisor|Error dentro de ε; motores detenidos durante stable_ms.
Modos|CORRECCIÓN|Modo del supervisor|Giro inverso breve tras un cambio de signo del error.
Modos|ERROR|Modo del supervisor|Timeout, colisión o falta de convergencia.
Modos|AVANCE, REVERSA|Marcha lineal|Trayectoria recta con corrección diferencial de rumbo.
Modos|ESPERA|Pausa programada|Instrucción WAIT en curso.
Instrucciones|TURN_YAW θ [pwm]|Giro absoluto|Gira hasta el rumbo θ (°).
Instrucciones|TURN_YAW_D Δθ [pwm]|Giro relativo|Gira Δθ grados desde el rumbo actual.
Instrucciones|FWD ms [pwm]|Avance|Avanza durante ms milisegundos manteniendo el rumbo.
Instrucciones|BACK ms [pwm]|Reversa|Retrocede durante ms milisegundos.
Instrucciones|WAIT ms|Espera|Detiene los motores ms milisegundos.
Instrucciones|STOP|Fin|Termina el programa.
Instrucciones|REPEAT n … END|Bucle|Repite el bloque n veces.
Análisis|G(s)|Función de transferencia|Θ(s)/ΔU(s) = K_ω·g_suelo/[s(τ_v s + 1)].
Análisis|G(z)|Equivalente discreto ZOH|Discretización con retenedor de orden cero a T_s.
Análisis|PM, GM|Márgenes de fase y ganancia|Distancia a la inestabilidad en Bode (° y dB).
Análisis|ω_c|Frecuencia de cruce|Frecuencia donde la magnitud de L(jω) vale 0 dB (rad/s).
Análisis|LGR|Lugar geométrico de las raíces|Trayectoria de los polos al variar la ganancia.
Análisis|Bode|Respuesta en frecuencia|Magnitud (dB) y fase (°) contra ω en escala logarítmica.
Análisis|Nyquist|Plano complejo|Curva de L(jω) respecto al punto crítico (−1, j0).
Análisis|ZOH|Retenedor de orden cero|Mantiene constante la señal entre muestras.
Control|ζ|Amortiguamiento|ζ = 1/(2√(τ_v·K_zona·K_ω)); si es menor que 1 el lazo lineal oscila.
Control|ω_n|Frecuencia natural|√(K_zona·K_ω/τ_v), en rad/s.
Control|t_desac|Tiempo de desaceleración|Tiempo de Z a ε: estimación exponencial τ_cola·ln(Z/ε) o expresión exacta τ_cola·ln[u_max/(u_f + K_zona·ε)].
Control|ley afín|Ley de control con suelo|u = u_f + K_zona·e dentro de la zona Z; su integral da el tiempo exacto.
Control|K_ω·u_f·τ_v|Recorrido por inercia|Ángulo adicional que gira el robot tras llegar a ε; si supera ε aparece sobrepaso.
Control|s_0|Signo inicial|Signo del error al iniciar el giro; su cambio dispara la CORRECCIÓN.
Control|wrap|Normalización angular|Lleva un ángulo al intervalo de −180° a 180°.
Control|Euler|Discretización de Euler|e[k+1] = (1 − K_zona·K_ω·T_s)·e[k]; estable si el factor queda dentro del círculo unitario.
Control|K_zona·K_ω·T_s|Factor de estabilidad discreta|Debe ser menor que 2 para converger y menor que 1 para hacerlo sin cambiar de signo.
Análisis|L(s)|Función de lazo abierto|K_zona·K_ω/[s(τ_v s + 1)].
Análisis|K_lazo|Ganancia de lazo|K = K_zona·K_ω·g_suelo, en 1/s.
Análisis|M_s|Pico de sensibilidad|Inverso de la distancia mínima de L(jω) al punto (−1, j0); menor es más robusto.
Análisis|ω_180|Frecuencia de fase −180°|Frecuencia donde la fase de L(jω) vale −180° (rad/s).
Análisis|K crítica|Ganancia crítica|Valor de K con polos de lazo cerrado sobre el círculo unitario, límite de estabilidad.
Análisis|polos y ceros|Polos y ceros|Raíces del denominador y del numerador de G(s) o de G(z).
Análisis|círculo unitario|Límite de estabilidad discreta|Un sistema discreto es estable si todos sus polos están dentro de él.
Análisis|punto de ruptura|Ruptura del LGR|Valor de K donde dos polos reales se unen y pasan a ser complejos.
Análisis|ζ constante|Curvas de amortiguamiento|Curvas del plano z con ζ fijo, que permiten estimar la oscilación.
Análisis|círculo 1/M_s|Círculo de sensibilidad|Círculo centrado en (−1, 0) y tangente a la curva de Nyquist.
Análisis|asíntotas|Asintotas de Bode y Nyquist|Rectas de −20 y −40 dB/dec en Bode y Re = −K·τ_v en Nyquist.
Monte Carlo|Monte Carlo|Análisis de Monte Carlo|Método estadístico que repite muchas simulaciones del mismo escenario variando al azar los parámetros inciertos (K_ω, τ_v, asimetría y ruido) para estimar la distribución de los resultados.
Monte Carlo|N|Repeticiones por superficie|Número de simulaciones por tipo de suelo; la incertidumbre de la media decrece como 1/√N.
Monte Carlo|simulación|Ejecución de simulación|Una ejecución completa de un programa o maniobra con valores fijos de los parámetros.
Monte Carlo|éxito|Tasa de éxito|Porcentaje de simulaciones que terminan sin colisión ni ERROR.
Monte Carlo|e_ss|Error de rumbo final|Diferencia entre el rumbo final y el objetivo al terminar la maniobra (°).
Monte Carlo|sobrepaso|Sobrepaso|Máximo ángulo que se rebasa el objetivo durante un giro (°).
Monte Carlo|desviación lateral|Desviación lateral|Distancia perpendicular a la trayectoria nominal al terminar un tramo lineal (cm).
Monte Carlo|variación aleatoria|Incertidumbre simulada|K_ω ±15 %, τ_v ±25 % y asimetría ±4 % en cada simulación.
Monte Carlo|σ|Desviación estándar|Medida de la dispersión de los resultados entre simulaciones.
Monte Carlo|n|Número de lados|Lados del polígono regular inscrito; también es el número de giros del trazado.
Monte Carlo|D|Diámetro de la circunferencia circunscrita|Constante del análisis de polígonos (200 mm).
Monte Carlo|s|Lado del polígono|s = D·sen(π/n), en mm; se recorre con una orden FWD.
Monte Carlo|α|Ángulo de giro exterior|α = 360°/n; es el giro que se ejecuta en cada vértice.
Monte Carlo|P|Perímetro|P = n·s; crece hacia πD al aumentar n.
Monte Carlo|error de cierre|Distancia de cierre|Distancia entre el punto final y el punto de partida al terminar el trazado (mm).
Monte Carlo|error de forma|Desviación RMS de vértices|Raíz de la media de los cuadrados de la distancia entre cada vértice real y el ideal (mm).
Monte Carlo|n*|Número óptimo de lados|Valor de n que minimiza el error de cierre en el análisis de polígonos; su giro α* = 360°/n* es el ángulo óptimo.
Análisis|factor de desvío|Razón ruta / línea recta|Cociente entre la longitud de la ruta sobre la retícula y la distancia en línea recta; vale 4/π ≈ 1.27 en cuadrícula y ≈ 1.10 en retícula triangular.
Análisis|retícula triangular|Retícula de seis direcciones|Teselado de triángulos equiláteros con pasillos a 0°, 60° y 120°; los giros posibles son de 60° o 120°.
Análisis|área barrida|Área de maniobra|Superficie que barre la huella de un vehículo al girar sobre su centro un ángulo dado.`;
