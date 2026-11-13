/** Hand-written BPMN facts and independently authored component interactions. */
export const mappingCases=[
 {name:"diamond-join",facts:[["start","a"],["choose","b"],["left","c"],["right","d"],["later-left","c"],["join","a"]],steps:[
  [1,"","a","a","start"],[2,"","a","b","choose"],[3,"a","b","c","left"],[3,"b","b","d","right"],[4,"","c","c","later-left"],[5,"a","c","a","join"],[5,"b","d","a","join"]]},
 {name:"loop",facts:[["initial","a"],["work","b"],["retry","a"]],steps:[[1,"","a","a","initial"],[2,"","a","b","work"],[3,"","b","a","retry"]]},
 {name:"initial-task",facts:[["initial","a"]],steps:[[1,"","a","a","initial"]]},
 {name:"consecutive-same-component",facts:[["first","a"],["second","a"],["third","b"]],steps:[[1,"","a","a","first"],[2,"","a","a","second"],[3,"","a","b","third"]]},
] as const;
