/** Reassign only the positions held by a run; all ordinary positions stay fixed. */
export function permuteFlowRuns<T>(sequence: readonly T[], keyOf: (entry:T)=>string|undefined, rankOf:(entry:T)=>number, reverse:(entry:T)=>boolean = ()=>false): T[] {
  const result=[...sequence], groups=new Map<string,number[]>();
  sequence.forEach((entry,i)=>{const key=keyOf(entry);if(key!==undefined)(groups.get(key)??groups.set(key,[]).get(key)!).push(i);});
  for(const positions of groups.values()) {
    const entries=positions.map((i)=>sequence[i]!).sort((a,b)=>rankOf(a)-rankOf(b));
    if(reverse(entries[0]!)) entries.reverse();
    positions.forEach((position,i)=>{result[position]=entries[i]!;});
  }
  return result;
}
