"use strict";
import { identidad, escalacion, rotacionX, rotacionY, rotacionZ, ortho } from './matriz.js'
/* Variables globales */
let programaID;
let gl;
let cubo;

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
class Cubo {
  constructor(gl) {

    /**
     *       3 --------- 2
     *       /|        /|   
     *      / |       / |
     *    7 --------- 6 |
     *     |  |      |  |
     *     | 0 ------|-- 1 
     *     | /       | /
     *     |/        |/
     *    4 --------- 5  
     */

    /* Las coordenadas cartesianas (x, y) */
    let vertices = [
      -1, -1, -1, // 0
      1, -1, -1, // 1
      1, 1, -1, // 2
      -1, 1, -1, // 3
      -1, -1, 1, // 4
      1, -1, 1, // 5
      1, 1, 1, // 6
      -1, 1, 1, // 7
    ];

    /* Indices */
    let indices = [
      4, 5, 5, 6, 6, 7, 7, 4, // Frente
      3, 2, 2, 1, 1, 0, 0, 3, // Atrás
      0, 4, 4, 7, 7, 3, 3, 0, // Izquierda
      5, 1, 1, 2, 2, 6, 6, 5, // Derecha
      0, 1, 1, 5, 5, 4, 4, 0, // Abajo
      7, 6, 6, 2, 2, 3, 3, 7, // Arriba
    ];

    /* Se crea el objeto del arreglo de vértices (VAO) */
    this.cuboVAO = gl.createVertexArray();

    /* Se activa el objeto */
    gl.bindVertexArray(this.cuboVAO);


    /* Se genera un nombre (código) para el buffer */
    let codigoVertices = gl.createBuffer();

    /* Se asigna un nombre (código) al buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);

    /* Se transfiere los datos desde la memoria nativa al buffer de la GPU */
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    /* Se habilita el arreglo de los vértices (indice = 0) */
    gl.enableVertexAttribArray(0);

    /* Se especifica el arreglo de vértices */
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);


    /* Se genera un nombre (código) para el buffer */
    let codigoDeIndices = gl.createBuffer();

    /* Se asigna un nombre (código) al buffer */
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, codigoDeIndices);

    /* Se transfiere los datos desde la memoria nativa al buffer de la GPU */
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


    /* Se desactiva el objeto del arreglo de vértices */
    gl.bindVertexArray(null);

    /* Se deja de asignar un nombre (código) al buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    /* Se deja de asignar un nombre (código) al buffer */
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  }

  dibuja(gl) {

    /* Se activa el objeto del arreglo de vértices */
    gl.bindVertexArray(this.cuboVAO);

    /* Renderiza las primitivas desde los datos de los arreglos (vértices,
     * colores e indices) */
    gl.drawElements(gl.LINES, 48, gl.UNSIGNED_SHORT, 0);

    /* Se desactiva el objeto del arreglo de vértices */
    gl.bindVertexArray(null);

  }
}

/***************************************************************************/
/* Se renderizan todos los objetos                                         */
/***************************************************************************/
const dibuja = () => {

  /* Inicializa el buffer de color y de profundidad */
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  /* Matriz del Modelo */
  identidad(MatrizModelo);
  rotacionX(MatrizModelo, rotX);
  rotacionY(MatrizModelo, rotY);
  rotacionZ(MatrizModelo, rotZ);
  escalacion(MatrizModelo, 2, 2, 2);
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  /* Se establece el color en (r,g,b,a) */
  gl.uniform4f(uColor, 0, 1, 0, 1);

  /* Renderiza */
  cubo.dibuja(gl);

  /* Se efectua loa incrementos para la animación */
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
  cubo = new Cubo(gl);

  /* Ancho de la linea */
  gl.lineWidth(1);

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

  dibuja();
}

/* Llama a main una vez que la página web se haya cargado. */
main();
