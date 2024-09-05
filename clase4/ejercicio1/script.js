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

  let vertices = [
    //trueangulo 1
    -0.5, -0.5,
    0.5, -0.5,
    -0.5, 0.5,
    //
    0.5, -0.5,
    0.5, 0.5,
    -0.5, 0.5,
  ]

  let trianguloVAO = gl.createVertexArray();
  gl.bindVertexArray(trianguloVAO);

  let codigoVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  let uColor = gl.getUniformLocation(programaID, "uColor");

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindVertexArray(trianguloVAO);

  gl.uniform4f(uColor, 1, 0, 0, 1);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.uniform4f(uColor, 0, 1, 0, 1);
  gl.drawArrays(gl.TRIANGLES, 3, 3);

  //gl.uniform4f(uColor, 0, 0, 1, 1);
  //gl.drawArrays(gl.LINES, 4, 2);


  gl.bindVertexArray(null);

}

main();
