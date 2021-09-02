const defaultBannedList = {
  name: 'Default',
  filters: [
    { condition: '<', value: '100', ftype: 'SIZE' },
    { condition: '=', value: '.txt', ftype: 'EXTENSION' },
    { condition: 'contains', value: '.git', ftype: 'NAME' },
    { condition: 'contains', value: 'node_modules', ftype: 'NAME' },
    { condition: 'contains', value: 'LICENSE', ftype: 'NAME' },
    { condition: 'starts', value: '.asar', ftype: 'NAME' },
    { condition: '=', value: '.adoc', ftype: 'EXTENSION' },
    { condition: '=', value: '.am', ftype: 'EXTENSION' },
    { condition: '=', value: '.asciidoc', ftype: 'EXTENSION' },
    { condition: '=', value: '.bmp', ftype: 'EXTENSION' },
    { condition: '=', value: '.build', ftype: 'EXTENSION' },
    { condition: '=', value: '.cfg', ftype: 'EXTENSION' },
    { condition: '=', value: '.chm', ftype: 'EXTENSION' },
    { condition: '=', value: '.class', ftype: 'EXTENSION' },
    { condition: '=', value: '.cmake', ftype: 'EXTENSION' },
    { condition: '=', value: '.cnf', ftype: 'EXTENSION' },
    { condition: '=', value: '.conf', ftype: 'EXTENSION' },
    { condition: '=', value: '.config', ftype: 'EXTENSION' },
    { condition: '=', value: '.contributors', ftype: 'EXTENSION' },
    { condition: '=', value: '.copying', ftype: 'EXTENSION' },
    { condition: '=', value: '.crt', ftype: 'EXTENSION' },
    { condition: '=', value: '.csproj', ftype: 'EXTENSION' },
    { condition: '=', value: '.css', ftype: 'EXTENSION' },
    { condition: '=', value: '.csv', ftype: 'EXTENSION' },
    { condition: '=', value: '.dat', ftype: 'EXTENSION' },
    { condition: '=', value: '.data', ftype: 'EXTENSION' },
    { condition: '=', value: '.doc', ftype: 'EXTENSION' },
    { condition: '=', value: '.docx', ftype: 'EXTENSION' },
    { condition: '=', value: '.dtd', ftype: 'EXTENSION' },
    { condition: '=', value: '.dts', ftype: 'EXTENSION' },
    { condition: '=', value: '.iws', ftype: 'EXTENSION' },
    { condition: '=', value: '.md', ftype: 'EXTENSION' },
    { condition: '=', value: '.c9', ftype: 'EXTENSION' },
    { condition: '=', value: '.c9revisions', ftype: 'EXTENSION' },
    { condition: '=', value: '.dtsi', ftype: 'EXTENSION' },
    { condition: '=', value: '.gmo', ftype: 'EXTENSION' },
    { condition: '=', value: '.gradle', ftype: 'EXTENSION' },
    { condition: '=', value: '.guess', ftype: 'EXTENSION' },
    { condition: '=', value: '.hex', ftype: 'EXTENSION' },
    { condition: '=', value: '.htm', ftype: 'EXTENSION' },
    { condition: '=', value: '.html', ftype: 'EXTENSION' },
    { condition: '=', value: '.ico', ftype: 'EXTENSION' },
    { condition: '=', value: '.iml', ftype: 'EXTENSION' },
    { condition: '=', value: '.in', ftype: 'EXTENSION' },
    { condition: '=', value: '.inc', ftype: 'EXTENSION' },
    { condition: '=', value: '.info', ftype: 'EXTENSION' },
    { condition: '=', value: '.ini', ftype: 'EXTENSION' },
    { condition: '=', value: '.ipynb', ftype: 'EXTENSION' },
    { condition: '=', value: '.jpeg', ftype: 'EXTENSION' },
    { condition: '=', value: '.json', ftype: 'EXTENSION' },
    { condition: '=', value: '.jsonld', ftype: 'EXTENSION' },
    { condition: '=', value: '.lock', ftype: 'EXTENSION' },
    { condition: '=', value: '.log', ftype: 'EXTENSION' },
    { condition: '=', value: '.m4', ftype: 'EXTENSION' },
    { condition: '=', value: '.map', ftype: 'EXTENSION' },
    { condition: '=', value: '.markdown', ftype: 'EXTENSION' },
    { condition: '=', value: '.md', ftype: 'EXTENSION' },
    { condition: '=', value: '.md5', ftype: 'EXTENSION' },
    { condition: '=', value: '.meta', ftype: 'EXTENSION' },
    { condition: '=', value: '.mk', ftype: 'EXTENSION' },
    { condition: '=', value: '.mxml', ftype: 'EXTENSION' },
    { condition: '=', value: '.o', ftype: 'EXTENSION' },
    { condition: '=', value: '.otf', ftype: 'EXTENSION' },
    { condition: '=', value: '.out', ftype: 'EXTENSION' },
    { condition: '=', value: '.pbtxt', ftype: 'EXTENSION' },
    { condition: '=', value: '.pdf', ftype: 'EXTENSION' },
    { condition: '=', value: '.pem', ftype: 'EXTENSION' },
    { condition: '=', value: '.phtml', ftype: 'EXTENSION' },
    { condition: '=', value: '.plist', ftype: 'EXTENSION' },
    { condition: '=', value: '.png', ftype: 'EXTENSION' },
    { condition: '=', value: '.po', ftype: 'EXTENSION' },
    { condition: '=', value: '.ppt', ftype: 'EXTENSION' },
    { condition: '=', value: '.prefs', ftype: 'EXTENSION' },
    { condition: '=', value: '.properties', ftype: 'EXTENSION' },
    { condition: '=', value: '.pyc', ftype: 'EXTENSION' },
    { condition: '=', value: '.qdoc', ftype: 'EXTENSION' },
    { condition: '=', value: '.result', ftype: 'EXTENSION' },
    { condition: '=', value: '.rgb', ftype: 'EXTENSION' },
    { condition: '=', value: '.rst', ftype: 'EXTENSION' },
    { condition: '=', value: '.scss', ftype: 'EXTENSION' },
    { condition: '=', value: '.sha', ftype: 'EXTENSION' },
    { condition: '=', value: '.sha1', ftype: 'EXTENSION' },
    { condition: '=', value: '.sha2', ftype: 'EXTENSION' },
    { condition: '=', value: '.sha256', ftype: 'EXTENSION' },
    { condition: '=', value: '.sln', ftype: 'EXTENSION' },
    { condition: '=', value: '.spec', ftype: 'EXTENSION' },
    { condition: '=', value: '.sql', ftype: 'EXTENSION' },
    { condition: '=', value: '.sub', ftype: 'EXTENSION' },
    { condition: '=', value: '.svg', ftype: 'EXTENSION' },
    { condition: '=', value: '.svn-base', ftype: 'EXTENSION' },
    { condition: '=', value: '.tab', ftype: 'EXTENSION' },
    { condition: '=', value: '.template', ftype: 'EXTENSION' },
    { condition: '=', value: '.test', ftype: 'EXTENSION' },
    { condition: '=', value: '.test', ftype: 'EXTENSION' },
    { condition: '=', value: '.tex', ftype: 'EXTENSION' },
    { condition: '=', value: '.tiff', ftype: 'EXTENSION' },
    { condition: '=', value: '.toml', ftype: 'EXTENSION' },
    { condition: '=', value: '.ttf', ftype: 'EXTENSION' },
    { condition: '=', value: '.txt', ftype: 'EXTENSION' },
    { condition: '=', value: '.utf8', ftype: 'EXTENSION' },
    { condition: '=', value: '.vim', ftype: 'EXTENSION' },
    { condition: '=', value: '.wav', ftype: 'EXTENSION' },
    { condition: '=', value: '.whl', ftype: 'EXTENSION' },
    { condition: '=', value: '.wolf', ftype: 'EXTENSION' },
    { condition: '=', value: '.xht', ftype: 'EXTENSION' },
    { condition: '=', value: '.xhtml', ftype: 'EXTENSION' },
    { condition: '=', value: '.xls', ftype: 'EXTENSION' },
    { condition: '=', value: '.xlsx', ftype: 'EXTENSION' },
    { condition: '=', value: '.xml', ftype: 'EXTENSION' },
    { condition: '=', value: '.xpm', ftype: 'EXTENSION' },
    { condition: '=', value: '.xsd', ftype: 'EXTENSION' },
    { condition: '=', value: '.xul', ftype: 'EXTENSION' },
    { condition: '=', value: '.ysml', ftype: 'EXTENSION' },
    { condition: '=', value: '.yml', ftype: 'EXTENSION' },
    { condition: '=', value: '.wfp', ftype: 'EXTENSION' },
    { condition: '=', value: '.editorconfig', ftype: 'EXTENSION' },
    { condition: '=', value: '.dotcover', ftype: 'EXTENSION' },
    { condition: '=', value: '.pid', ftype: 'EXTENSION' },
    { condition: '=', value: '.lcov', ftype: 'EXTENSION' },
    { condition: '=', value: '.egg', ftype: 'EXTENSION' },
    { condition: '=', value: '.manifest', ftype: 'EXTENSION' },
    { condition: '=', value: '.cache', ftype: 'EXTENSION' },
    { condition: '=', value: '.coverage', ftype: 'EXTENSION' },
    { condition: '=', value: '.cover', ftype: 'EXTENSION' },
    { condition: '=', value: '.gem', ftype: 'EXTENSION' },
  ],
};
export { defaultBannedList };
