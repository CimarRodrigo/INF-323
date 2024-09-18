import { identidad, ortho } from './matriz.js';
//import { mouseDown } from './funciones.js';

const canvas = document.getElementById("canvas");
let gl = canvas.getContext("webgl2");

let uMatrizProyeccion;
let uMatrizModelo;
let uMatrizVista;

let MatrizProyeccion = new Array(16);
let MatrizModelo = new Array(16);
let MatrizVista = new Array(16);
let uColor;
let sw = 0;

let vertices = [
  //trueangulo 1
  -1, -1,
  1, -1,
  1, 1,
  -1, 1
]

let colores = []

const cambiarAVerde = () => {
  colores = [
    117 / 255,
    251 / 255,
    76 / 255,
    1
  ]
}

const cambiarANaranja = () => {
  colores = [
    239 / 255, 135 / 255, 51 / 255, 1,
  ]
}

const estaDentro = (posX, posY, x, y, ancho, alto) => {
  if (posX > x && posX < x + ancho && posY > y && posY < y + alto) {
    return true;
  }
  return false;
}

const mouseDown = (event) => {
  let x = event.clientX;
  let y = event.clientY;
  x = x - canvas.offsetLeft;
  y = y - canvas.offsetTop;
  // transoforma a coordenadas de webgl2
  x = x * 20 / canvas.clientWidth - 10;
  y = (1 - y / canvas.clientHeight) * 20 - 10;

  if (estaDentro(x, y, -1, -1, 2, 2)) {
    alert("Dentro del cuadrado");
    main();
  }
}

const main = () => {

  gl.viewport(0, 0, canvas.width, canvas.height);
  canvas.addEventListener("mousedown", mouseDown, false);

  let shaderVertice = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shaderVertice, document.getElementById("vs").text.trim());
  gl.compileShader(shaderVertice);


  let shaderFragmento = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shaderFragmento, document.getElementById("fs").text.trim());
  gl.compileShader(shaderFragmento);


  let programaID = gl.createProgram();
  gl.attachShader(programaID, shaderVertice);
  gl.attachShader(programaID, shaderFragmento);
  gl.linkProgram(programaID);

  gl.useProgram(programaID);

  uMatrizProyeccion = gl.getUniformLocation(programaID, "uMatrizProyeccion");
  uMatrizModelo = gl.getUniformLocation(programaID, "uMatrizModelo");
  uMatrizVista = gl.getUniformLocation(programaID, "uMatrizVista");

  identidad(MatrizProyeccion);
  ortho(MatrizProyeccion, -10, 10, -10, 10, -1, 1);
  gl.uniformMatrix4fv(uMatrizProyeccion, false, MatrizProyeccion);



  identidad(MatrizVista);
  gl.uniformMatrix4fv(uMatrizVista, false, MatrizVista);

  let trianguloVAO = gl.createVertexArray();
  gl.bindVertexArray(trianguloVAO);

  let codigoVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);


  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);


  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindVertexArray(trianguloVAO);

  uColor = gl.getUniformLocation(programaID, "uColor");

  // Dibujar
  //identidad(MatrizModelo);
  //gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);
  //gl.uniform4f(uColor, colores[0], colores[1], colores[2], colores[3]);
  //gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  if (sw === 0) {
    cambiarANaranja();
    identidad(MatrizModelo);
    gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);
    gl.uniform4f(uColor, colores[0], colores[1], colores[2], colores[3]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    sw = 1;
  }
  else {
    cambiarAVerde();
    identidad(MatrizModelo);
    gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);
    gl.uniform4f(uColor, colores[0], colores[1], colores[2], colores[3]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    sw = 0;
  }


  gl.bindVertexArray(null);

}

main();
