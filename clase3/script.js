const main = () => {
  const canvas = document.getElementById("canvas");
  let gl = canvas.getContext("webgl2");
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

  //let vertices = [
  //-0.5, -0.5,
  //0.5, -0.5,
  //0.5, -0.5,
  //0, 0.5,
  //0, 0.5,
  //-0.5, -0.5,
  //]


  let vertices = new Float32Array(200);
  // linea 1
  let a = Math.random() * 2 - 1;
  vertices[0] = a;

  a = Math.random() * 2 - 1;
  vertices[1] = a;

  a = Math.random() * 2 - 1;
  vertices[2] = a;

  a = Math.random() * 2 - 1;
  vertices[3] = a;
  // linea 2

  a = Math.random() * 2 - 1;
  vertices[4] = a;

  a = Math.random() * 2 - 1;
  vertices[5] = a;

  a = Math.random() * 2 - 1;
  vertices[6] = a;

  a = Math.random() * 2 - 1;
  vertices[7] = a;


  let lineasVAO = gl.createVertexArray();
  gl.bindVertexArray(lineasVAO);

  let codigoVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);
  //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  let uColor = gl.getUniformLocation(programaID, "uColor");

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindVertexArray(lineasVAO);

  let r = Math.random();
  let g = Math.random();
  let b = Math.random();

  gl.uniform4f(uColor, r, g, b, 1);
  gl.drawArrays(gl.LINES, 0, 2);

  r = Math.random();
  g = Math.random();
  b = Math.random();

  gl.uniform4f(uColor, r, g, b, 1);
  gl.drawArrays(gl.LINES, 2, 2);

  gl.bindVertexArray(null);

}

main();
