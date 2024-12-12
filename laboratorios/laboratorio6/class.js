import { modoRenderizado } from './script.js';



export class Objeto {

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
  constructor(gl, res) {

    /* Las coordenadas cartesianas (x, y, z) */
    this.vertices = res.vertices;
    //this.vertices = [ // Frente
    //-1, -1, 1, // 4   0
    //1, -1, 1, // 5   1
    //1, 1, 1, // 6   2
    //-1, 1, 1, // 7   3
    //// Atrás
    //-1, 1, -1, // 3   4
    //1, 1, -1, // 2   5
    //1, -1, -1, // 1   6 -1, -1, -1, // 0   7
    //// Izquierda
    //-1, -1, -1, // 0   8
    //-1, -1, 1, // 4   9
    //-1, 1, 1, // 7  10
    //-1, 1, -1, // 3  11
    //// Derecha
    //1, -1, 1, // 5  12
    //1, -1, -1, // 1  13
    //1, 1, -1, // 2  14
    //1, 1, 1, // 6  15
    //// Abajo
    //-1, -1, -1, // 0  16
    //1, -1, -1, // 1  17
    //1, -1, 1, // 5  18
    //-1, -1, 1, // 4  19
    //// Arriba
    //-1, 1, 1, // 7  20
    //1, 1, 1, // 6  21
    //1, 1, -1, // 2  22
    //-1, 1, -1  // 3  23
    //];

    /* Coordenadas de textura (u, v) */
    this.coord_textura = res.coord_textura;
    /*this.coord_textura = [*/
    /*// Frente*/
    /*1 / 2, 1 / 2, // 0*/
    /*3 / 4, 1 / 2, // 1*/
    /*3 / 4, 3 / 4, // 2*/
    /*1 / 2, 3 / 4, // 3*/
    /*// Atrás*/
    /*1 / 2, 0,   // 4*/
    /*3 / 4, 0,   // 5*/
    /*3 / 4, 1 / 4, // 6*/
    /*1 / 2, 1 / 4, // 7*/
    /*// Izquierda*/
    /*1 / 4, 1 / 2, // 8*/
    /*1 / 2, 1 / 2, // 9*/
    /*1 / 2, 3 / 4, // 10*/
    /*1 / 4, 3 / 4, // 11*/
    /*// Derecha*/
    /*3 / 4, 1 / 2, // 12*/
    /*1, 1 / 2,   // 12*/
    /*1, 3 / 4,   // 14*/
    /*3 / 4, 3 / 4, // 15*/
    /*// Abajo*/
    /*1 / 2, 1 / 4, // 16*/
    /*3 / 4, 1 / 4, // 17*/
    /*3 / 4, 1 / 2, // 18*/
    /*1 / 2, 1 / 2, // 19*/
    /*// Arriba*/
    /*1 / 2, 3 / 4, // 20*/
    /*3 / 4, 3 / 4, // 21*/
    /*3 / 4, 1,   // 22*/
    /*1 / 2, 1    // 23*/
    /*];*/

    /* Indices */
    this.indices = res.indices;
    /*this.indices = [*/
    /*0, 1, 2, 0, 2, 3, // Frente*/
    /*4, 5, 6, 4, 6, 7, // Atrás*/
    /*8, 9, 10, 8, 10, 11, // Izquierda*/
    /*12, 13, 14, 12, 14, 15, // Derecha*/
    /*16, 17, 18, 16, 18, 19, // Abajo*/
    /*20, 21, 22, 20, 22, 23  // Arriba*/
    /*];*/



    /* Se crea el objeto del arreglo de vértices (VAO) */
    this.cuboVAO = gl.createVertexArray();

    /* Se activa el objeto */
    gl.bindVertexArray(this.cuboVAO);


    /* Se genera un nombre (código) para el buffer */
    let codigoVertices = gl.createBuffer();

    /* Se asigna un nombre (código) al buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);

    /* Se transfiere los datos desde la memoria nativa al buffer de la GPU */
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    /* Se habilita el arreglo de los vértices (indice = 0) */
    gl.enableVertexAttribArray(0);

    /* Se especifica los atributos del arreglo de vértices */
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);


    /* Se genera un nombre (código) para el buffer */
    let codigoCoordenadasDeTextura = gl.createBuffer();

    /* Se asigna un nombre (código) al buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoCoordenadasDeTextura);

    /* Se transfiere los datos desde la memoria nativa al buffer de la GPU */
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.coord_textura), gl.STATIC_DRAW);

    /* Se habilita el arreglo de las coordenadas de textura (indice = 1) */
    gl.enableVertexAttribArray(1);

    /* Se especifica el arreglo de las coordenadas de textura */
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);


    /* Se genera un nombre (código) para el buffer */
    let codigoDeIndices = gl.createBuffer();

    /* Se asigna un nombre (código) al buffer */
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, codigoDeIndices);

    /* Se transfiere los datos desde la memoria nativa al buffer de la GPU */
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);


    /* Se desactiva el objeto del arreglo de vértices */
    gl.bindVertexArray(null);

    /* Se deja de asignar un nombre (código) al buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    /* Se deja de asignar un nombre (código) al buffer */
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


  }

  dibuja(gl) {

    /* Se activa el objeto del arreglo de vértices */
    gl.bindVertexArray(this.cuboVAO);

    /* Renderiza las primitivas desde los datos de los arreglos (vértices,
     * coordenadas de textura e indices) */
    gl.drawElements(modoRenderizado, this.indices.length, gl.UNSIGNED_SHORT, 0);

    /* Se desactiva el objeto del arreglo de vértices */
    gl.bindVertexArray(null);
  }


}
