"use strict";

import { identidad, traslacion, rotacionX, rotacionY, rotacionZ, escalacion, ortho, multiplicaMV, perspective } from "./matriz.js";
import { Objeto } from "./class.js";

/* Variables globales */
let programaID;
let gl;
let objeto;

/* Variables Uniformes */
export let uColor;
export let modoRenderizado;
let uMatrizProyeccion;
let uMatrizVista;
let uMatrizModelo;
let uUnidadDeTextura;
let codigoDeTextura;
let uPosicionVista;
let uPosicionLuz;
let u_Ia;
let u_Id;
let u_Is;
let u_ka;
let u_kd;
let u_ks;
let u_brillo;
let pLuz = new Array(3);

/* Matrices */
let MatrizProyeccion = new Array(16);
let MatrizVista = new Array(16);
let MatrizModelo = new Array(16);

let posicionVista = [0, 0, 0];

let posicionLuz = [0, 0, -3.5];

/* Incremento del ángulo de la animación */
let rotX = 0;
let rotY = 0;
let rotZ = 0;

let zx = 2, zy = 2, zz = 2; // Variables de escala para zoom
let trasX = 0, trasY = 0;   // Variables de traslación

let boton_izq_presionado = false;
let boton_der_presionado = false;
let antX, antY;


const cambiarColorFondo = () => {
  // Cambia el color de fondo a uno aleatorio o específico
  const colorAleatorio = [Math.random(), Math.random(), Math.random(), 1.0];
  gl.clearColor(...colorAleatorio);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

const alternarModoRenderizado = (modo) => {
  if (modo === 'GL_TRIANGLES') {
    modoRenderizado = gl.TRIANGLES;
  } else if (modo === 'GL_LINES') {
    modoRenderizado = gl.LINES;
  }
  dibuja(); // Redibuja con el nuevo modo
}

const cambiarFigura = (urlObj, name) => {
  cargarModelo(urlObj, name);
}

const cargarModelo = async (urlObj, name) => {
  let data = await loadFromJSON(urlObj);
  objeto = new Objeto(gl, data);

  codigoDeTextura = gl.createTexture();
  leeLaTextura(gl, name, codigoDeTextura);



  dibuja();
}
const loadFromJSON = async (jsonPath) => {
  try {
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`Error al cargar el archivo JSON: ${response.statusText}`);
    }

    const jsonData = await response.json();


    let vertices = jsonData.vertices;
    let coord_textura = jsonData.coord_textura;
    let indices = jsonData.indices;

    let res = { vertices, coord_textura, indices };

    console.log("Datos cargados desde el JSON:", jsonData);
    return res;
  } catch (error) {
    console.error("Error al cargar el archivo JSON:", error);
  }
}

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

const mouseDown = (event) => {
  if (event.button === 0) {
    boton_izq_presionado = true;
  } else if (event.button === 2) {
    boton_der_presionado = true;
  }
  antX = event.clientX;
  antY = event.clientY;
}

const mouseUp = (event) => {
  if (event.button === 0) {
    boton_izq_presionado = false;
  } else if (event.button === 2) {
    boton_der_presionado = false;
  }
}

const mouseMove = (event) => {
  let dx = event.clientX - antX;
  let dy = event.clientY - antY;

  if (boton_izq_presionado) {
    // Ahora rota con clic izquierdo
    rotY += dx * 0.3;
    rotX += dy * 0.3;
  } else if (boton_der_presionado) {
    // Ahora mueve con clic derecho
    trasX += dx * 0.01;
    trasY -= dy * 0.01;
  }

  antX = event.clientX;
  antY = event.clientY;
}

const zoom = (event) => {
  event.preventDefault();
  if (event.deltaY > 0) {
    zx -= 0.1; zy -= 0.1; zz -= 0.1;
  } else {
    zx += 0.1; zy += 0.1; zz += 0.1;
  }
}


