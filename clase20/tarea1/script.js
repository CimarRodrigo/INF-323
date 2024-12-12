import { identidad, traslacion, ortho, multiplica } from './matriz.js';

let canvas;
let programaID;
let gl;
let cubo;
let arcBall;

/* Variables Uniformes */
let uMatrizProyeccion;
let uMatrizVista;
let uMatrizModelo;

/* Matrices */
let MatrizProyeccion = new Array(16);
let MatrizVista = new Array(16);
let MatrizModelo = new Array(16);

/* Para la interacción */
let MatrizRotacion = new Array(16);
let MatrizRotacion1 = new Array(16);
let MatrizRotacion2 = new Array(16);
let MatrizRotacion3 = new Array(16);
let Matriz = new Array(16);
let boton_izq_presionado = false;

/***************************************************************************/
/* Se crean, compilan y enlazan los programas Shader                       */
/***************************************************************************/
const compilaEnlazaLosShaders = () => {

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
/* La Clase Vector3                                                        */
/***************************************************************************/

class Vector3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   *                   u = Suma de vectores
   *  u = v1 + v2     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   *                   u = (v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
   */
  mas(v2) {
    return (new Vector3(this.x + v2.x, this.y + v2.y, this.z + v2.z));
  }

  /**
   *                   u = Resta de vectores
   *  u = v1 - v2     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   *                   u = (v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
   */
  menos(v2) {
    return (new Vector3(this.x - v2.x, this.y - v2.y, this.z - v2.z));
  }

  /**
   *                      u x v = Producto vectorial o producto cruz
   * u = (u.x, u.y, u.z) ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * v = (v.x, v.y, v.z)  u x v = (u.y * v.z - u.z * v.y,   
   *                               u.z * v.x - u.x * v.z,
   *                               u.x * v.y - u.y * v.x)                  
   */
  producto_vectorial(v2) {
    let r = new Vector3();
    r.x = (this.y * v2.z) - (this.z * v2.y);
    r.y = (this.z * v2.x) - (this.x * v2.z);
    r.z = (this.x * v2.y) - (this.y * v2.x);
    return r;
  }

  /**
   *                      u . v = Producto escalar o producto punto
   * u = (u.x, u.y, u.z) ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * v = (v.x, v.y, v.z)  u . v = u.x v.x + u.y v.y + u.z v.z
   *                                          
   */
  producto_escalar(v2) {
    return (this.x * v2.x) + (this.y * v2.y) + (this.z * v2.z);
  }

  /**
   *                     |v| = Longitud de un vector o magnitud
   * v = (x, y, z)    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   *                     |v| = raiz_cuadrada (x^2 + y^2 + z^2) 
   *                                          
   */
  longitud() {
    return (Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z));
  }

  /**
   *        v            u = Vector unitario o de longitud 1
   *  u  = ---        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   *       |v|           u = Vector normalizado
   *                     
   */
  normaliza() {
    let l = this.longitud();
    if (l > 0) {
      this.x = this.x / l;
      this.y = this.y / l;
      this.z = this.z / l;
    }
  }
  /**
   *    3
   *     ^
   *     |
   *   v |
   *     |
   *    1 -------- > 2
   */
  normal(v1, v2, v3) {
    let u = new Vector3(); // vector u
    let v = new Vector3(); // vector v
    let n = new Vector3(); // vector n

    /* Calcula los vectores u y v */
    u = v2.menos(v1);
    v = v3.menos(v1);

    /* n = u x v */
    n = u.producto_vectorial(v);

    /* Normaliza */
    n.normaliza();

    return n;
  }

  toString() {
    return "Vector3 [x=" + this.x + ", y=" + this.y + ", z=" + this.z + "]";
  }
}

/***************************************************************************/
/* ArcBall: Obtiene los vectores U y V de la esfera (x^2 + y^2 + z^2 = 1). */
/***************************************************************************/

class Punto2f {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class ArcBall {
  constructor(w, h) {
    this.Epsilon = 1.0e-5;
    this.U = new Vector3();
    this.V = new Vector3();
    this.ajusta(w, h);
  }

  /* Ajusta el ancho y alto de la ventana */
  ajusta(w, h) {
    if (!((w > 1.0) && (h > 1.0)))
      document.write("ERROR");

    /* Ajusta el factor para el ancho y alto (2 = [-1..1]) */
    this.ajustaAncho = 2.0 / (w - 1.0);
    this.ajustaAlto = 2.0 / (h - 1.0);
  }

