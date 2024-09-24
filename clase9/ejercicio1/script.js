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
let trianguloVAO;

const dibujar = () => {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  identidad(MatrizModelo);
  //traslacion(MatrizModelo, 2, 1, 0);
  //escalacion(MatrizModelo, 3, 1, 0);
  rotacionX(MatrizModelo, 80);
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);


  gl.bindVertexArray(trianguloVAO);

  gl.uniform4f(uColor, 1, 0, 0, 1);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindVertexArray(null);
}

const main = () => {
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

  let vertices = [
    -1, -1,
    1, -1,
    0, 1,
  ]

  trianguloVAO = gl.createVertexArray();
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

  identidad(MatrizModelo);
  traslacion(MatrizModelo, 1, 1, 0);
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);




  dibujar();

}

main();
