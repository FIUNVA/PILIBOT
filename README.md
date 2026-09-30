# PILIBOT

**Desarrollado por:** Alejandro Aguirre Díaz<br>

---

> Agradecimientos especiales 
> al **Dr. Jorge A. Lizárraga A.** por su colaboración en el planteamiento conceptual del PILIBOT.

---

## Descripción
Actualmente este documento describe el planeamiento, desarrollo e incorporación de un sistema híbrido de control para giros y trayectorias lineales del PILIBOT. El sistema está implementado en un ESP32-C3 y utiliza la IMU MPU6050 para obtener realimentación de orientación.

La arquitectura combina:

- Sensado mediante MPU6050 y DMP.
- Control proporcional para orientación y trayectoria.
- Máquina de estados para supervisar las maniobras.
- Compensación de la zona muerta de los motores.
- Detección de sobrepaso y corrección inversa.
- Detección de estancamiento y temporizadores de seguridad.
- Parametrización y telemetría mediante BLE.

## 1. Implementaciones del firmware

Las modificaciones permiten que el robot no dependa únicamente de instrucciones temporales de PWM, sino que ajuste su comportamiento a partir de la orientación medida.

### 1.1 Control de trayectoria y orientación

Durante el avance y el retroceso se compara continuamente la orientación medida con una referencia. El error angular genera una corrección diferencial entre las ruedas para compensar diferencias entre motores, fricción y condiciones de desplazamiento.

La ley de control es predominantemente proporcional, con saturación y zona de tolerancia. Cuando el error es pequeño no se realizan correcciones, y cuando aumenta se limita la actuación máxima.

### 1.2 Zona muerta, sobrepaso y estancamiento

- Se utiliza un PWM mínimo para vencer la fricción estática de los micromotores.
- Un cambio de signo del error indica un posible sobrepaso y activa una corrección temporal en sentido inverso.
- Si el error no mejora durante un periodo determinado, se incrementa progresivamente el PWM mínimo para recuperar el movimiento.

### 1.3 Supervisión, BLE y telemetría

El movimiento se organiza mediante los estados `INICIO`, `CRUCERO`, `DESACELERACIÓN`, `CONVERGENCIA`, `CORRECCIÓN` y `ERROR`. Los parámetros de control se pueden modificar mediante comandos BLE, incluyendo PWM máximo, suelo de rotación, zona de desaceleración, tolerancia y ganancias.

El firmware registra Yaw, error, corrección, PWM, estados y eventos de maniobra para evaluar error estacionario, sobrepaso, tiempo de establecimiento, repetibilidad y activación del anti-estancamiento.

## 2. Justificación del sistema híbrido

El PILIBOT utiliza motores DC sin encoders, controlados directamente mediante PWM, y un MPU6050 para obtener orientación. En estas condiciones, un PID clásico no resulta la opción más adecuada para compensar zona muerta, diferencias entre motores, inercia y estancamiento.

El sistema híbrido combina un control proporcional con un supervisor basado en estados y eventos. Así puede activar acciones específicas ante desaceleración, sobrepaso, falta de movimiento o convergencia. En lugar de acumular continuamente el error con un término integral, puede aumentar temporalmente el PWM cuando detecta que el robot ha dejado de progresar.

Esta arquitectura requiere pocas variables de estado, errores y temporizadores, por lo que conserva recursos para BLE, telemetría, procesamiento del MPU6050 y ejecución de instrucciones.

## 3. Clasificación y estructura funcional

El sistema no es un PID clásico porque no aplica directamente términos integral y derivativo al error de seguimiento. La ley principal es proporcional, con saturación, compensación de zona muerta y ganancias dependientes de la región del error.

Tampoco es un observador de estados clásico de Luenberger. Las funciones `yawObserver`, `updateForwardTrajectory` y `forwardTrajectoryActive` detectan eventos sobre la señal de error:

- Cambio de signo.
- Posible sobrepaso.
- Entrada o permanencia en la zona de tolerancia.
- Ausencia de progreso hacia el objetivo.
- Salida de la zona de tolerancia.

No estiman estados internos no medidos mediante un modelo de planta y una señal de innovación. Por ello, es más preciso describirlas como un monitor o detector de eventos.

### 3.1 Estructura funcional

