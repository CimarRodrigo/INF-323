import { identidad, ortho, traslacion, escalacion, rotacionZ, rotacionX } from './matriz.js';

let uMatrizProyeccion;
let uMatrizModelo;
let uMatrizVista;
let uColor;

let MatrizProyeccion = new Array(16);
let MatrizModelo = new Array(16);
let MatrizVista = new Array(16);

const canvas = document.getElementById("canvas");
let gl = canvas.getContext("webgl2");
let rectanguloVAO;


let tx = 0, ty = 0;

const rectangulo = () => {
  let vertices = [
    -1, -1,
    1, -1,
    1, 1,
    -1, 1,
  ];


  rectanguloVAO = gl.createVertexArray();
  gl.bindVertexArray(rectanguloVAO);
  let codigoVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);


}
const dibujar = () => {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //rectangulo();
  identidad(MatrizModelo);
  traslacion(MatrizModelo, tx, ty, 0);
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  // dibujar circulo 1
  gl.bindVertexArray(rectanguloVAO);

  gl.uniform4f(uColor, 1, 0, 0, 1);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  gl.bindVertexArray(null);


  //rectangulo();
  identidad(MatrizModelo);
  traslacion(MatrizModelo, 2, 2, 0);
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  gl.bindVertexArray(rectanguloVAO);
  if (intersectan(tx, ty, 2, 2)) {
    gl.uniform4f(uColor, 1, 1, 0, 1);
  } else {
    gl.uniform4f(uColor, 1, 0, 1, 1);
  }
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  gl.bindVertexArray(null);

}

const keyDown = (event) => {
  if (event.key == "ArrowRight") {
    tx += 0.1;
  }
  if (event.key == "ArrowLeft") {
    tx -= 0.1;
  }
  if (event.key == "ArrowUp") {
    ty += 0.1;
  }
  if (event.key == "ArrowDown") {
    ty -= 0.1;
  }

  dibujar();
}

const intersectan = (p1, p2, p3, p4) => {

  let x1 = p1 - 1;
  let x2 = p1 + 1;
  let x3 = p3 - 1;
  let x4 = p3 + 1;

  let y1 = p2 - 1;
  let y2 = p2 + 1;
  let y3 = p4 - 1;
  let y4 = p4 + 1;


  if (x3 < x2 && x1 < x4 && y3 < y2 && y1 < y4) {
    return true;
  }



  return false;
}


const main = () => {
  document.addEventListener("keydown", keyDown, true);
  gl.viewport(0, 0, canvas.width, canvas.height);

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

  rectangulo();

  gl.useProgram(programaID);

  uMatrizProyeccion = gl.getUniformLocation(programaID, "uMatrizProyeccion");
  uMatrizModelo = gl.getUniformLocation(programaID, "uMatrizModelo");
  uMatrizVista = gl.getUniformLocation(programaID, "uMatrizVista");
  uColor = gl.getUniformLocation(programaID, "uColor");

  identidad(MatrizProyeccion);
  ortho(MatrizProyeccion, -5, 5, -5, 5, -1, 1);
  gl.uniformMatrix4fv(uMatrizProyeccion, false, MatrizProyeccion);


  identidad(MatrizVista);
  gl.uniformMatrix4fv(uMatrizVista, false, MatrizVista);


  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  dibujar();

}

main();
