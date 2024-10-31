"use strict";
import { identidad, escalacion, rotacionX, rotacionY, rotacionZ, ortho, traslacion } from './matriz.js'
/* Variables globales */
let programaID;
let gl;

/* Variables Uniformes */
let uColor;
let uMatrizProyeccion;
let uMatrizVista;
let uMatrizModelo;

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

let incX = 0;
let incY = 0;
let incZ = 0;

let animacion = false;

let tiempo_real, fin, duracion;
let inicio = Date.now(); // Tiempo Inicial

const PERIODO_MOVIMIENTO = 0.01; // 1/60 = 0.0167 (60 cuadros por seg.)
let tiempoMovimiento = PERIODO_MOVIMIENTO;

let obj1;

/***************************************************************************/
/* Se crean, compilan y enlazan los programas Shader                       */
/***************************************************************************/
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

  /* Se instala el programa de shaders para utilizarlo */
  gl.useProgram(programaID);
}


/***********************************************************************************/
/* Se define la geometría y se almacenan en los buffers de memoria y se renderiza. */
/***********************************************************************************/
class Objeto {
  constructor() {
  }
  async leeArchivoJson(nombreArchivo, gl) {

    return fetch(nombreArchivo)
      .then(res => res.json())
      .then(data => {
        this.datosObjeto = data;

        this.objetoVAO = gl.createVertexArray();
        gl.bindVertexArray(this.objetoVAO);

        var codigoVertices = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.datosObjeto.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        var codigoIndices = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, codigoIndices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.datosObjeto.indices), gl.STATIC_DRAW);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      })
      .catch(console.error);
  }

  dibuja(gl) {
    gl.bindVertexArray(this.objetoVAO);
    gl.uniform4f(uColor, 0, 1, 0, 1);
    gl.drawElements(gl.LINES, this.datosObjeto.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }
}
/***************************************************************************/
/* Se renderizan todos los objetos                                         */
/***************************************************************************/
function dibuja() {
  /* Inicializa el buffer de color y de profundidad */
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  /* Matriz del Modelo */
  identidad(MatrizModelo);
  traslacion(MatrizModelo, 1.5, 0, 0);
  rotacionY(MatrizModelo, rotY);
  rotacionZ(MatrizModelo, rotZ);
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  /* Renderiza */
  obj1.dibuja(gl);

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

const animacionCheckbox = () => {
  let r = document.getElementById("animacion").checked
  if (r != animacion) {
    animacion = r;
    incX = incX == 0 ? INCY : 0;
    incY = incY == 0 ? INCY : 0;
    incZ = incZ == 0 ? INCZ : 0;
    dibuja();
  }
}
const main = () => {

  /* Paso 1: Se prepara el lienzo y se obtiene el contexto del WebGL.        */
  let canvas = document.getElementById("webglcanvas");

  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("WebGL 2.0 no está disponible en tu navegador");
    return;
  }

  /* Para las casillas de verificación */
  document.getElementById("animacion").checked = false;
  document.getElementById("animacion").onchange = animacionCheckbox;

  // Se define la ventana de despliegue
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  /* Paso 2: Se crean, compilan y enlazan los programas Shader               */
  compilaEnlazaLosShaders();

  /* Paso 3: Se define la geometría y se almacenan en los buffers de memoria.*/
  obj1 = new Objeto();
  obj1.leeArchivoJson('figura.json', gl);

  /* Ancho de la linea */
  //gl.lineWidth(1);

  /* Paso 4: Se obtiene los ID de las variables de entrada de los shaders    */
  gl.useProgram(programaID);
  uColor = gl.getUniformLocation(programaID, "uColor");
  uMatrizProyeccion = gl.getUniformLocation(programaID, "uMatrizProyeccion");
  uMatrizVista = gl.getUniformLocation(programaID, "uMatrizVista");
  uMatrizModelo = gl.getUniformLocation(programaID, "uMatrizModelo");

  /* Matriz de Proyección */
  ortho(MatrizProyeccion, -5, 5, -5, 5, -5, 5);
  gl.uniformMatrix4fv(uMatrizProyeccion, false, MatrizProyeccion);

  /* Matriz de Vista */
  identidad(MatrizVista);
  gl.uniformMatrix4fv(uMatrizVista, false, MatrizVista);

  /* Paso 5: Se renderizan los objetos                                       */

  /* Habilita el ocultamiento de superficies */
  gl.enable(gl.DEPTH_TEST);

  // Color de fondo
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //dibuja();
}

/* Llama a main una vez que la página web se haya cargado. */
main();