| Nivel | Función | Tipo | Implementación |
| --- | --- | --- | --- |
| Sensado | MPU6050 + DMP -> cuaternión -> Euler | Fusión inercial | `mostrar_valores()` |
| Supervisor | Máquina de estados del giro | Discreto | `executeProgramLoop()` |
| Control de giro | Control proporcional saturado con suelo | Continuo | `calculateTurnDecelPwm()` |
| Control de trayectoria | Control proporcional diferencial | Continuo | `updateForwardTrajectory()` |
| Anti-estancamiento | Incremento progresivo del suelo | Híbrido | `turnDecelFloorBoost` |
| Corrección inversa | Control proporcional temporal | Continuo | `yawCorrectionActive` |
| Planta | Driver, motores y ruedas | Continua | `executeMotorCommand()` |
| Seguridad | Supervisión mediante temporizadores | Discreto | Diversas rutinas |

`turnDecelFloorBoost` tiene un comportamiento parecido al de una acción integral, pero no integra directamente el error. Acumula información sobre la ausencia de progreso y aumenta el PWM mínimo aplicado al actuador. Puede describirse como un integrador discreto, acotado y con fugas aplicado a una señal de desempeño.

## 4. Modelo matemático de la planta

### 4.1 Modelo motor-rueda

Para una rueda motriz se considera una entrada $u$, expresada como porcentaje de PWM, y una velocidad lineal $v$:

$$
\tau_v \dot{v}(t) + v(t) = K_v u(t) - b_f c_{\mathrm{carga}}(t)
$$

donde $\tau_v$ es la constante de tiempo, $K_v$ la ganancia entre PWM y velocidad, $b_f$ el efecto equivalente de la fricción, $u(t)$ el PWM aplicado y $v(t)$ la velocidad de la rueda.

Ignorando inicialmente las perturbaciones de carga:

$$
\frac{V(s)}{U(s)} = \frac{K_v}{\tau_v s + 1}
$$

No existe un lazo interno de velocidad basado en encoders. El PWM se aplica directamente mediante:

```text
executeMotorCommand() -> speedPercentageToPWM() -> ledcWrite()
```

La conversión representa de 0 a 100 % mediante valores PWM de 0 a 1023, con una frecuencia aproximada de 1 kHz. Por tanto, desde el punto de vista de la velocidad, el sistema opera en lazo abierto.

### 4.2 Cinemática diferencial

Para un robot de tracción diferencial, con separación $b$ entre ruedas y orientación $\theta$:

$$
\dot{\theta} = \frac{v_R-v_L}{b}
$$

Para girar sobre el propio eje:

$$
 u_R=+u, \qquad u_L=-u
$$

El modelo simplificado de orientación es:

$$
G_{\theta\omega}(s)=\frac{\Theta(s)}{U(s)}=\frac{2K_v/b}{\tau_v s+1}=\frac{K_\omega}{\tau_v s+1}
$$

Durante el desplazamiento lineal se utiliza una velocidad común $u_0$ y una componente diferencial $c$:

$$
 u_R=u_0+c, \qquad u_L=u_0-c
$$

Una diferencia constante entre velocidades produce deriva angular acumulativa, por lo que la orientación debe realimentarse incluso durante una trayectoria recta.

## 5. Control de avance y retroceso

### 5.1 Ley de control de trayectoria

El Yaw obtenido mediante el DMP del MPU6050 se normaliza al intervalo $[-\pi,\pi)$. El error de rumbo es:

$$
 e_h(k)=\operatorname{wrap}(\hat{\theta}(k)-\theta^{\mathrm{ref}})
$$

Con una tolerancia $\varepsilon_h$:

$$
 |e_h|\leq\varepsilon_h \Rightarrow c(k)=0
$$

Fuera de la tolerancia, la corrección proporcional saturada es:

$$
 c(k)=\operatorname{sat}(K_p e_h,-c_{\max},c_{\max})
$$

Para avance:

$$
 u_L=u_0-c, \qquad u_R=u_0+c
$$

Para retroceso se intercambian los signos:

$$
 u_L=u_0+c, \qquad u_R=u_0-c
$$

La convención del firmware es $e=\hat{\theta}-\hat{\theta}_{\mathrm{ref}}$ y debe mantenerse coherente con el sentido positivo del Yaw.

### 5.2 Lazo cerrado y zona muerta

El modelo ideal con realimentación unitaria y acción proporcional es:

$$
 \dot{e}_h=-\frac{1}{T_h}e_h, \qquad e_h(t)=e_h(0)e^{-t/T_h}
