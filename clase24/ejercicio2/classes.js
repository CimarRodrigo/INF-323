
export class Cubo {

  /**
   *       vertices            coord_textura
   *   x1,y2      x2,y2      u1,v2       u2,v2
   *      ----------            ---------- 
   *     |        / |          |        / | 
   *     |      /   |          |      /   | 
   *     |    /     |          |    /     |
   *     | /        |          | /        |
   *      ----------            ---------- 
   *   x1,y1      x2,y1      u1,v1       u2,v1
   */
  constructor(gl) {

    /* Las coordenadas cartesianas (x, y, z) */
    let vertices = [
      // Frente
      -1, -1, 1, // 4   0
      1, -1, 1, // 5   1
      1, 1, 1, // 6   2
      -1, 1, 1, // 7   3
      // Atrás
      -1, 1, -1, // 3   4
      1, 1, -1, // 2   5
      1, -1, -1, // 1   6
      -1, -1, -1, // 0   7
      // Izquierda
      -1, -1, -1, // 0   8
      -1, -1, 1, // 4   9
      -1, 1, 1, // 7  10
      -1, 1, -1, // 3  11
      // Derecha
      1, -1, 1, // 5  12
      1, -1, -1, // 1  13
      1, 1, -1, // 2  14
      1, 1, 1, // 6  15
      // Abajo
      -1, -1, -1, // 0  16
      1, -1, -1, // 1  17
      1, -1, 1, // 5  18
      -1, -1, 1, // 4  19
      // Arriba
      -1, 1, 1, // 7  20
      1, 1, 1, // 6  21
      1, 1, -1, // 2  22
      -1, 1, -1  // 3  23
    ];

    /* Coordenadas de textura (u, v) */
    let coord_textura = [
      // Frente
      1 / 2, 1 / 2, // 0
      3 / 4, 1 / 2, // 1
      3 / 4, 3 / 4, // 2
      1 / 2, 3 / 4, // 3
      // Atrás
      1 / 2, 0,   // 4
      3 / 4, 0,   // 5
      3 / 4, 1 / 4, // 6
      1 / 2, 1 / 4, // 7
      // Izquierda
      1 / 4, 1 / 2, // 8
      1 / 2, 1 / 2, // 9
      1 / 2, 3 / 4, // 10
      1 / 4, 3 / 4, // 11
      // Derecha
      3 / 4, 1 / 2, // 12
      1, 1 / 2,   // 12
      1, 3 / 4,   // 14
      3 / 4, 3 / 4, // 15
      // Abajo
      1 / 2, 1 / 4, // 16
      3 / 4, 1 / 4, // 17
      3 / 4, 1 / 2, // 18
      1 / 2, 1 / 2, // 19
      // Arriba
      1 / 2, 3 / 4, // 20
      3 / 4, 3 / 4, // 21
      3 / 4, 1,   // 22
      1 / 2, 1    // 23
    ];

    /* Indices */
    let indices = [
      0, 1, 2, 0, 2, 3, // Frente
      4, 5, 6, 4, 6, 7, // Atrás
      8, 9, 10, 8, 10, 11, // Izquierda
      12, 13, 14, 12, 14, 15, // Derecha
      16, 17, 18, 16, 18, 19, // Abajo
      20, 21, 22, 20, 22, 23  // Arriba
    ];

    /* Se crea el objeto del arreglo de vértices (VAO) */
    this.cuboVAO = gl.createVertexArray();

    /* Se activa el objeto */
    gl.bindVertexArray(this.cuboVAO);


    /* Se genera un nombre (código) para el buffer */
    let codigoVertices = gl.createBuffer();

    /* Se asigna un nombre (código) al buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);

    /* Se transfiere los datos desde la memoria nativa al buffer de la GPU */
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    /* Se habilita el arreglo de los vértices (indice = 0) */
    gl.enableVertexAttribArray(0);

    /* Se especifica los atributos del arreglo de vértices */
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);


    /* Se genera un nombre (código) para el buffer */
    let codigoCoordenadasDeTextura = gl.createBuffer();

