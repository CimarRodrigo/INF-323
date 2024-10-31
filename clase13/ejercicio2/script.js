import { ortho, identidad } from './matriz.js';
'use strict';
/* Variables globales */
var gl;
var programaID;
var textura;
var codigoDeTextura;

/* Variables Uniformes */
var uMatrizProyeccion;
var uMatrizVista;
var uMatrizModelo;
var uUnidadDeTextura;

/* Matrices */
var MatrizProyeccion = new Array(16);
var MatrizVista = new Array(16);
var MatrizModelo = new Array(16);

/***************************************************************************/
/* Se crean, compilan y enlazan los programas Shader                       */
/***************************************************************************/
function compilaEnlazaLosShaders() {

  /* Se compila el shader de vertice */
  var shaderDeVertice = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shaderDeVertice, document.getElementById("vs").text.trim());
  gl.compileShader(shaderDeVertice);
  if (!gl.getShaderParameter(shaderDeVertice, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shaderDeVertice));
  }

  /* Se compila el shader de fragmento */
  var shaderDeFragmento = gl.createShader(gl.FRAGMENT_SHADER);
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
/* Transformaciones mediante matrices                                      */
/***************************************************************************/

/* Convierte de grados a radianes */
function toRadians(grados) {
  return grados * Math.PI / 180;
};

/* Matriz Identidad */
function identidad(r) {
  r[0] = 1; r[4] = 0; r[8] = 0; r[12] = 0;
  r[1] = 0; r[5] = 1; r[9] = 0; r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = 1; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
}

