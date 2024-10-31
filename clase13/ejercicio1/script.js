'use strict';

/* Variables globales */
let gl;
let programaID;
let textura;
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
    let vertices = [
      -3, -3, // 0
      3, -3, // 1
      3, 3, // 2
      -3, 3, // 3
    ];

    /* Coordenadas de textura (u, v) */
    let coord_textura = [
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
    let codigoVertices = gl.createBuffer();

    /* Se asigna un nombre (código) al buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);

    /* Se transfiere los datos desde la memoria nativa al buffer de la GPU */
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    /* Se habilita el arreglo de los vértices (indice = 0) */
    gl.enableVertexAttribArray(0);

    /* Se especifica los atributos del arreglo de vértices */
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);


    /* Se genera un nombre (código) para el buffer */
    let codigoCoordenadasDeTextura = gl.createBuffer();

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
const leeLaTextura = (gl, ID_del_archivo, codigoDeTextura) => {

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

const main = () => {

  /* Paso 1: Se prepara el lienzo y se obtiene el contexto del WebGL.        */
  let canvas = document.getElementById("webglcanvas");

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

/* Llama a main una vez que la página web se haya cargado. */
main();
