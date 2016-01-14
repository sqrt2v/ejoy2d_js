package main

// import "io"
import (
	"flag"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

var resRoot string

func main() {
	flag.Parse()
	resRoot = flag.Arg(0)
	if flag.NArg() < 1 {
		log.Fatal("Error! should pass res root as parameter")
		return
	}
	fmt.Println("--------------123")
	fmt.Println(resRoot)
	http.HandleFunc("/", handleExample)
	err := http.ListenAndServe(":9527", nil)
	if err != nil {
		log.Fatal("fatel: listen and serve", err)
	}
}

func handleExample(w http.ResponseWriter, r *http.Request) {
	r.ParseForm() //解析参数，默认是不会解析的

	path := r.URL.Path
	t := path[strings.LastIndex(path, "."):]

	fmt.Println("path", r.URL.Path)
	fmt.Println("type:", t)

	switch t {
	case ".js":
		handleAsset("text/javascript", resRoot+"lib/"+path, w)
	case ".json":
		handleAsset("application/json", resRoot+"sample/"+path, w)
	case ".png":
		handleAsset("image/x-png", resRoot+"sample/"+path, w)
	case ".html":
		handleHtml(resRoot+"/sample/"+path, w)
	default:
	}

}

func handleAsset(ct string, path string, w http.ResponseWriter) {
	w.Header().Set("content-type", ct)

	fin, err := os.Open(path)

	defer fin.Close()

	if err != nil {
		log.Fatal("Static resources:", err)
	}

	fd, err := ioutil.ReadAll(fin)
	if err != nil {
		log.Fatal(err)
	}
	w.Write(fd)
}

func handleHtml(path string, w http.ResponseWriter) {
	t, _ := template.ParseFiles(path)
	t.Execute(w, nil)
}