const dibuja = () => {
  let brillo = document.getElementById("brillo").value;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  posicionLuz[0] = x;
  posicionLuz[1] = y;
  posicionLuz[2] = z;

  identidad(MatrizModelo);

  traslacion(MatrizModelo, trasX, trasY, 0);
  rotacionY(MatrizModelo, rotY);
  rotacionX(MatrizModelo, rotX);
  rotacionZ(MatrizModelo, rotZ);
  escalacion(MatrizModelo, zx, zy, zz);

  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  gl.activeTexture(gl.TEXTURE0);

  gl.uniform1i(uUnidadDeTextura, 0);

  /* Se vincula la textura con la unidad de textura 0 */
  gl.bindTexture(gl.TEXTURE_2D, codigoDeTextura);

  let pLuz = new Array(3);
  multiplicaMV(pLuz, MatrizVista, posicionLuz);
  gl.uniform3fv(uPosicionLuz, pLuz);


  gl.uniform3f(u_Ia, 0.2, 0.2, 0.2);
  gl.uniform3f(u_Id, 1, 1, 1);
  gl.uniform3f(u_Is, 0, 1, 1);

  /* Se envia el color del Material al shader de fragmento */
  gl.uniform3f(u_ka, 1, 0.5, 0.5);
  gl.uniform3f(u_kd, 1, 0.5, 0);
  gl.uniform3f(u_ks, 1, 0.5, 0);
  gl.uniform1f(u_brillo, brillo);

  objeto.dibuja(gl);

  requestAnimationFrame(dibuja);
}

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


const main = async () => {
  let canvas = document.getElementById("webglcanvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("WebGL 2.0 no está disponible en tu navegador");
    return;
  }
  modoRenderizado = gl.TRIANGLES;

  canvas.addEventListener("mousedown", mouseDown, false);
  canvas.addEventListener("mouseup", mouseUp, false);
  canvas.addEventListener("mousemove", mouseMove, false);
  document.addEventListener("wheel", zoom, { passive: false });
  canvas.addEventListener("contextmenu", function(e) { e.preventDefault(); }, false);
  document.getElementById("cafe").addEventListener("click", () => cambiarFigura("arbol.json", "imagenTextura"));
  document.getElementById("delfin").addEventListener("click", () => cambiarFigura("arbol_cortado.json", "imagenTextura2"));
  document.getElementById("balon").addEventListener("click", () => cambiarFigura("panhd.json", "imagenTextura3"));
  document.getElementById("tabla").addEventListener("click", () => cambiarFigura("rama.json", "imagenTextura4"));
  document.getElementById("opciones").addEventListener("change", (event) => {
    if (event.target.value === "Triangles") {
      alternarModoRenderizado("GL_TRIANGLES");
    }
    if (event.target.value === "Lines") {
      alternarModoRenderizado("GL_LINES");
    }
  });

  document.getElementById("color").addEventListener("click", cambiarColorFondo);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  compilaEnlazaLosShaders();

  let data = await loadFromJSON("arbol.json")
  objeto = new Objeto(gl, data);

  codigoDeTextura = gl.createTexture();

  leeLaTextura(gl, "imagenTextura", codigoDeTextura)

  gl.useProgram(programaID);
  uMatrizProyeccion = gl.getUniformLocation(programaID, "uMatrizProyeccion");
  uMatrizVista = gl.getUniformLocation(programaID, "uMatrizVista");
  uMatrizModelo = gl.getUniformLocation(programaID, "uMatrizModelo");
  uUnidadDeTextura = gl.getUniformLocation(programaID, "uUnidadDeTextura");
  uPosicionLuz = gl.getUniformLocation(programaID, "uPosicionLuz");
  u_Ia = gl.getUniformLocation(programaID, "u_Ia");
  u_Id = gl.getUniformLocation(programaID, "u_Id");
  u_Is = gl.getUniformLocation(programaID, "u_Is");

  u_ka = gl.getUniformLocation(programaID, "u_ka");
  u_kd = gl.getUniformLocation(programaID, "u_kd");
  u_ks = gl.getUniformLocation(programaID, "u_ks");
  u_brillo = gl.getUniformLocation(programaID, "u_brillo");

  ortho(MatrizProyeccion, -5, 5, -5, 5, -5, 5);
  gl.uniformMatrix4fv(uMatrizProyeccion, false, MatrizProyeccion);

  perspective(MatrizProyeccion, 60, gl.canvas.width / gl.canvas.height, 1, 100);

  identidad(MatrizVista);
  gl.uniformMatrix4fv(uMatrizVista, false, MatrizVista);

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.10, 0.10, 0.10, 1.0);
  dibuja()
}

main();