$$

con $T_h=1/(K_pK_{c,\mathrm{vel}})$. Al discretizar con periodo $T_s$:

$$
 e_h(k+1)=e_h(k)\left(1-\frac{T_s}{T_h}\right)
$$

La condición de estabilidad es $0<T_s/T_h<2$, o equivalentemente $K_pK_{c,\mathrm{vel}}T_s<2$.

La compensación de zona muerta se expresa como:

$$
 c(k)=\operatorname{sign}(e_h)\max\left(c_{\min},\min(c_{\max},|K_pe_h|)\right)
$$

En modo proporcional se utiliza un suelo aproximado de 1 %, mientras que durante la corrección puede utilizarse un suelo de aproximadamente 5 %.

### 5.3 Corrección de sobrepaso

Cuando `updateForwardTrajectory()` detecta un cambio de signo, activa una corrección inversa con valores aproximados de 5 % de PWM mínimo, 15 % de PWM máximo y 500 ms de duración máxima.

## 6. Control de giros `TURN_YAW` y `TURN_YAW_D`

### 6.1 Error y zona de desaceleración

$$
 e(k)=\operatorname{wrap}(\theta_{\mathrm{goal}}-\hat{\theta}(k))
$$

$$
 Z=\min\left(Z_d,\left|\operatorname{wrap}(\theta_{\mathrm{goal}}-\theta_{\mathrm{start}})\right|\right)
$$

Así, un giro pequeño no utiliza innecesariamente una zona de desaceleración grande.

### 6.2 Control proporcional con suelo

Para $|e|\geq Z$ se aplica $u=u_{\max}$. Dentro de la zona:

$$
 u=u_f+(u_{\max}-u_f)\frac{|e|}{Z}
$$

El sentido se determina con el signo del error: $e>0$ implica `RIGHT` y $e<0$ implica `LEFT`. La ganancia efectiva es:

$$
 K_{\mathrm{zone}}=\frac{u_{\max}-u_f}{Z}
$$

Con $u_{\max}=40\%$, $u_f=15\%$ y $Z=45^\circ$, $K_{\mathrm{zone}}=0.556\%/{}^\circ$.

### 6.3 Corrección inversa

Al detectar un cambio de signo con $|e|>\varepsilon$, el supervisor activa `yawCorrectionActive` y utiliza:

$$
 u_{\mathrm{corr}}=u_f+(u_c-u_f)\operatorname{sat}\left(\frac{|e|}{e_{\mathrm{ref}}},0,1\right)
$$

Con los parámetros actuales, $u_c=20\%$ y $e_{\mathrm{ref}}=20^\circ$. La corrección termina por un segundo cambio de signo, después de aproximadamente 800 ms o cuando el error permanece dentro de la tolerancia durante el tiempo de estabilidad.

### 6.4 Anti-estancamiento y seguridad

Si durante aproximadamente 600 ms no se observa una mejora significativa, se incrementa el refuerzo:

$$
 \beta\leftarrow\min(\beta+2,6)
$$

El suelo puede evolucionar de 15 % a 17 %, 19 % y 21 %. Este mecanismo no integra directamente el error; detecta ausencia de progreso y aumenta temporalmente la actuación.

Los límites de seguridad son:

- `programInstructionTimeoutMs`: genera `NACK TIMEOUT`.
- Más de 5000 ms en la zona de desaceleración: genera `NACK DECEL_TIMEOUT`.
- Más de 800 ms en corrección: finaliza por timeout.
- `stable_ms >= 50 ms`: condición mínima de estabilidad.
- `MOTOR_TIMEOUT = 5000 ms`: límite global de operación.

## 7. Máquina de estados

```text
INICIO -> CRUCERO -> DESACELERACIÓN -> CONVERGENCIA
                         |
                         +-> CORRECCIÓN
                         +-> ERROR
```

