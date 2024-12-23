const toRadians = (grados) => grados * Math.PI / 180;

/* Matriz Identidad */
export const identidad = (r) => {
  r[0] = 1; r[4] = 0; r[8] = 0; r[12] = 0;
  r[1] = 0; r[5] = 1; r[9] = 0; r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = 1; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
}

/* TraslaciÃ³n - glTranslatef */
export const traslacion = (matriz, tx, ty, tz) => {
  var r = new Array(16);
  r[0] = 1; r[4] = 0; r[8] = 0; r[12] = tx;
  r[1] = 0; r[5] = 1; r[9] = 0; r[13] = ty;
  r[2] = 0; r[6] = 0; r[10] = 1; r[14] = tz;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* EscalaciÃ³n - glScalef */
export const escalacion = (matriz, sx, sy, sz) => {
  var r = new Array(16);
  r[0] = sx; r[4] = 0; r[8] = 0; r[12] = 0;
  r[1] = 0; r[5] = sy; r[9] = 0; r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = sz; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* RotaciÃ³n sobre X - glRotatef */
export const rotacionX = (matriz, theta) => {
  let r = new Array(16);
  var c = Math.cos(toRadians(theta));
  var s = Math.sin(toRadians(theta));
  r[0] = 1; r[4] = 0; r[8] = 0; r[12] = 0;
  r[1] = 0; r[5] = c; r[9] = -s; r[13] = 0;
  r[2] = 0; r[6] = s; r[10] = c; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* RotaciÃ³n sobre Y - glRotatef */
export const rotacionY = (matriz, theta) => {
  let r = new Array(16);
  var c = Math.cos(toRadians(theta));
  var s = Math.sin(toRadians(theta));
  r[0] = c; r[4] = 0; r[8] = s; r[12] = 0;
  r[1] = 0; r[5] = 1; r[9] = 0; r[13] = 0;
  r[2] = -s; r[6] = 0; r[10] = c; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* RotaciÃ³n sobre Z - glRotatef */
export const rotacionZ = (matriz, theta) => {
  let r = new Array(16);
  var c = Math.cos(toRadians(theta));
  var s = Math.sin(toRadians(theta));
  r[0] = c; r[4] = -s; r[8] = 0; r[12] = 0;
  r[1] = s; r[5] = c; r[9] = 0; r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = 1; r[14] = 0;
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
  multiplica(matriz, matriz, r);
}

/* ProyecciÃ³n Paralela - glOrtho */
export const ortho = (r, izq, der, abj, arr, cerca, lejos) => {
  r[0] = 2 / (der - izq); r[4] = 0; r[8] = 0; r[12] = -(der + izq) / (der - izq);
  r[1] = 0; r[5] = 2 / (arr - abj); r[9] = 0; r[13] = -(arr + abj) / (arr - abj);
  r[2] = 0; r[6] = 0; r[10] = -2 / (lejos - cerca); r[14] = -(lejos + cerca) / (lejos - cerca);
  r[3] = 0; r[7] = 0; r[11] = 0; r[15] = 1;
}

/* ProyecciÃ³n Perspectiva - glFrustum */
export const frustum = (r, izq, der, abj, arr, cerca, lejos) => {
  r[0] = 2 * cerca / (der - izq); r[4] = 0; r[8] = (der + izq) / (der - izq); r[12] = 0;
  r[1] = 0; r[5] = 2 * cerca / (arr - abj); r[9] = (arr + abj) / (arr - abj); r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = -(lejos + cerca) / (lejos - cerca); r[14] = -2 * lejos * cerca / (lejos - cerca);
  r[3] = 0; r[7] = 0; r[11] = -1; r[15] = 0;
}

/* ProyecciÃ³n Perspectiva - gluPerspective */
export const perspective = (r, fovy, aspecto, cerca, lejos) => {
  var ang = fovy * 0.5;
  var f = (Math.abs(Math.sin(toRadians(ang))) < 1e-8 ? 0 : 1) / Math.tan(toRadians(ang));
  r[0] = f / aspecto; r[4] = 0; r[8] = 0; r[12] = 0;
  r[1] = 0; r[5] = f; r[9] = 0; r[13] = 0;
  r[2] = 0; r[6] = 0; r[10] = -(lejos + cerca) / (lejos - cerca); r[14] = -2.0 * lejos * cerca / (lejos - cerca);
  r[3] = 0; r[7] = 0; r[11] = - 1.0; r[15] = 0;
}

/* MultiplicaciÃ³n de matrices de 4 x 4 */
const multiplica = (c, a, b) => {
  let r = new Array(16);
  let i, j, k;
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      let s = 0;
      for (k = 0; k < 4; k++)
        s = s + a[i + k * 4] * b[k + j * 4];
      r[i + j * 4] = s;
    }
  }
  for (i = 0; i < 16; i++)
    c[i] = r[i];
}

export function multiplicaMV(c, a, b) {
  let r = new Array(3);

  /*
    | a[0] a[4] a[ 8] a[12] |     | b[0] |
    | a[1] a[5] a[ 9] a[13] |  *  | b[1] |
    | a[2] a[6] a[10] a[14] |     | b[2] |
    | a[3] a[7] a[11] a[15] |
    */

  r[0] = a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12];
  r[1] = a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13];
  r[2] = a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14];
  for (var i = 0; i < 3; i++)
    c[i] = r[i];
}
