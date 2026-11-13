//go:build windows

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

const installedSubfolder = "QssedA"
const readinessTimeout = 9 * time.Second

type nativeHealth struct {
  Service string `json:"service"`
  Protocol int `json:"protocol"`
  Version string `json:"version"`
  Runtime string `json:"runtime"`
  PID int `json:"pid"`
}

func installedBridgePath() (string,error) {
  local := strings.TrimSpace(os.Getenv("LOCALAPPDATA"))
  if local == "" { return "", errors.New("LOCALAPPDATA is not configured") }
  return filepath.Join(local, installedSubfolder, "LocalBridge", exeName),nil
}

func logBridgeEvent(kind string,err error) {
  path,problem:=installedBridgePath()
  if problem!=nil {return}
  dir:=filepath.Dir(path)
  if os.MkdirAll(dir,0700)!=nil {return}
  logPath:=filepath.Join(dir,"bridge.log")
  if info,problem:=os.Stat(logPath);problem==nil&&info.Size()>512*1024 {
    _=os.Rename(logPath,logPath+".previous")
  }
  file,problem:=os.OpenFile(logPath,os.O_WRONLY|os.O_APPEND|os.O_CREATE,0600)
  if problem!=nil{return}
  defer file.Close()
  reason:=""
  if err!=nil {reason=" | "+strings.ReplaceAll(strings.ReplaceAll(err.Error(),""," "),"
"," ")}
  _,_=fmt.Fprintf(file,"%s | %s | pid=%d | version=%s%s
",time.Now().Format(time.RFC3339),kind,os.Getpid(),version,reason)
}

func probeNativeHealth() (nativeHealth,error) {
  client:=&http.Client{Timeout:700*time.Millisecond}
  resp,err:=client.Get("http://127.0.0.1:"+bridgePort+"/health")
  if err!=nil{return nativeHealth{},err}
  defer resp.Body.Close()
  if resp.StatusCode!=http.StatusOK {return nativeHealth{},fmt.Errorf("health status HTTP %d",resp.StatusCode)}
  var health nativeHealth
  if err:=json.NewDecoder(io.LimitReader(resp.Body,4*1024)).Decode(&health);err!=nil {return nativeHealth{},err}
  if health.Service!=bridgeService||health.Protocol!=protocol||health.Runtime!="native-windows" {
    return nativeHealth{},errors.New("localhost port belongs to an unexpected service")
  }
  return health,nil
}

func portIsOccupied() bool {
  conn,err:=net.DialTimeout("tcp",net.JoinHostPort(bridgeHost,bridgePort),300*time.Millisecond)
  if err!=nil{return false}
  _=conn.Close()
  return true
}

func preflightUpgrade() error {
  current,err:=os.Executable()
  if err!=nil{return fmt.Errorf("locate downloaded executable: %w",err)}
  installed,err:=installedBridgePath()
  if err!=nil{return err}
  // A manual launch of the installed executable is a status/restart operation,
  // not a reason to kill an otherwise healthy bridge.
  if samePath(current,installed) {return nil}
  health,err:=probeNativeHealth()
  if err==nil {
    if err:=stopVerifiedBridgeForUpgrade();err!=nil {
      return fmt.Errorf("existing Bridge could not be stopped safely: %w",err)
    }
    return nil
  }
  if portIsOccupied() {
    return fmt.Errorf("127.0.0.1:%s is already in use by a different or unresponsive service; existing process was not changed",bridgePort)
  }
  return nil
}

func launchBackground(executable string) error {
  health,err:=probeNativeHealth()
  if err==nil {
    if health.Version==version{return nil}
    return fmt.Errorf("a different Bridge version %q is still active; cannot claim that the new service has started",health.Version)
  }
  if portIsOccupied() {
    return fmt.Errorf("127.0.0.1:%s is occupied: %w",bridgePort,err)
  }
  command:=exec.Command(executable,"--background")
  hideWindow(command)
  if err:=command.Start();err!=nil{return fmt.Errorf("start background Bridge: %w",err)}
  // Release the OS process handle; this is a real detached Win32 background
  // process, not a temporary child whose lifetime is tied to the installer.
  return command.Process.Release()
}

func waitUntilReady() (nativeHealth,error) {
  deadline:=time.Now().Add(readinessTimeout)
  var last error
  for time.Now().Before(deadline) {
    health,err:=probeNativeHealth()
    if err==nil {
      if health.Version==version&&health.PID>0{return health,nil}
      last=fmt.Errorf("unexpected running version %q or missing process identifier",health.Version)
    } else {last=err}
    time.Sleep(170*time.Millisecond)
  }
  if last==nil {last=errors.New("unknown startup failure")}
  return nativeHealth{},fmt.Errorf("Bridge did not become ready within %s: %w; see %%LOCALAPPDATA%%\QssedA\LocalBridge\bridge.log",readinessTimeout,last)
}

func installAndVerify() (nativeHealth,error) {
  if err:=preflightUpgrade();err!=nil{return nativeHealth{},err}
  installed,err:=installSelf()
  if err!=nil{return nativeHealth{},err}
  if err:=launchBackground(installed);err!=nil{return nativeHealth{},err}
  health,err:=waitUntilReady()
  if err!=nil{return nativeHealth{},err}
  logBridgeEvent("install verified, HKCU Run configured, health ready",nil)
  return health,nil
}

func bridgeStatusText() string {
  installed,err:=installedBridgePath()
  if err!=nil{return "无法确定安装目录: "+err.Error()}
  logPath:=filepath.Join(filepath.Dir(installed),"bridge.log")
  message:="程序: "+installed+"
日志: "+logPath
  if _,err:=os.Stat(installed);err!=nil {message+="

已安装文件: 未找到"}else{message+="

已安装文件: 存在"}
  health,err:=probeNativeHealth()
  if err==nil {message+="
运行状态: 正在运行
版本: "+health.Version+"
PID: "+strconv.Itoa(health.PID)}
  if err!=nil {message+="
运行状态: 未确认在运行
详情: "+err.Error()}
  if portIsOccupied()&&err!=nil {message+="
注意: 32145 端口已被占用"}
  return message+"

请在任务管理器的「详细信息」页查找 AERTEX-Bridge.exe。
Windows 启动应用显示已启用，并不代表程序目前正在运行。"
}

// Windows MoveFileEx replaces the previous released executable atomically.
// Never delete the working installation first: a failed update must not leave
// a missing binary while an existing HKCU Run entry still points to it.
func replaceInstalledExecutable(source,destination string) error {
  from,err:=syscall.UTF16PtrFromString(source)
  if err!=nil{return err}
  to,err:=syscall.UTF16PtrFromString(destination)
  if err!=nil{return err}
  kernel:=syscall.NewLazyDLL("kernel32.dll")
  proc:=kernel.NewProc("MoveFileExW")
  const moveFileReplaceExisting=0x1
  const moveFileWriteThrough=0x8
  ok,_,callErr:=proc.Call(uintptr(unsafe.Pointer(from)),uintptr(unsafe.Pointer(to)),moveFileReplaceExisting|moveFileWriteThrough)
  if ok!=0{return nil}
  if callErr!=nil&&callErr!=syscall.Errno(0){return callErr}
  return errors.New("MoveFileExW failed")
}

func processImagePath(pid int) (string,error) {
  if pid<=0{return "",errors.New("invalid process id")}
  kernel:=syscall.NewLazyDLL("kernel32.dll")
  open:=kernel.NewProc("OpenProcess")
  query:=kernel.NewProc("QueryFullProcessImageNameW")
  const processQueryLimitedInformation=0x1000
  handle,_,openErr:=open.Call(processQueryLimitedInformation,0,uintptr(pid))
  if handle==0 {
    return "",fmt.Errorf("OpenProcess(%d): %w",pid,openErr)
  }
  defer syscall.CloseHandle(syscall.Handle(handle))
  buf:=make([]uint16,32768)
  length:=uint32(len(buf))
  ok,_,queryErr:=query.Call(handle,0,uintptr(unsafe.Pointer(&buf[0])),uintptr(unsafe.Pointer(&length)))
  if ok==0 {return "",fmt.Errorf("QueryFullProcessImageNameW: %w",queryErr)}
  if length==0||length>uint32(len(buf)){return "",errors.New("invalid process image path length")}
  return syscall.UTF16ToString(buf[:length]),nil
}
