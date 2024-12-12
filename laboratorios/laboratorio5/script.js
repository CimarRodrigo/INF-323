"use strict";

import { identidad, traslacion, rotacionX, rotacionY, rotacionZ, escalacion, ortho } from "./matriz.js";
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

/* Matrices */
let MatrizProyeccion = new Array(16);
let MatrizVista = new Array(16);
let MatrizModelo = new Array(16);

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

const cambiarFigura = (urlObj) => {
  cargarModelo(urlObj);
}

const cargarModelo = (urlObj) => {
  objeto = new Objeto(gl, urlObj);
  dibuja();
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
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  identidad(MatrizModelo);

  traslacion(MatrizModelo, trasX, trasY, 0);
  rotacionY(MatrizModelo, rotY);
  rotacionX(MatrizModelo, rotX);
  rotacionZ(MatrizModelo, rotZ);
  escalacion(MatrizModelo, zx, zy, zz);

  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  objeto.dibuja(gl);

  requestAnimationFrame(dibuja);
}


const main = () => {
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
  document.getElementById("cafe").addEventListener("click", () => cambiarFigura("Modelos/coffee_cup_obj.obj"));
  document.getElementById("delfin").addEventListener("click", () => cambiarFigura("Modelos/dolphins.obj"));
  document.getElementById("balon").addEventListener("click", () => cambiarFigura("Modelos/soccerball.obj"));
  document.getElementById("tabla").addEventListener("click", () => cambiarFigura("Modelos/Wood_Table.obj"));
  document.getElementById("flor").addEventListener("click", () => cambiarFigura("Modelos/flowers.obj"));
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

  objeto = new Objeto(gl, "Modelos/dolphins.obj");

  gl.useProgram(programaID);
  uColor = gl.getUniformLocation(programaID, "uColor");
  uMatrizProyeccion = gl.getUniformLocation(programaID, "uMatrizProyeccion");
  uMatrizVista = gl.getUniformLocation(programaID, "uMatrizVista");
  uMatrizModelo = gl.getUniformLocation(programaID, "uMatrizModelo");
  ortho(MatrizProyeccion, -5, 5, -5, 5, -5, 5);
  gl.uniformMatrix4fv(uMatrizProyeccion, false, MatrizProyeccion);

  identidad(MatrizVista);
  gl.uniformMatrix4fv(uMatrizVista, false, MatrizVista);

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.10, 0.10, 0.10, 1.0);
  dibuja()
}

main();

