// Tiny helpers that don't depend on React.
export const css = (obj) => Object.entries(obj).reduce((a,[k,v]) => a + k.replace(/([A-Z])/g,'-$1').toLowerCase()+':'+v+';','');
