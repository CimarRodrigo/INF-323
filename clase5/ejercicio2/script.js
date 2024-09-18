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
    0, 0.5,

    -0.73612, 0.31647,  // 0
    -0.5543, 0.80148,  // 1
    -0.40197, 0.31647,     // 2

    0.40712, 0.00215,  // 0
    0.62825, 0.38871,  // 1
    0.83955, 0.00215,     // 2
    //triangulo2

  ]

  let colores = [
    1, 0, 0, 1,
    0, 1, 0, 1,
    0, 0, 1, 1,

    1, 1, 0, 1,     //0
    0, 1, 0, 1,    // 1
    1, 0, 1, 1,     // 2

    1, 0, 0, 1,     //0
    0, 1, 0, 1,    // 1
    1, 1, 1, 1     // 2
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

  gl.bindVertexArray(trianguloVAO);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.drawArrays(gl.TRIANGLES, 3, 3);

  gl.drawArrays(gl.TRIANGLES, 6, 3);

  gl.bindVertexArray(null);

}

main();