/* Traslación - glTranslatef */
function traslacion(matriz, tx, ty, tz) {
  var r = new Array(16);
  r[0] = 1; r[4] = 0; r[8] = 0; r[12] = tx;
  r[1] = 0; r[5] = 1; r[9] = 0; r[13] = ty;
  r[2] = 0; r[6] = 0; r[10] = 1; r[14] = tz;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* Escalación - glScalef */
function escalacion(matriz, sx, sy, sz) {
  var r = new Array(16);
  r[0] = sx; r[4] = 0; r[8] = 0; r[12] = 0;
  r[1] = 0; r[5] = sy; r[9] = 0; r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = sz; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* Rotación sobre X - glRotatef */
function rotacionX(matriz, theta) {
  let r = new Array(16);
  var c = Math.cos(toRadians(theta));
  var s = Math.sin(toRadians(theta));
  r[0] = 1; r[4] = 0; r[8] = 0; r[12] = 0;
  r[1] = 0; r[5] = c; r[9] = -s; r[13] = 0;
  r[2] = 0; r[6] = s; r[10] = c; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* Rotación sobre Y - glRotatef */
function rotacionY(matriz, theta) {
  let r = new Array(16);
  var c = Math.cos(toRadians(theta));
  var s = Math.sin(toRadians(theta));
  r[0] = c; r[4] = 0; r[8] = s; r[12] = 0;
  r[1] = 0; r[5] = 1; r[9] = 0; r[13] = 0;
  r[2] = -s; r[6] = 0; r[10] = c; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* Rotación sobre Z - glRotatef */
function rotacionZ(matriz, theta) {
  let r = new Array(16);
  var c = Math.cos(toRadians(theta));
  var s = Math.sin(toRadians(theta));
  r[0] = c; r[4] = -s; r[8] = 0; r[12] = 0;
  r[1] = s; r[5] = c; r[9] = 0; r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = 1; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* Proyección Paralela - glOrtho */
function ortho(r, izq, der, abj, arr, cerca, lejos) {
  r[0] = 2 / (der - izq); r[4] = 0; r[8] = 0; r[12] = -(der + izq) / (der - izq);
  r[1] = 0; r[5] = 2 / (arr - abj); r[9] = 0; r[13] = -(arr + abj) / (arr - abj);
  r[2] = 0; r[6] = 0; r[10] = -2 / (lejos - cerca); r[14] = -(lejos + cerca) / (lejos - cerca);
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
}

/* Proyección Perspectiva - glFrustum */
function frustum(r, izq, der, abj, arr, cerca, lejos) {
  r[0] = 2 * cerca / (der - izq); r[4] = 0; r[8] = (der + izq) / (der - izq); r[12] = 0;
  r[1] = 0; r[5] = 2 * cerca / (arr - abj); r[9] = (arr + abj) / (arr - abj); r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = -(lejos + cerca) / (lejos - cerca); r[14] = -2 * lejos * cerca / (lejos - cerca);
  r[3] = 0; r[7] = 0; r[11] = -1; r[15] = 0;
}

/* Proyección Perspectiva - gluPerspective */
function perspective(r, fovy, aspecto, cerca, lejos) {
  var ang = fovy * 0.5;
  var f = (Math.abs(Math.sin(toRadians(ang))) < 1e-8 ? 0 : 1) / Math.tan(toRadians(ang));
  r[0] = f / aspecto; r[4] = 0; r[8] = 0; r[12] = 0;
  r[1] = 0; r[5] = f; r[9] = 0; r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = -(lejos + cerca) / (lejos - cerca); r[14] = -2.0 * lejos * cerca / (lejos - cerca);
  r[3] = 0; r[7] = 0; r[11] = - 1.0; r[15] = 0;
}

/* Multiplicación de matrices de 4 x 4 */
function multiplica(c, a, b) {
  let r = new Array(16);
  let i, j, k;
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      let s = 0;
      for (k = 0; k < 4; k++)
        s = s + a[i + k * 4] * b[k + j * 4];
      r[i + j * 4] = s;
    }
  }
  for (i = 0; i < 16; i++)
    c[i] = r[i];
}

/***********************************************************************************/
/* Se define la geometría y se almacenan en los buffers de memoria y se renderiza. */
/***********************************************************************************/
class Rectangulo {

  /**
   *       vertices            coord_textura
   *   x1,y2      x2,y2      u1,v2       u2,v2
   *      ----------            ---------- 
   *     |        / |          |        / | 
   *     |      /   |          |      /   | 
   *     |    /     |          |    /     |
   *     | /        |          | /        |
   *      ----------            ---------- 
   *   x1,y1      x2,y1      u1,v1       u2,v1
   */
  constructor(gl) {

    /* Coordenadas cartesianas (x, y) */
    var vertices = [
      -3, -3, // 0
      3, -3, // 1
      3, 3, // 2
      -3, 3, // 3
    ];

    /* Coordenadas de textura (u, v) */
    var coord_textura = [
      0, 0, // 0
      1, 0, // 1
      1, 1, // 2
      0, 1, // 3
    ];

    /* Se crea el objeto del arreglo de vértices (VAO) */
    this.rectanguloVAO = gl.createVertexArray();

    /* Se activa el objeto */
    gl.bindVertexArray(this.rectanguloVAO);


    /* Se genera un nombre (código) para el buffer */
    var codigoVertices = gl.createBuffer();

    /* Se asigna un nombre (código) al buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);

    /* Se transfiere los datos desde la memoria nativa al buffer de la GPU */
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    /* Se habilita el arreglo de los vértices (indice = 0) */
    gl.enableVertexAttribArray(0);

    /* Se especifica los atributos del arreglo de vértices */
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);


    /* Se genera un nombre (código) para el buffer */
    var codigoCoordenadasDeTextura = gl.createBuffer();

    /* Se asigna un nombre (código) al buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoCoordenadasDeTextura);

    /* Se transfiere los datos desde la memoria nativa al buffer de la GPU */
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coord_textura), gl.STATIC_DRAW);

    /* Se habilita el arreglo de las coordenadas de textura (indice = 1) */
    gl.enableVertexAttribArray(1);

    /* Se especifica el arreglo de las coordenadas de textura */
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);


    /* Se desactiva el objeto del arreglo de vértices */
    gl.bindVertexArray(null);

    /* Se deja de asignar un nombre (código) al buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

  }

  muestra(gl) {

    /* Se activa el objeto del arreglo de vértices */
    gl.bindVertexArray(this.rectanguloVAO);

    /* Renderiza las primitivas desde los datos de los arreglos (vértices,
     * coordenadas de textura) */
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    /* Se desactiva el objeto del arreglo de vértices */
    gl.bindVertexArray(null);
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
  var imagen = document.getElementById(ID_del_archivo);

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

function dibuja() {

  /* Inicializa el buffer de color */
  gl.clear(gl.COLOR_BUFFER_BIT);

  /* Matriz del Modelo */
  identidad(MatrizModelo);

  // Se envia la Matriz del Modelo al shader
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  /* Se activa la unidad de textura 0 */
  gl.activeTexture(gl.TEXTURE0);

  /* Se vincula uUnidadDeTextura a la unidad de textura 0 */
  gl.uniform1i(uUnidadDeTextura, 0);

  /* Se vincula la textura con la unidad de textura 0 */
  gl.bindTexture(gl.TEXTURE_2D, codigoDeTextura);

  /* Muestra la textura */
  textura.muestra(gl);

}

function main() {

  /* Paso 1: Se prepara el lienzo y se obtiene el contexto del WebGL.        */
  var canvas = document.getElementById("webglcanvas");

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
  textura = new Rectangulo(gl);

  /* Genera un nombre (código) para la textura */
  codigoDeTextura = gl.createTexture();

  /* Lee la textura */
  leeLaTextura(gl, "imagenTextura", codigoDeTextura)

  /* Paso 4: Se obtiene los ID de las variables de entrada de los shaders    */

  // Se utiliza los shaders
  gl.useProgram(programaID);

  // Obtiene los ID de las variables de entrada de los shaders
  uMatrizProyeccion = gl.getUniformLocation(programaID, "uMatrizProyeccion");
  uMatrizVista = gl.getUniformLocation(programaID, "uMatrizVista");
  uMatrizModelo = gl.getUniformLocation(programaID, "uMatrizModelo");
  uUnidadDeTextura = gl.getUniformLocation(programaID, "uUnidadDeTextura");

  /* Paso 5: Se define la proyección  
                                        */
  // Define la Matriz de Proyección
  ortho(MatrizProyeccion, -5, 5, -5, 5, -5, 5);

  // Se envia la Matriz de Proyección al shader
  gl.uniformMatrix4fv(uMatrizProyeccion, false, MatrizProyeccion);

  /* Paso 6: Se renderizan los objetos                                       */

  /* Matriz del Vista */
  identidad(MatrizVista);

  // Se envia la Matriz de Vista al shader
  gl.uniformMatrix4fv(uMatrizVista, false, MatrizVista);

  // Color de fondo          
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  dibuja();

}

main();
