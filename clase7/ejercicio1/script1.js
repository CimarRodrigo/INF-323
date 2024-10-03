import { identidad, ortho, traslacion } from './matriz.js';


const canvas = document.getElementById("canvas");

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
  //x = (x - canvas.width / 2) / (canvas.width / 2);
  //y = (canvas.height / 2 - y) / (canvas.height / 2);
  x = x * 20 / canvas.clientWidth - 10;
  y = (1 - y / canvas.clientHeight) * 20 - 10;

  alert(`x: ${x}, y: ${y}`);
  //if (estaDentro(x, y, -1, -1, 2, 2)) {
  //alert("Dentro del cuadrado");
  //}
}

const main = () => {
  let uMatrizProyeccion;
  let uMatrizModelo;
  let uMatrizVista;

  let MatrizProyeccion = new Array(16);
  let MatrizModelo = new Array(16);
  let MatrizVista = new Array(16);

  let gl = canvas.getContext("webgl2");
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

  let vertices = [
    //trueangulo 1
    -1, -1,
    2, -1,
    1, 1,
    -1, 1
  ]

  let colores = [
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,
  ]

  let trianguloVAO = gl.createVertexArray();
  gl.bindVertexArray(trianguloVAO);

  let codigoVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  let codigoColores = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, codigoColores);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colores), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);


  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);


  // Dibujar
  identidad(MatrizModelo);
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  gl.bindVertexArray(trianguloVAO);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);



  gl.bindVertexArray(null);

}

main();
