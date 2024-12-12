'use strict';

import { ortho, identidad, traslacion } from './matriz.js';

let gl;
let programaID;
let textura1;
let codigoDeTextura1;

let textura2;
let codigoDeTextura2;

let uMatrizProyeccion;
let uMatrizVista;
let uMatrizModelo;
let uUnidadDeTextura;

let uColor;

let MatrizProyeccion = new Array(16);
let MatrizVista = new Array(16);
let MatrizModelo = new Array(16);

const compilaEnlazaLosShaders = () => {

  let shaderDeVertice = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shaderDeVertice, document.getElementById("vs").text.trim());
  gl.compileShader(shaderDeVertice);
  if (!gl.getShaderParameter(shaderDeVertice, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shaderDeVertice));
  }

  let shaderDeFragmento = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shaderDeFragmento, document.getElementById("fs").text.trim());
  gl.compileShader(shaderDeFragmento);
  if (!gl.getShaderParameter(shaderDeFragmento, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shaderDeFragmento));
  }

  programaID = gl.createProgram();
  gl.attachShader(programaID, shaderDeVertice);
  gl.attachShader(programaID, shaderDeFragmento);
  gl.linkProgram(programaID);
  if (!gl.getProgramParameter(programaID, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(programaID));
  }
}

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
      -1, -1, // 0
      1, -1, // 1
      1, 1, // 2
      -1, 1, // 3
    ];

    /* Coordenadas de textura (u, v) */
    //let coord_textura = [
    //0, 0, // 0
    //2, 0, // 1
    //2, 2, // 2
    //0, 2, // 3
    //];
    let coord_textura = [
      0, 0, // 0
      1, 0, // 1
      1, 1, // 2
      0, 1, // 3
    ];

    this.rectanguloVAO = gl.createVertexArray();

    gl.bindVertexArray(this.rectanguloVAO);

    let codigoVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);

    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);


    let codigoCoordenadasDeTextura = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, codigoCoordenadasDeTextura);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coord_textura), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

  }

  muestra(gl) {

    gl.bindVertexArray(this.rectanguloVAO);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);
  }

}


const dibuja = (textura, codigoDeTextura, tras = false, posX = 0, posY = 0) => {

  identidad(MatrizModelo);
  if (tras) traslacion(MatrizModelo, posX, posY, 0);
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  gl.bindTexture(gl.TEXTURE_2D, codigoDeTextura);

  textura.muestra(gl);

}

const leeLaTextura = (gl, ID_del_archivo, codigoDeTextura) => {

  gl.bindTexture(gl.TEXTURE_2D, codigoDeTextura);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  let imagen = document.getElementById(ID_del_archivo);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imagen);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  gl.bindTexture(gl.TEXTURE_2D, null);
}

const main = () => {
  let canvas = document.getElementById("webglcanvas");

  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("WebGL 2.0 no está disponible en tu navegador");
    return;
  }
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  compilaEnlazaLosShaders();

  textura1 = new Rectangulo(gl);

  codigoDeTextura1 = gl.createTexture();
  leeLaTextura(gl, "imagenTextura1", codigoDeTextura1);

  textura2 = new Rectangulo(gl);

  codigoDeTextura2 = gl.createTexture();
  leeLaTextura(gl, "imagenTextura2", codigoDeTextura2);

  gl.useProgram(programaID);

  uMatrizProyeccion = gl.getUniformLocation(programaID, "uMatrizProyeccion");
  uMatrizVista = gl.getUniformLocation(programaID, "uMatrizVista");
  uMatrizModelo = gl.getUniformLocation(programaID, "uMatrizModelo");
  uUnidadDeTextura = gl.getUniformLocation(programaID, "uUnidadDeTextura");
  uColor = gl.getUniformLocation(programaID, "uColor");

  ortho(MatrizProyeccion, -5, 5, -5, 5, -5, 5);
  gl.uniformMatrix4fv(uMatrizProyeccion, false, MatrizProyeccion);

  identidad(MatrizVista);
  gl.uniformMatrix4fv(uMatrizVista, false, MatrizVista);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.activeTexture(gl.TEXTURE0);

  dibuja(textura1, codigoDeTextura1, true, 2, 1);
  dibuja(textura2, codigoDeTextura2, true, -2, 0);

}

main();