package main

import (
  "encoding/base64"
  "os"
  "path/filepath"
  "strings"
  "testing"
)

func TestProjectAssetNames(t *testing.T) {
  good := []string{"config/preamble.tex", "chapters/foundations.tex", "figures/chart.png", "references.bib", "fonts/Custom.otf"}
  for _, name := range good {
    if !safeProjectAssetName(name) { t.Errorf("valid asset rejected: %q", name) }
  }
  bad := []string{
    "", "../main.tex", "chapters/../../windows/system.ini", "/tmp/attack.tex",
    "C:/Windows/win.ini", "config\\unsafe.tex", "main.tex", "MAIN.TEX",
    "con.tex", "folder/NUL.pdf", "chapter/aux.txt", "script.ps1", "script.exe",
    "main.pdf", "folder//file.tex", "folder/./file.tex", "trailing./file.tex",
    "file.tex:stream",
  }
  for _, name := range bad {
    if safeProjectAssetName(name) { t.Errorf("unsafe asset accepted: %q", name) }
  }
}

func TestWriteProjectAssets(t *testing.T) {
  root := t.TempDir()
  assets := []projectAsset{
    {Name:"config/preamble.tex", Encoding:"utf8", Content:"\\\\usepackage{amsmath}\\n"},
    {Name:"chapters/foundations.tex", Encoding:"utf8", Content:"\\\\section{Foundations}\\n"},
    {Name:"figures/pic.png", Encoding:"base64", Content:base64.StdEncoding.EncodeToString([]byte{137,80,78,71,13,10,26,10})},
  }
  if err := writeProjectAssets(root, assets); err != nil { t.Fatal(err) }
  for _, asset := range assets {
    if _, err := os.Stat(filepath.Join(root, filepath.FromSlash(asset.Name))); err != nil { t.Fatal(err) }
  }
  if err := writeProjectAssets(t.TempDir(), []projectAsset{
    {Name:"a.tex", Encoding:"utf8", Content:"one"},
    {Name:"A.tex", Encoding:"utf8", Content:"two"},
  }); err == nil { t.Fatal("case-insensitive duplicate accepted") }
  if err := writeProjectAssets(t.TempDir(), []projectAsset{
    {Name:"file.tex", Encoding:"base64", Content:"%%%"},
  }); err == nil { t.Fatal("invalid base64 accepted") }
  if err := writeProjectAssets(t.TempDir(), []projectAsset{
    {Name:"x.tex", Encoding:"utf8", Content:strings.Repeat("x", maxProjectFile+1)},
  }); err == nil { t.Fatal("oversized file accepted") }
}


func TestBibliographyBackend(t *testing.T) {
	dir := t.TempDir()
	if got := bibliographyBackend(dir); got != "" {
		t.Fatalf("unreferenced document incorrectly requests %q", got)
	}
	if err := os.WriteFile(filepath.Join(dir, "main.aux"), []byte("\\relax\n\\bibdata{references}\n\\bibstyle{plain}\n"), 0600); err != nil {
		t.Fatal(err)
	}
	if got := bibliographyBackend(dir); got != "bibtex" {
		t.Fatalf("expected bibtex, got %q", got)
	}
	if err := os.WriteFile(filepath.Join(dir, "main.bcf"), []byte("<bcf:controlfile/>"), 0600); err != nil {
		t.Fatal(err)
	}
	if got := bibliographyBackend(dir); got != "biber" {
		t.Fatalf("biber must take precedence, got %q", got)
	}
}

func TestBibliographyExecutableAllowlist(t *testing.T) {
	dir := t.TempDir()
	engine := filepath.Join(dir, "xelatex.exe")
	tool := filepath.Join(dir, "bibtex.exe")
	if err := os.WriteFile(tool, []byte("fixture"), 0600); err != nil {
		t.Fatal(err)
	}
	if got := findBibliographyExecutable("bibtex", engine); got != tool {
		t.Fatalf("expected sibling tex tool, got %q", got)
	}
	if got := findBibliographyExecutable("powershell", engine); got != "" {
		t.Fatalf("unapproved executable allowed: %q", got)
	}
}
