import { Cubo, Esfera } from './classes.js';
import { identidad, rotacionX, rotacionY, rotacionZ, escalacion, ortho } from './functions.js';

/* Variables globales */
let gl;
let programaID;
let textura;
let textura2;
let codigoDeTextura;

/* Variables Uniformes */
let uMatrizProyeccion;
let uMatrizVista;
let uMatrizModelo;
let uUnidadDeTextura;

/* Matrices */
let MatrizProyeccion = new Array(16);
let MatrizVista = new Array(16);
let MatrizModelo = new Array(16);

/* Incremento del ángulo de la animación */
let rotX = 0;
let rotY = 0;
let rotZ = 0;
const INCX = 0.3;
const INCY = 0.2;
const INCZ = 0.4;
let incX = INCX;
let incY = INCY;
let incZ = INCZ;

export let animacion = false;

let tiempo_real, fin, duracion;
let inicio = Date.now(); // Tiempo Inicial
const PERIODO_MOVIMIENTO = 0.01; // 1/60 = 0.0167 (60 cuadros por seg.)
let tiempoMovimiento = PERIODO_MOVIMIENTO;

const compilaEnlazaLosShaders = () => {

  /* Se compila el shader de vertice */
  let shaderDeVertice = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shaderDeVertice, document.getElementById("vs").text.trim());
  gl.compileShader(shaderDeVertice);
  if (!gl.getShaderParameter(shaderDeVertice, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shaderDeVertice));
  }

  /* Se compila el shader de fragmento */
  let shaderDeFragmento = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shaderDeFragmento, document.getElementById("fs").text.trim());
  gl.compileShader(shaderDeFragmento);
  if (!gl.getShaderParameter(shaderDeFragmento, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shaderDeFragmento));
  }

  /* Se enlaza ambos shader */
  programaID = gl.createProgram();
  gl.attachShader(programaID, shaderDeVertice);
  gl.attachShader(programaID, shaderDeFragmento);
  gl.linkProgram(programaID);
  if (!gl.getProgramParameter(programaID, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(programaID));
  }
}


/***************************************************************************/
/* Lee la Textura                                                          */
/***************************************************************************/
function leeLaTextura(gl, ID_del_archivo, codigoDeTextura) {

  /* Se asigna un nombre (código) a la textura */
  gl.bindTexture(gl.TEXTURE_2D, codigoDeTextura);

  /* true, invierte los píxeles en el orden de abajo hacia arriba que WebGL espera */
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  /* Obtiene la imagen */
  let imagen = document.getElementById(ID_del_archivo);

  /* Se lee la textura */
  /* |  tipo   |0=1 resol|RGB/RGBA |orden col|tip datos| buffer  | */
  /* |    1    |    2    |    3    |    4    |    5    |    6    | */
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imagen);

  /* Para que el patrón de textura se agrande y se acomode a una área grande */
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  /* Para que el patrón de textura se reduzca y se acomode a una área pequeña */
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

  /* Para repetir la textura tanto en s y t fuera del rango del 0 al 1
    * POR DEFECTO! */
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  /* Para limitar la textura tanto de s y t dentro del rango del 0 al 1 */
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  /* Se deja de asignar un nombre (código) a la textura */
  gl.bindTexture(gl.TEXTURE_2D, null);

}

/***************************************************************************/
/* Se renderizan todos los objetos                                         */
/***************************************************************************/

const dibuja = () => {

  /* Inicializa el buffer de color */
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  /* Matriz del Modelo */
  identidad(MatrizModelo);
  rotacionX(MatrizModelo, rotX);
  rotacionY(MatrizModelo, rotY);
  rotacionZ(MatrizModelo, rotZ);
  escalacion(MatrizModelo, 2, 2, 2);
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  /* Se activa la unidad de textura 0 */
  gl.activeTexture(gl.TEXTURE0);

  /* Se vincula uUnidadDeTextura a la unidad de textura 0 */
  gl.uniform1i(uUnidadDeTextura, 0);

  /* Se vincula la textura con la unidad de textura 0 */
  gl.bindTexture(gl.TEXTURE_2D, codigoDeTextura);

  /* Muestra la textura */
  textura.muestra(gl);

  /* Se efectua los incrementos para la animación */
  fin = Date.now(); // Tiempo Final
  duracion = fin - inicio;
  inicio = fin;
  tiempo_real = duracion / 1000.0;

  tiempoMovimiento = tiempoMovimiento - tiempo_real;
  if (tiempoMovimiento < 0.001) {
    tiempoMovimiento = PERIODO_MOVIMIENTO;
    rotX = rotX + incX;
    rotY = rotY + incY;
    rotZ = rotZ + incZ;
  }

  /* Solicita que el navegador llame nuevamente a dibuja */
  requestAnimationFrame(dibuja);
}

const main = () => {

  /* Paso 1: Se prepara el lienzo y se obtiene el contexto del WebGL.        */
  let canvas = document.getElementById("webglcanvas");
  canvas.width = window.innerWidth;   // devuelve el ancho de la ventana
  canvas.height = window.innerHeight; // devuelve el alto de la ventana
  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("WebGL 2.0 no está disponible en tu navegador");
    return;
  }

  // Se define la ventana de despliegue
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  /* Paso 2: Se crean, compilan y enlazan los programas Shader               */
  compilaEnlazaLosShaders();

  /* Paso 3: Se define la geometría y se almacenan en los buffers de memoria.*/
  textura = new Esfera(gl, 1, 48, 48);

  /* Genera un nombre (código) para la textura */
  codigoDeTextura = gl.createTexture();

  /* Lee la textura */
  leeLaTextura(gl, "imagenTextura", codigoDeTextura)

  /* Paso 4: Se obtiene los ID de las letiables de entrada de los shaders    */

  // Se utiliza los shaders
  gl.useProgram(programaID);

  // Obtiene los ID de las letiables de entrada de los shaders
  uMatrizProyeccion = gl.getUniformLocation(programaID, "uMatrizProyeccion");
  uMatrizVista = gl.getUniformLocation(programaID, "uMatrizVista");
  uMatrizModelo = gl.getUniformLocation(programaID, "uMatrizModelo");
  uUnidadDeTextura = gl.getUniformLocation(programaID, "uUnidadDeTextura");

  /* Paso 5: Se define la proyección  
                                        */
  // Define la Matriz de Proyección
  ortho(MatrizProyeccion, -5 * gl.canvas.width / gl.canvas.height, 5 * gl.canvas.width / gl.canvas.height, -5, 5, -5, 5);

  // Se envia la Matriz de Proyección al shader
  gl.uniformMatrix4fv(uMatrizProyeccion, false, MatrizProyeccion);

  /* Paso 6: Se renderizan los objetos                                       */

  /* Matriz del Vista */
  identidad(MatrizVista);

  // Se envia la Matriz de Vista al shader
  gl.uniformMatrix4fv(uMatrizVista, false, MatrizVista);

  /* Habilita el ocultamiento de superficies */
  gl.enable(gl.DEPTH_TEST);

  // Color de fondo          
  gl.clearColor(112 / 255, 128 / 255, 144 / 255, 1.0);

  dibuja();

}

main();