| Modo y condición de transición | Ley de control | Resultado |
| --- | --- | --- |
| **`CRUCERO`**<br>$|e|\geq Z$ | $u=u_{\max}$, con dirección determinada por $\operatorname{sign}(e)$. | El robot ejecuta el giro con una actuación elevada y aproximadamente constante. Esta fase permite reducir rápidamente el error angular mientras el robot se encuentra fuera de la zona de desaceleración. |
| **`DESACELERACIÓN`**<br>$|e|<Z$, con $Z=\min(Z_{\mathrm{obs}},|\Delta\theta|)$.<br>El piso efectivo se define como $u_f=u_{\min}+\beta$, donde $\beta$ es el refuerzo anti-estancamiento. | $u=u_f+(u_{\max}-u_f)\dfrac{|e|}{Z}$ | El PWM disminuye progresivamente conforme el robot se aproxima al objetivo. La ley mantiene continuidad en el límite $|e|=Z$, donde $u=u_{\max}$. |
| **`CONVERGENCIA`**<br>$|e|\leq\varepsilon$.<br>En el perfil `PROGRAM_RAMP_LEGACY`, utilizado por la interfaz GUI, la convergencia se declara inmediatamente. | $u=0$, mediante `stopMotors()`. | Se detienen los motores, se considera completada la instrucción y el sistema avanza hacia la siguiente instrucción del programa. |
| **`CORRECCIÓN`**<br>Cambio de signo del error con $|e|>\varepsilon$, sin sobrepaso previo. | $u=u_f+(u_c-u_f)\min\left(1,\dfrac{|e|}{e_{\mathrm{ref}}}\right)$, aplicando una dirección inversa a la utilizada durante `CRUCERO`. | Se ejecuta un giro de retorno para reducir el sobrepaso angular y aproximar nuevamente la orientación al objetivo. |
| **`ERROR`**<br>Se agota `programInstructionTimeoutMs` o transcurren 5000 ms dentro de la zona de desaceleración sin alcanzar la convergencia. | $u=0$ y envío de NACK (`TIMEOUT` o `DECEL_TIMEOUT`). | La maniobra se aborta y el sistema establece `currentProgramState = PROGRAM_ERROR`. |

## 8. Parámetros de control

### 8.1 Giros

| Parámetro | Símbolo | Valor | Ajuste mediante BLE |
| --- | --- | --- | --- |
| PWM de instrucción | $u_{\max}$ | 35-40 % | `pwm` |
| Suelo de rotación | $u_f$ | 15 % | `YAW_OBS_MIN` |
| Zona de desaceleración | $Z_d$ | 45 grados | `YAW_OBS_ZONE` |
| Referencia de corrección | $e_{\mathrm{ref}}$ | 20 grados | `YAW_OBS_DEG` |
| PWM de corrección | $u_c$ | 20 % | `YAW_OBS_PWM` |
| Tiempo de corrección | - | 800 ms | `YAW_OBS_MS` |
| Modo del supervisor | - | 2 | `YAW_OBS` |
| Tolerancia | $\varepsilon$ | 2 grados | `tolerance` |
| Estabilidad mínima | - | 200 ms | `stable_ms` |
| Boost anti-estancamiento | $\beta$ | 0-6 % | Interno |
| Ventana sin progreso | - | 600 ms | Interno |
| Timeout de zona | - | 5000 ms | Interno |

### 8.2 Trayectoria lineal

| Parámetro | Símbolo | Valor | Ajuste mediante BLE |
| --- | --- | --- | --- |
| Modo | - | 2 | `FORWARD_CORR`, `ENABLE` |
| Tolerancia | $\varepsilon_h$ | 2 grados | `TOLERANCE` |
| Ganancia proporcional | $K_p$ | 1.2 | `KP` |
| Corrección máxima | $c_{\max}$ | 15 % | `MAX_CORRECTION` |
| PWM de corrección | - | 15 % | `CORR_PWM` |
| Duración de corrección | - | 500 ms | `CORR_MS` |
| Suelo proporcional | $c_{\min}$ | 1 % | Interno |
| Suelo en corrección | $c_{\min,c}$ | 5 % | Interno |

### 8.3 Parámetros de planta por identificar

| Símbolo | Descripción | Método |
| --- | --- | --- |
| $K_\omega$ | Grados/s por porcentaje de PWM | Giro en sitio y medición de $\Delta\hat{\theta}/\Delta t$ |
| $K_v$ | m/s por porcentaje de PWM | $K_\omega=2K_v/b$ |
| $b$ | Separación entre ruedas | Medición física |
| $\tau_v$ | Constante de tiempo | Respuesta al escalón al 63 % |
| $K_{c,\mathrm{vel}}$ | Grados/s por diferencial | Marcha con $c$ constante |
| $T_s$ | Periodo de muestreo | Medición de `loop()` |

## 9. Ejemplo numérico: giro de 90 grados