    /* Se asigna un nombre (código) al buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoCoordenadasDeTextura);

    /* Se transfiere los datos desde la memoria nativa al buffer de la GPU */
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coord_textura), gl.STATIC_DRAW);

    /* Se habilita el arreglo de las coordenadas de textura (indice = 1) */
    gl.enableVertexAttribArray(1);

    /* Se especifica el arreglo de las coordenadas de textura */
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);


    /* Se genera un nombre (código) para el buffer */
    let codigoDeIndices = gl.createBuffer();

    /* Se asigna un nombre (código) al buffer */
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, codigoDeIndices);

    /* Se transfiere los datos desde la memoria nativa al buffer de la GPU */
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


    /* Se desactiva el objeto del arreglo de vértices */
    gl.bindVertexArray(null);

    /* Se deja de asignar un nombre (código) al buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    /* Se deja de asignar un nombre (código) al buffer */
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  }

  muestra(gl) {

    /* Se activa el objeto del arreglo de vértices */
    gl.bindVertexArray(this.cuboVAO);

    /* Renderiza las primitivas desde los datos de los arreglos (vértices,
     * coordenadas de textura e indices) */
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    /* Se desactiva el objeto del arreglo de vértices */
    gl.bindVertexArray(null);
  }

}

export class Esfera {

  /* segmentosH = slices o longitud, segmentosV = stacks o latitud  */
  constructor(gl, radio, segmentosH, segmentosV) {

    let cantidadDeVertices = (segmentosH + 1) * (segmentosV + 1);
    this.cantidadDeIndices = segmentosH * segmentosV * 6 * 2; // 6 vert (c/cuadrado)

    let i, j, k, x, y, z, theta_, phi_, k1, k2, u, v, iCT;

    /* Las coordenadas cartesianas (x, y, z) */
    let vertices = new Float32Array(cantidadDeVertices * 3);

    /* Coordenadas de textura (u, v) */
    let coord_textura = new Float32Array(cantidadDeVertices * 2);

    /* Indices */
    let indices = new Uint16Array(this.cantidadDeIndices);

    /* Considere a las Coordenadas Esféricas para los siguientes cálculos */

    /* Se leen los vertices y las normales */
    k = 0, iCT = 0;
    let theta = 2 * Math.PI / segmentosH; // 1 vuelta    360/segmentosH
    let phi = Math.PI / segmentosV;       // 1/2 vuelta  180/segmentosV

    // latitud
    for (i = 0; i <= segmentosV; i++) {
      phi_ = i * phi - Math.PI / 2; // -90..90 grados

      // longitud
      for (j = 0; j <= segmentosH; j++) {
        theta_ = j * theta; // 0..360 grados
        x = radio * Math.cos(theta_) * Math.cos(phi_);
        y = radio * Math.sin(theta_) * Math.cos(phi_);
        z = radio * Math.sin(phi_);

        vertices[k++] = x;
        vertices[k++] = y;
        vertices[k++] = z;

        u = j / segmentosH;
        v = i / segmentosV;
        coord_textura[iCT++] = u;
        coord_textura[iCT++] = v;
      }
    }

    /* Se leen los indices */

    /**
     *    k2 ------- k2+1
     *     |      /  | 
     *     |    /    |
     *     | /       |
     *    k1 ------- k1+1  
     *    k1---k2+1---k2   k1---k1+1---k2+1
     */
    k = 0;
    for (i = 0; i < segmentosV; i++) {
      k1 = i * (segmentosH + 1);      // inicio del actual segmentoV
      k2 = k1 + segmentosH + 1;       // inicio del siguiente segmentoV
      for (j = 0; j < segmentosH; j++) {
        indices[k++] = k1 + j;        // k1---k2+1---k2
        indices[k++] = k2 + j + 1;
        indices[k++] = k2 + j;

        indices[k++] = k1 + j;        // k1---k1+1---k2+1
        indices[k++] = k1 + j + 1;
        indices[k++] = k2 + j + 1;
      }
    }

    this.esferaVAO = gl.createVertexArray();
    gl.bindVertexArray(this.esferaVAO);

    var codigoVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    var codigoCoordenadasDeTextura = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoCoordenadasDeTextura);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coord_textura), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    var codigoDeIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, codigoDeIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  muestra(gl) {
    gl.bindVertexArray(this.esferaVAO);
    gl.drawElements(gl.TRIANGLES, this.cantidadDeIndices, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }
}
