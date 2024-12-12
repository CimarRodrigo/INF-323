import { Cubo, ArcBall, Cuaternion, Piso, Rombo } from "./clases.js"
import { ortho, lookAt, identidad, perspective, traslacion, escalacion, multiplica, rotacionY, frustum } from "./funciones.js"

/* Variables globales */
let canvas;
let gl;
let cubo;
let piso;
let arcBall;
let rombo;
/* Tamaño de la ventana en pixeles */
let ancho = 800;
let alto = 500;

/* Para la ubicación de los cubos */
let GRADOS = 360 / 6;		/* Grados */

/* Variables Uniformes */
let programaID;
let uMatrizModelo;
let uMatrizVista;
let uMatrizProyeccion;

/* Matrices */
let MatrizModelo = new Array(16);
let MatrizVista = new Array(16);
let MatrizProyeccion = new Array(16);
let Matriz = new Array(16);

/* Para la interacción */
let MatrizRotacion = new Array(16);
let B = new Array(16);
let boton_izq_presionado = false;

/***************************************************************************/
/* Se crean, compilan y enlazan los programas Shader                       */
/***************************************************************************/
function compilaEnlazaLosShaders() {

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



/***************************************************************************/
/* Eventos del Ratón                                                       */
/***************************************************************************/

function mouseDown(event) {
  let posx = new Number();
  let posy = new Number();

  /* Obtiene la coordenada dentro de la área mayor */
  if (event.x != undefined && event.y != undefined) {
    posx = event.x;
    posy = event.y;
  } else {
    posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  /* Obtiene la coordenada dentro del canvas */
  posx = posx - canvas.offsetLeft;
  posy = posy - canvas.offsetTop;

  /* B = MatrizRotacion */
  B = MatrizRotacion.slice(); /* Copia */
  arcBall.primerPunto(posx, posy);

  boton_izq_presionado = true;

  return false;
};

function mouseUp(e) {
  boton_izq_presionado = false;
};

function mouseMove(event) {

  if (!boton_izq_presionado)
    return false;

  let posx = new Number();
  let posy = new Number();

  /* Obtiene la coordenada dentro de la área mayor */
  if (event.x != undefined && event.y != undefined) {
    posx = event.x;
    posy = event.y;
  } else {
    posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  /* Obtiene la coordenada dentro del canvas */
  posx = posx - canvas.offsetLeft;
  posy = posy - canvas.offsetTop;

  /* Actualiza el segundo vector y obtiene el cuaternión */
  let q = arcBall.segundoPunto(posx, posy);

  /* Convierte el cuaternión a una matriz de rotación */
  Cuaternion.rota2(MatrizRotacion, q);

  /* MatrizRotacion = MatrizRotacion * B */
  multiplica(MatrizRotacion, MatrizRotacion, B);

};

/***************************************************************************/
/* Se renderizan todos los objetos                                         */
/***************************************************************************/
function dibuja() {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  /* Define la Matriz de Proyección */
  if (document.getElementById('opcion1').checked) {
    perspective(MatrizProyeccion, 60, ancho / alto, 2, 100);
  } else if (document.getElementById('opcion2').checked) {
    frustum(MatrizProyeccion, -1.15 * ancho / alto, 1.15 * ancho / alto, -1.15, 1.15, 2, 100);
  } else if (document.getElementById('opcion3').checked) {
    ortho(MatrizProyeccion, -10 * ancho / alto, 10 * ancho / alto, -10, 10, 2, 100);
  }
  gl.uniformMatrix4fv(uMatrizProyeccion, false, MatrizProyeccion);

  /* Matriz del Modelo */
  identidad(MatrizModelo);             // M = I
  traslacion(MatrizModelo, 0, -1.5, -15);
  escalacion(MatrizModelo, 0.5, 0.5, 0.5);
  multiplica(MatrizModelo, MatrizModelo, MatrizRotacion); // M = M * MatrizRotacion
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  /* Dibuja el Piso */
  piso.dibuja(gl);

  /* Dibuja los Cubos */
  //for (let angulo = 0; angulo < 360; angulo = angulo + GRADOS) {
  //Matriz = MatrizModelo.slice(); [> Copia <]
  //rotacionY(Matriz, angulo);
  //traslacion(Matriz, 0, 0, -3);
  //rotacionY(Matriz, -angulo);
  //gl.uniformMatrix4fv(uMatrizModelo, false, Matriz);
  //cubo.dibuja(gl);
  //}
  //
  Matriz = MatrizModelo.slice(); /* Copia */
  rotacionY(Matriz, 0)
  traslacion(Matriz, 0, 0, -3);
  rotacionY(Matriz, 0);
  gl.uniformMatrix4fv(uMatrizModelo, false, Matriz);
  rombo.dibuja(gl);



  /* Solicita que el navegador llame nuevamente a dibuja */
  requestAnimationFrame(dibuja);

}

const reinicia = () => {
  /* Matriz de Rotación */
  identidad(MatrizRotacion);

  dibuja();
}

/***************************************************************************/
/* Se prepara el lienzo y se obtiene el contexto del WebGL.                */
/***************************************************************************/
const main = () => {
  canvas = document.getElementById("webglcanvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("WebGL 2.0 no está disponible en tu navegador");
    return;
  }
  canvas.addEventListener("mousedown", mouseDown, false);
  canvas.addEventListener("mouseup", mouseUp, false);
  canvas.addEventListener("mouseout", mouseUp, false);
  canvas.addEventListener("mousemove", mouseMove, false);
  document.getElementById("reset").onclick = reinicia;
  document.getElementById("opciones").onchange = dibuja;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  compilaEnlazaLosShaders();

  /* Objetos */
  cubo = new Cubo(gl);
  piso = new Piso(gl, 0, 0, 0);
  arcBall = new ArcBall(ancho, alto);
  rombo = new Rombo(gl);

  gl.useProgram(programaID);
  uMatrizProyeccion = gl.getUniformLocation(programaID, "uMatrizProyeccion");
  uMatrizVista = gl.getUniformLocation(programaID, "uMatrizVista");
  uMatrizModelo = gl.getUniformLocation(programaID, "uMatrizModelo");
  ortho(MatrizProyeccion, -5, 5, -5, 5, -5, 5);
  gl.uniformMatrix4fv(uMatrizProyeccion, false, MatrizProyeccion);
  lookAt(MatrizVista, 0, 0, 0, 0, 0, -1, 0, 1, 0);
  gl.uniformMatrix4fv(uMatrizVista, false, MatrizVista);
  identidad(MatrizRotacion);
  arcBall.ajusta(gl.canvas.width, gl.canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(176 / 255, 196 / 255, 222 / 256, 1);
  dibuja();
}

main();