Considérese $\theta_{\mathrm{start}}=0^\circ$, $\theta_{\mathrm{goal}}=90^\circ$, $u_{\max}=40\%$, $u_f=15\%$, $Z_d=45^\circ$, $\varepsilon=2^\circ$, $K_\omega=2.5^\circ/(s\cdot\%)$ y $\tau_v=0.15$ s.

La zona es $Z=\min(45^\circ,90^\circ)=45^\circ$. En crucero, la velocidad angular estimada es $2.5\times40=100^\circ/s$ y el tiempo para llegar a la zona es:

$$
 t_1=\frac{90-45}{100}=0.45\text{ s}
$$

La constante de tiempo aproximada de la cola es $\tau_{\mathrm{cola}}=1/(K_{\mathrm{zone}}K_\omega)=0.72$ s. El tiempo aproximado para alcanzar la tolerancia es:

$$
 t_2=0.72\ln(45/2)\approx2.24\text{ s}
$$

Para un sobrepaso de 8 grados, $u_{\mathrm{corr}}=15+(20-15)(8/20)=17\%$ y el tiempo teórico de corrección es aproximadamente 0.19 s. El tiempo total estimado es:

$$
 t_{\mathrm{total}}\approx0.45+2.24+0.19+0.20=3.08\text{ s}
$$

Si el error permanece cerca de 6 grados durante 600 ms, el suelo puede aumentar de 15 % a 21 % mediante $\beta:0\rightarrow2\rightarrow4\rightarrow6$. Si no converge después de 5000 ms, se genera `DECEL_TIMEOUT` y se transita a `ERROR`.

## 10. Estabilidad y temporización

El ciclo principal ejecuta `executeProgramLoop()` y utiliza `delay(10)`, por lo que el periodo nominal es $T_s\approx10$ ms y la frecuencia nominal $f_s\approx100$ Hz.

Con $K_{\mathrm{zone}}=0.556$, $K_\omega=2.5$ y $T_s=0.01$ s:

$$
 K_{\mathrm{zone}}K_\omega T_s^2=0.556(2.5)(0.01)^2\approx1.4\times10^{-4}
$$

El periodo real puede variar porque `executeMotorCommand()` escribe información mediante `Serial`. Para una validación experimental rigurosa debe medirse el periodo efectivo, no solo el valor nominal.

## 11. Telemetría y verificación experimental

| Registro | Información | Frecuencia |
| --- | --- | --- |
| `[YAW_OBS]` | Yaw, objetivo, error, sobrepaso, corrección, zona, PWM y suelo | 100 ms |
| `[FWD_TRAJ]` | Yaw, referencia, error, corrección y PWM de ambas ruedas | 500 ms |
| `[HEADING,PROGRAM]` | Referencia, error, corrección y PWM de ambas ruedas | 250 ms |
| `[RAMP,PROGRAM]` | Estados `ACCEL`, `CRUISE`, `DECEL` y `LEGACY` | Cambio de estado |

Los registros permiten obtener error estacionario, sobrepaso máximo, cambios de signo, tiempo de establecimiento, repetibilidad, variación del error y frecuencia de activación del anti-estancamiento.

### 11.1 Protocolo para identificar $K_\omega$

1. Establecer $u_{\max}=40\%$.
2. Ejecutar un giro de 180 grados sobre el propio eje.
3. Registrar el Yaw con frecuencia suficiente.
4. Medir la velocidad angular en régimen permanente.
5. Calcular $K_\omega=\dot{\theta}_{ss}/u_{\max}$.
6. Obtener $\tau_v$ mediante el tiempo correspondiente al 63 % de la respuesta al escalón.
7. Repetir con $u_{\max}=25\%$ para verificar la linealidad.

## 12. Síntesis

El sistema de control del PILIBOT es un controlador jerárquico con lazo abierto de velocidad y lazo cerrado de orientación. La ley continua es proporcional y utiliza saturación, compensación de zona muerta y ganancia dependiente del error.

Sobre esta capa se encuentra un supervisor discreto que detecta sobrepaso, convergencia y estancamiento. Ante un sobrepaso activa una corrección temporal inversa; ante una ausencia prolongada de progreso incrementa el suelo de PWM para superar la fricción estática.

En consecuencia, `yawObserver*` y `forwardTrajectory*` deben entenderse como componentes de supervisión y detección de eventos, no como observadores de estados en el sentido clásico de la teoría de control.