  /* Obtiene el vector dado un punto (x,y) */
  obtieneVector(vector, x, y) {
    /* Copia punto */
    let temp = new Punto2f(x, y);

    /* Ajusta las coordenadas del punto al rango [-1..1] */
    temp.x = (temp.x * this.ajustaAncho) - 1.0;
    temp.y = 1.0 - (temp.y * this.ajustaAlto);

    /* Calcula el cuadrado de la longitud del vector */
    let longitud2 = (temp.x * temp.x) + (temp.y * temp.y);

    /* 
     * Considerando que: radio^2 = x^2 + y^2 + z^2
     * ¿Cuales son los valores de x, y y z?
     * 
     * Si el punto está fuera de la esfera... (longitud2 > 1)
     */

    if (longitud2 > 1.0) {
      /* Calcula un factor de normalización (radio / sqrt(longitud2)) */
      let norma = (1.0 / Math.sqrt(longitud2));

      /* Retorna el vector "normalizado", un punto sobre la esfera */
      vector.x = temp.x * norma;
      vector.y = temp.y * norma;
      vector.z = 0.0;
    } else { /* e.o.c. está dentro */
      /*
       * Retorna un vector, un punto dentro la esfera 
       * z = sqrt(radio^cuadrado - (x^2 + y^2))
       */
      vector.x = temp.x;
      vector.y = temp.y;
      vector.z = Math.sqrt(1.0 - longitud2);
    }
  }

  /* Obtiene el vector U */
  primerPunto(x, y) {
    this.obtieneVector(this.U, x, y);
  }

  /* Obtiene el Cuaternion de U y V */
  segundoPunto(x, y) {

    let q = new Cuaternion();

    /* Obtiene el vector V */
    this.obtieneVector(this.V, x, y);

    /* Retorna el cuaternión equivalente a la rotación. */
    if (q != null) {

      /* Calcula la Normal = U x V */
      let Normal = this.U.producto_vectorial(this.V);

      /* Calcula la longitud de la normal */
      if (Normal.longitud() > this.Epsilon) { /* si no es cero */
        q.x = Normal.x;
        q.y = Normal.y;
        q.z = Normal.z;
        /* w  = (theta / 2), donde theta es el ángulo de rotación */
        q.w = this.U.producto_escalar(this.V);
      } else { /* si es cero */
        /* U y V coinciden */
        q.x = q.y = q.z = q.w = 0.0;
      }
    }
    return q;
  }
}

/***************************************************************************/
/* Cuaternion: Realiza las operaciones de los cuaterniones.                */
/***************************************************************************/

class Cuaternion {

  /**
   * Construye un nuevo Cuaternion.
   */
  constructor(w, x, y, z) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  inicializa(w, v) {
    this.w = w;
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }

