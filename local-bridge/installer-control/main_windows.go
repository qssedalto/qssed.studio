//go:build windows

// This executable is used only by the Inno Setup installer. The running
// Bridge payload stays the unmodified, lightweight 0.3.0-d5e4cfd engine.
package main

import (
 "encoding/json"
 "errors"
 "fmt"
 "io"
 "net"
 "net/http"
 "os"
 "os/exec"
 "path/filepath"
 "strconv"
 "strings"
 "syscall"
 "time"
 "unsafe"
)

const (
 expectedVersion="0.3.0-d5e4cfd"
 serviceName="qsseda-local-bridge"
 healthURL="http://127.0.0.1:32145/health"
 localAddress="127.0.0.1:32145"
 snapshotProcesses=0x00000002
 processQueryLimitedInformation=0x1000
 processTerminate=0x0001
)

type health struct {
 Service string `json:"service"`
 Protocol int `json:"protocol"`
 Runtime string `json:"runtime"`
 Version string `json:"version"`
}
type processEntry struct {
 Size uint32
 References uint32
 ProcessID uint32
 HeapID uintptr
 ModuleID uint32
 Threads uint32
 ParentID uint32
 Priority int32
 Flags uint32
 ExeName [260]uint16
}
var (
 kernel=syscall.NewLazyDLL("kernel32.dll")
 createSnapshot=kernel.NewProc("CreateToolhelp32Snapshot")
 processFirst=kernel.NewProc("Process32FirstW")
 processNext=kernel.NewProc("Process32NextW")
 openProcess=kernel.NewProc("OpenProcess")
 queryImage=kernel.NewProc("QueryFullProcessImageNameW")
 terminateProcess=kernel.NewProc("TerminateProcess")
 waitForSingleObject=kernel.NewProc("WaitForSingleObject")
)

