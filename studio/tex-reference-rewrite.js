// Conservative path rewriting: change known TeX file arguments, never prose,
// comments, verbatim examples, arbitrary data files or unknown macro syntax.
export function rewriteTexFolderReferences(input, from, to) {
  const text=String(input || ''),prefix=from+'/',next=to+'/';
  const path=value=>value.replace(/^(\s*)(\.\/)?([^]*?)(\s*)$/, (all,left,dot,name,right)=>
    name.startsWith(prefix)?left+(dot||'')+next+name.slice(prefix.length)+right:all);
  let result='',i=0;
  while(i<text.length){
    if(text[i]==='%'){
      let backslashes=0;for(let j=i-1;j>=0&&text[j]==='\\';j--)backslashes++;
      if(backslashes%2===0){const end=text.indexOf('\n',i);const until=end<0?text.length:end;result+=text.slice(i,until);i=until;continue;}
    }
    if(text[i]==='\\'){
      const rest=text.slice(i);
      const block=rest.match(/^\\begin\s*\{(verbatim\*?|Verbatim|lstlisting|minted)\}/);
      if(block){const end=text.indexOf('\\end{'+block[1]+'}',i+block[0].length);const until=end<0?text.length:end+block[1].length+6;result+=text.slice(i,until);i=until;continue;}
      const verb=rest.match(/^\\verb\*?([^\sA-Za-z])/);
      if(verb){const end=text.indexOf(verb[1],i+verb[0].length),newline=text.indexOf('\n',i);const until=end<0||(newline>=0&&newline<end)?(newline<0?text.length:newline):end+1;result+=text.slice(i,until);i=until;continue;}
      const graphic=rest.match(/^(\\graphicspath\s*\{)((?:\s*\{[^{}]*\}\s*)+)(\})/);
      if(graphic){result+=graphic[1]+graphic[2].replace(/\{([^{}]*)\}/g,(_,value)=>'{'+path(value)+'}')+graphic[3];i+=graphic[0].length;continue;}
      const command=rest.match(/^(\\(input|include|subfile|includegraphics|addbibresource|bibliography|lstinputlisting|verbatiminput)\*?(?:\s*\[[^\]\r\n]*\])?\s*\{)([^{}]*)(\})/);
      if(command){const value=command[2]==='bibliography'?command[3].split(',').map(path).join(','):path(command[3]);result+=command[1]+value+command[4];i+=command[0].length;continue;}
    }
    result+=text[i++];
  }
  return result;
}