  // norma^2 = w^2 + x^2 + y^2 + z^2
  norma2() {
    return (this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
  }

  // Conjugado
  conjugado() {
    x = -this.x;
    y = -this.y;
    z = -this.z;
    return this;
  }

  // Cuaternion q = Cuaternion a . Cuaternion b
  multiplica(a, b) {
    let q = new Cuaternion(0, 0, 0, 0);
    q.w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;
    q.x = a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y;
    q.y = a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x;
    q.z = a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w;
    return q;
  }

  // Cuaternion q = Cuaternion a . b
  multiplica_escalar(a, b) {
    let q = new Cuaternion(0, 0, 0, 0);
    q.w = a.w * b;
    q.x = a.x * b;
    q.y = a.y * b;
    q.z = a.z * b;
    return q;
  }

  // q' = q . p . q^(-1)
  rota(q, p) {   // q es Cuaternion y p es Vector3
    let p_homogeneo = new Cuaternion(0, 0, 0, 0);
    p_homogeneo.inicializa(0, p);
    let p_prima = this.multiplica(q, this.multiplica(p_homogeneo, q.inverso()));
    return (new Vector3(p_prima.x, p_prima.y, p_prima.z));
  }

  // q' = q . p . q*
  rota1(q, p) {  // q es Cuaternion y p es Vector3
    let p_homogeneo = new Cuaternion(0, 0, 0, 0);
    p_homogeneo.inicializa(0, p);
    let p_prima = this.multiplica(q, this.multiplica(p_homogeneo, q.conjugado()));
    return (new Vector3(p_prima.x, p_prima.y, p_prima.z));
  }

  // q = q^(-1)
  inverso() {
    let q = new Cuaternion(0, 0, 0, 0);
    // normal^2 = a . b
    let n = this.norma2();
    if (n <= 1e-8)
      document.write("INVERSO: Error");
    q = multiplica_escalar(new Cuaternion(this.w, -this.x, -this.y, -this.z), 1 / n);
    return q;
  }

  /* Convierte el cuaternión a una matriz de rotación */
  static rota2(a, q) {
    let d, s;
    d = (q.x * q.x) + (q.y * q.y) + (q.z * q.z) + (q.w * q.w);
    s = (d > 0.0) ? (2.0 / d) : 0.0;
    a[0] = 1.0 - (q.y * q.y + q.z * q.z) * s; a[4] = (q.x * q.y - q.w * q.z) * s; a[8] = (q.x * q.z + q.w * q.y) * s; a[12] = 0;
    a[1] = (q.x * q.y + q.w * q.z) * s; a[5] = 1.0 - (q.x * q.x + q.z * q.z) * s; a[9] = (q.y * q.z - q.w * q.x) * s; a[13] = 0;
    a[2] = (q.x * q.z - q.w * q.y) * s; a[6] = (q.y * q.z + q.w * q.x) * s; a[10] = 1.0 - (q.x * q.x + q.y * q.y) * s; a[14] = 0;
    a[3] = 0; a[7] = 0; a[11] = 0; a[15] = 1;
  }

  toString() {
    return "Cuaternion [w=" + this.w + ", x=" + this.x + ", y=" + this.y + ", z=" + this.z + "]";
  }
}

/***********************************************************************************/
/* Se define la geometría y se almacenan en los buffers de memoria y se renderiza. */
/***********************************************************************************/
class Cubo {
  constructor(gl) {

    /**
     *       3 --------- 2
     *       /|        /|   
     *      / |       / |
     *    7 --------- 6 |
     *     |  |      |  |
     *     | 0 ------|-- 1 
     *     | /       | /
     *     |/        |/
     *    4 --------- 5  
     */

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

    /* Los colores x c/vértice (r,g,b,a) */
    let colores = [
      // Frente - lila
      1, 0, 1, 1, // 4   0
      1, 0, 1, 1, // 5   1
      1, 0, 1, 1, // 6   2
      1, 0, 1, 1, // 7   3	
      // Atrás - amarillo
      1, 1, 0, 1, // 3   4	
      1, 1, 0, 1, // 2   5
      1, 1, 0, 1, // 1   6	
      1, 1, 0, 1, // 0   7	
      // Izquierda - celeste
      0, 1, 1, 1, // 0   8
      0, 1, 1, 1, // 4   9
      0, 1, 1, 1, // 7  10
      0, 1, 1, 1, // 3  11
      // Derecha - rojo
      1, 0, 0, 1, // 5  12
      1, 0, 0, 1, // 1  13
      1, 0, 0, 1, // 2  14
      1, 0, 0, 1, // 6  15
      // Abajo - azul
      0, 0, 1, 1, // 0  16
      0, 0, 1, 1, // 1  17
      0, 0, 1, 1, // 5  18
      0, 0, 1, 1, // 4  19
      // Arriba - verde
      0, 1, 0, 1, // 7  20
      0, 1, 0, 1, // 6  21
      0, 1, 0, 1, // 2  22
      0, 1, 0, 1  // 3  23
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

    this.cuboVAO = gl.createVertexArray();
    gl.bindVertexArray(this.cuboVAO);

    let codigoVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    let codigoColores = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, codigoColores);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colores), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);