func logPath() string {
 home:=strings.TrimSpace(os.Getenv("LOCALAPPDATA"))
 if home=="" {home=os.TempDir()}
 return filepath.Join(home,"QssedA","LocalBridge","install.log")
}
func logEvent(event string,err error) {
 path:=logPath()
 if mk:=os.MkdirAll(filepath.Dir(path),0700);mk!=nil{return}
 f,e:=os.OpenFile(path,os.O_WRONLY|os.O_APPEND|os.O_CREATE,0600)
 if e!=nil{return}
 defer f.Close()
 text:=event
 if err!=nil{text+=": "+strings.ReplaceAll(err.Error(),"
"," ")}
 _,_=fmt.Fprintf(f,"%s pid=%d %s
",time.Now().Format(time.RFC3339),os.Getpid(),text)
}
func readHealth() (health,error) {
 client:=http.Client{Timeout:800*time.Millisecond}
 resp,err:=client.Get(healthURL)
 if err!=nil{return health{},err}
 defer resp.Body.Close()
 if resp.StatusCode!=200{return health{},fmt.Errorf("Bridge health HTTP %d",resp.StatusCode)}
 var data health
 if err:=json.NewDecoder(io.LimitReader(resp.Body,8192)).Decode(&data);err!=nil{return health{},err}
 if data.Service!=serviceName||data.Protocol!=1||data.Runtime!="native-windows" {
  return health{},errors.New("localhost:32145 is not the expected AERTEX native service")
 }
 return data,nil
}
func portBusy() bool{
 c,e:=net.DialTimeout("tcp",localAddress,350*time.Millisecond)
 if e!=nil{return false}
 _=c.Close()
 return true
}
func processPath(pid uint32)(string,error){
 h,_,err:=openProcess.Call(processQueryLimitedInformation,0,uintptr(pid))
 if h==0{return "",fmt.Errorf("OpenProcess(%d): %w",pid,err)}
 defer syscall.CloseHandle(syscall.Handle(h))
 buf:=make([]uint16,32768)
 length:=uint32(len(buf))
 ok,_,queryErr:=queryImage.Call(h,0,uintptr(unsafe.Pointer(&buf[0])),uintptr(unsafe.Pointer(&length)))
 if ok==0{return "",fmt.Errorf("QueryFullProcessImageNameW(%d): %w",pid,queryErr)}
 if length==0||int(length)>len(buf){return "",errors.New("invalid image path size")}
 return syscall.UTF16ToString(buf[:length]),nil
}
func matchingProcessIDs(installed string)([]uint32,error){
 snap,_,err:=createSnapshot.Call(snapshotProcesses,0)
 if snap==^uintptr(0){return nil,fmt.Errorf("CreateToolhelp32Snapshot: %w",err)}
 defer syscall.CloseHandle(syscall.Handle(snap))
 entry:=processEntry{Size:uint32(unsafe.Sizeof(processEntry{}))}
 ok,_,firstErr:=processFirst.Call(snap,uintptr(unsafe.Pointer(&entry)))
 if ok==0{return nil,fmt.Errorf("Process32FirstW: %w",firstErr)}
 ids:=make([]uint32,0,2)
 for ok!=0 {
  if strings.EqualFold(syscall.UTF16ToString(entry.ExeName[:]),"AERTEX-Bridge.exe"){
   actual,e:=processPath(entry.ProcessID)
   if e==nil&&strings.EqualFold(filepath.Clean(actual),filepath.Clean(installed)){
    ids=append(ids,entry.ProcessID)
   }
  }
  entry.Size=uint32(unsafe.Sizeof(entry))
  ok,_,_=processNext.Call(snap,uintptr(unsafe.Pointer(&entry)))
 }
 return ids,nil
}
func stop(installed string)error{
 ids,err:=matchingProcessIDs(installed)
 if err!=nil{return err}
 for _,pid:=range ids {
  h,_,openErr:=openProcess.Call(processTerminate|processQueryLimitedInformation,0,uintptr(pid))
  if h==0{return fmt.Errorf("cannot stop installed Bridge PID %d: %w",pid,openErr)}
  ok,_,termErr:=terminateProcess.Call(h,0)
  if ok==0{
   syscall.CloseHandle(syscall.Handle(h))
   return fmt.Errorf("TerminateProcess(%d): %w",pid,termErr)
  }
  _,_,_=waitForSingleObject.Call(h,5000)
  syscall.CloseHandle(syscall.Handle(h))
 }
 // Do not terminate an unrelated process that happens to own port 32145.
 time.Sleep(180*time.Millisecond)
 return nil
}
func start(installed string)error{
 if _,err:=os.Stat(installed);err!=nil{return fmt.Errorf("installed Bridge is missing: %w",err)}
 current,err:=matchingProcessIDs(installed)
 if err!=nil{return err}
 if len(current)>0 {
  alive,e:=readHealth()
  if e==nil&&alive.Version==expectedVersion{return nil}
  return errors.New("installed Bridge process exists but the health service is invalid; restart or inspect existing process")
 }
 if portBusy(){
  info,e:=readHealth()
  if e==nil{return fmt.Errorf("port 32145 is already used by another Bridge version %q or path; close that process before installing",info.Version)}
  return fmt.Errorf("127.0.0.1:32145 is occupied by an unrecognized process: %w",e)
 }
 cmd:=exec.Command(installed,"--background")
 cmd.SysProcAttr=&syscall.SysProcAttr{HideWindow:true,CreationFlags:0x00000008|0x00000200}
 if err:=cmd.Start();err!=nil{return fmt.Errorf("start installed Bridge: %w",err)}
 _=cmd.Process.Release()
 deadline:=time.Now().Add(11*time.Second)
 var last error
 for time.Now().Before(deadline) {
  ready,e:=readHealth()
  if e==nil {
   ids,listErr:=matchingProcessIDs(installed)
   if listErr==nil&&len(ids)>0&&ready.Version==expectedVersion{
    fmt.Println("READY",ready.Service,ready.Version,"PID",strconv.Itoa(int(ids[0])))
    return nil
   }
   if ready.Version!=expectedVersion{
    last=fmt.Errorf("unrecognized Bridge version %q",ready.Version)
   }else{last=errors.New("health service responds but the installed Bridge process was not found")}
  }else{last=e}
  time.Sleep(220*time.Millisecond)
 }
 if last==nil {last=errors.New("no valid health response")}
 return fmt.Errorf("Bridge did not start within 11 seconds: %w",last)
}
func status(installed string)error{
 ids,err:=matchingProcessIDs(installed)
 if err!=nil{return err}
 info,err:=readHealth()
 if err!=nil{return fmt.Errorf("Bridge is not available: %w",err)}
 if info.Version!=expectedVersion{return fmt.Errorf("unexpected Bridge version: %s",info.Version)}
 if len(ids)==0{return errors.New("Bridge listener does not belong to this installed executable")}
 fmt.Println("AERTEX Bridge is running:",info.Version,"PID",ids[0])
 return nil
}
func main(){
 if len(os.Args)!=3 {
  fmt.Fprintln(os.Stderr,"usage: AERTEX-Bridge-Control.exe stop|start|status <installed-exe-path>")
  os.Exit(2)
 }
 path,err:=filepath.Abs(os.Args[2])
 if err!=nil{logEvent("invalid installation path",err);os.Exit(2)}
 switch strings.ToLower(os.Args[1]){
 case "stop":err=stop(path)
 case "start":err=start(path)
 case "status":err=status(path)
 default:err=errors.New("invalid setup action")
 }
 if err!=nil{
  logEvent(os.Args[1]+" failed",err)
  fmt.Fprintln(os.Stderr,err)
  os.Exit(1)
 }
 logEvent(os.Args[1]+" succeeded",nil)
}
