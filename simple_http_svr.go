package main

// import "io"
import (
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

func main() {
	http.HandleFunc("/", handleExample)
	err := http.ListenAndServe(":8080", nil)
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
		handleAsset("text/javascript", "./src/lib/"+path, w)
	case ".json":
		handleAsset("application/json", "./src/sample/"+path, w)
	case ".png":
		handleAsset("image/x-png", "./src/sample/"+path, w)
	case ".html":
		handleHtml("./src/sample/"+path, w)
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