    let codigoDeIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, codigoDeIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  dibuja(gl) {
    gl.bindVertexArray(this.cuboVAO);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }
}

/***************************************************************************/
/* Eventos del Ratón                                                       */
/***************************************************************************/

const mouseDown = (event) => {
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

  /* Matriz = MatrizRotacion */
  if (0 < posx && posx < 250 && 0 < posy && posy < 250) {
    Matriz = MatrizRotacion.slice();
  } else if (250 <= posx && posx < 500 && 0 < posy && posy < 250) {
    Matriz = MatrizRotacion1.slice();
  } else if (0 < posx && posx < 250 && 250 <= posy && posy < 500) {
    Matriz = MatrizRotacion2.slice();
  } else if (250 <= posx && posx < 500 && 250 <= posy && posy < 500) {
    Matriz = MatrizRotacion3.slice();
  }


  arcBall.primerPunto(posx, posy);

  boton_izq_presionado = true;

  return false;
};

const mouseUp = (e) => {
  boton_izq_presionado = false;
};

const mouseMove = (event) => {
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

  if (0 < posx && posx < 250 && 0 < posy && posy < 250) {

    Cuaternion.rota2(MatrizRotacion, q);


    multiplica(MatrizRotacion, MatrizRotacion, Matriz);
  } else if (250 <= posx && posx < 500 && 0 < posy && posy < 250) {
    /* Convierte el cuaternión a una matriz de rotación */
    Cuaternion.rota2(MatrizRotacion1, q);


    multiplica(MatrizRotacion1, MatrizRotacion1, Matriz);
  } else if (0 < posx && posx < 250 && 250 <= posy && posy < 500) {

    Cuaternion.rota2(MatrizRotacion2, q);


    multiplica(MatrizRotacion2, MatrizRotacion2, Matriz);
  } else if (250 <= posx && posx < 500 && 250 <= posy && posy < 500) {

    Cuaternion.rota2(MatrizRotacion3, q);

  };
}
const dibuja = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  /* Matriz del Modelo */
  identidad(MatrizModelo);             // M = I
  traslacion(MatrizModelo, -2.5, 2.5, 0);
  multiplica(MatrizModelo, MatrizModelo, MatrizRotacion); // M = M * MatrizRotacion
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  cubo.dibuja(gl);

  /* Matriz del Modelo */
  identidad(MatrizModelo);             // M = I
  traslacion(MatrizModelo, 2.5, 2.5, 0);
  multiplica(MatrizModelo, MatrizModelo, MatrizRotacion1); // M = M * MatrizRotacion
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  cubo.dibuja(gl);

  identidad(MatrizModelo);             // M = I
  traslacion(MatrizModelo, -2.5, -2.5, 0);
  multiplica(MatrizModelo, MatrizModelo, MatrizRotacion2); // M = M * MatrizRotacion
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  cubo.dibuja(gl);

  identidad(MatrizModelo);             // M = I
  traslacion(MatrizModelo, 2.5, -2.5, 0);
  multiplica(MatrizModelo, MatrizModelo, MatrizRotacion3); // M = M * MatrizRotacion
  gl.uniformMatrix4fv(uMatrizModelo, false, MatrizModelo);

  cubo.dibuja(gl);

  requestAnimationFrame(dibuja);
}


const reinicia = () => {
  /* Matriz de Rotación */
  identidad(MatrizRotacion);
  identidad(MatrizRotacion1);
  identidad(MatrizRotacion2);
  identidad(MatrizRotacion3);

  dibuja();
}

const main = () => {
  canvas = document.getElementById("webglcanvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("WebGL 2.0 no está disponible en tu navegador");
    return;
  }

  /* Para detectar los eventos del ratón */
  canvas.addEventListener("mousedown", mouseDown, false);
  canvas.addEventListener("mouseup", mouseUp, false);
  canvas.addEventListener("mouseout", mouseUp, false);
  canvas.addEventListener("mousemove", mouseMove, false);

  /* Para los botones */
  document.getElementById("reset").onclick = reinicia;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  compilaEnlazaLosShaders();

  cubo = new Cubo(gl);
  arcBall = new ArcBall(500.0, 500.0);

  gl.useProgram(programaID);
  uMatrizProyeccion = gl.getUniformLocation(programaID, "uMatrizProyeccion");
  uMatrizVista = gl.getUniformLocation(programaID, "uMatrizVista");
  uMatrizModelo = gl.getUniformLocation(programaID, "uMatrizModelo");
  ortho(MatrizProyeccion, -5, 5, -5, 5, -5, 5);
  gl.uniformMatrix4fv(uMatrizProyeccion, false, MatrizProyeccion);
  identidad(MatrizVista);
  gl.uniformMatrix4fv(uMatrizVista, false, MatrizVista);
  identidad(MatrizRotacion);
  identidad(MatrizRotacion1);
  identidad(MatrizRotacion2);
  identidad(MatrizRotacion3);

  /* Ajusta el ancho a [-1..1] y el alto a [-1..1] */
  arcBall.ajusta(gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  dibuja();
}
main();
