export type Matrix = number[][];
export type Mode = "muon" | "polar";
export const ID: Matrix = [[1,0,0],[0,1,0],[0,0,1]];
export const transpose = (a: Matrix): Matrix => a[0].map((_,j) => a.map(row=>row[j]));
export const multiply = (a: Matrix,b: Matrix): Matrix => a.map(row=>b[0].map((_,j)=>row.reduce((sum,v,k)=>sum+v*b[k][j],0)));
export const frobenius = (a: Matrix) => Math.hypot(...a.flat());
const scale = (a: Matrix,k: number): Matrix => a.map(row=>row.map(v=>v*k));
export const combine = (a: Matrix,b: Matrix,ka=1,kb=1): Matrix => a.map((row,i)=>row.map((v,j)=>ka*v+kb*b[i][j]));
export const error = (a: Matrix) => frobenius(combine(multiply(transpose(a),a),ID,1,-1));

// Symmetric Jacobi eigensolver for GᵀG. Column eigenvectors form V.
export function matrixSpectrum(g: Matrix) {
  const a = multiply(transpose(g),g), v = ID.map(row=>[...row]);
  for(let sweep=0;sweep<60;sweep++){
    let p=0,q=1;
    for(const [i,j] of [[0,1],[0,2],[1,2]]) if(Math.abs(a[i][j])>Math.abs(a[p][q])){p=i;q=j;}
    if(Math.abs(a[p][q])<1e-14*Math.max(1,...a.flat().map(Math.abs)))break;
    const angle=.5*Math.atan2(2*a[p][q],a[q][q]-a[p][p]);
    const c=Math.cos(angle),s=Math.sin(angle),app=a[p][p],aqq=a[q][q],apq=a[p][q];
    a[p][p]=c*c*app-2*s*c*apq+s*s*aqq;a[q][q]=s*s*app+2*s*c*apq+c*c*aqq;a[p][q]=a[q][p]=0;
    for(let k=0;k<3;k++)if(k!==p&&k!==q){const x=a[k][p],y=a[k][q];a[k][p]=a[p][k]=c*x-s*y;a[k][q]=a[q][k]=s*x+c*y;}
    for(let k=0;k<3;k++){const x=v[k][p],y=v[k][q];v[k][p]=c*x-s*y;v[k][q]=s*x+c*y;}
  }
  const order=[0,1,2].sort((i,j)=>a[j][j]-a[i][i]);
  const singular=order.map(i=>Math.sqrt(Math.max(0,a[i][i])));
  const vectors=v.map(row=>order.map(i=>row[i]));
  // Treat near-zero singular values as numerically null; the rank-deficient
  // reference is the canonical partial polar factor, zero on the null space.
  const threshold=Math.max(1e-10,singular[0]*1e-7);
  const inverseRoot=multiply(multiply(vectors,[[singular[0]>threshold?1/singular[0]:0,0,0],[0,singular[1]>threshold?1/singular[1]:0,0],[0,0,singular[2]>threshold?1/singular[2]:0]]),transpose(vectors));
  const polar=multiply(g,inverseRoot);
  return { singular, polar, rank:singular.filter(x=>x>threshold).length };
}
export function orthogonalizationTrace(g: Matrix,count:number,mode:Mode): Matrix[] {
  let x=scale(g,1/(frobenius(g)+1e-7));const trace=[x];
  for(let i=0;i<count;i++){
    const a=multiply(x,transpose(x)),ax=multiply(a,x);
    x=mode==="muon"?combine(combine(x,ax,3.4445,-4.775),multiply(a,ax),1,2.0315):combine(x,ax,1.5,-.5);
    trace.push(x);
  }
  return trace;
}
