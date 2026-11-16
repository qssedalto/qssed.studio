package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestBridgeHealthAndOriginProtection(t *testing.T) {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", handleHealth)
	mux.HandleFunc("/tex/status", handleTexStatus)
	mux.HandleFunc("/tex/compile", handleTexCompile)
	h := secureHandler(mux)
	request := func(method, path, origin string) *httptest.ResponseRecorder {
		r := httptest.NewRequest(method, "http://127.0.0.1:32145"+path, nil)
		if origin != "" { r.Header.Set("Origin", origin) }
		w := httptest.NewRecorder()
		h.ServeHTTP(w,r)
		return w
	}
	good := request("GET","/health","https://work.qsseda.com")
	if good.Code != 200 { t.Fatalf("health: %d %s",good.Code,good.Body.String()) }
	var health struct {
		Service string `json:"service"`
		Runtime string `json:"runtime"`
		Protocol int `json:"protocol"`
		Capabilities []string `json:"capabilities"`
	}
	if err:=json.Unmarshal(good.Body.Bytes(),&health);err!=nil {t.Fatal(err)}
	if health.Service!=bridgeService || health.Protocol!=1 || health.Runtime!="native-macos" || len(health.Capabilities)!=5 {t.Fatalf("unexpected response: %+v",health)}
	if got:=request("GET","/health","https://malicious.example");got.Code!=403 {t.Fatalf("bad origin status %d",got.Code)}
	if got:=request("POST","/tex/compile","");got.Code!=403 {t.Fatalf("POST without origin status %d",got.Code)}
	if got:=request("OPTIONS","/tex/compile","https://work.qsseda.com");got.Code!=204 {t.Fatalf("preflight status %d",got.Code)}
	if got:=request("GET","/tex/status","https://work.qsseda.com");got.Code!=200 {t.Fatalf("tex status %d",got.Code)}
	r:=httptest.NewRequest("GET","http://malicious.example/health",nil)
	w:=httptest.NewRecorder()
	h.ServeHTTP(w,r)
	if w.Code!=421 {t.Fatalf("host mismatch status %d",w.Code)}
}

func TestProjectFilesCannotEscapeTemporaryDirectory(t *testing.T) {
	dir:=t.TempDir()
	bad:=[]string{"../danger.tex","/tmp/danger.tex","main.tex","foo/../../danger.tex","a\\b.tex","evil.exe","aux.txt","folder/../escape.tex"}
	for _, name:=range bad {
		if safeProjectAssetName(name) {t.Errorf("accepted dangerous name %q",name)}
	}
	good:=[]projectAsset{{Name:"figures/chart.png",Encoding:"base64",Content:"iVBORw0KGgo="},{Name:"chapters/ch1.tex",Encoding:"utf8",Content:"hello"}}
	if err:=writeProjectAssets(dir,good);err!=nil {t.Fatal(err)}
	data,err:=os.ReadFile(filepath.Join(dir,"chapters","ch1.tex"))
	if err!=nil||!bytes.Equal(data,[]byte("hello")){t.Fatalf("written asset mismatch %q %v",data,err)}
	if err:=writeProjectAssets(dir,[]projectAsset{{Name:"a.tex",Encoding:"utf8"},{Name:"A.tex",Encoding:"utf8"}});err==nil {t.Fatal("case-fold duplicates accepted")}
}

func TestTeXInputRequiresKnownEngine(t *testing.T) {
	h:=secureHandler(http.HandlerFunc(handleTexCompile))
	r:=httptest.NewRequest("POST","http://127.0.0.1:32145/tex/compile",bytes.NewBufferString(`{"engine":"bash","source":"hello"}`))
	r.Header.Set("Origin","https://qsseda.com")
	w:=httptest.NewRecorder()
	h.ServeHTTP(w,r)
	if w.Code!=400 {t.Fatalf("unexpected response: %d %s",w.Code,w.Body.String())}
}
