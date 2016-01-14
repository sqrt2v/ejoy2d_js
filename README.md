


> ejoy2d_js js and webGL implementation of ejoy2d

General
===
javascript and webGL implementation of 2d game engine [ejoy2d](https://github.com/ejoy/ejoy2d)

now it implements core API of ejoy2d but some feature still missing, include:

 - rich text
 - particle

Tools
===
ejoy2d_js can not use the raw ejoy2d assets,because is lua file. You can use the tool provided by the the repo to convert ejoy2d lua asset to json
see tools/ejoy2d2json/
to run,you should have [lua](http://www.lua.org/) installed, then run:

`lua main.lua input output`

it will convert input.lua to output.json
then you can use output.json as asset for ejoy2d_js

Run example
===
the repo provide an simple http server implement in go-lang for developer and debug
see simple_http_svr.go
to build, you need install [go-lang](https://golang.org) 
and you can build with (assumed the current directory is $GOPATH)

 `go build ejoy2d_js
 ./ejoy2d.js  ./src/ejoy2d_js (pass the repo path to the program, to find the assets, js, html etc)
  `
 - 

 