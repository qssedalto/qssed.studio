; Inno Setup 只做“每用户安装”：无需管理员权限，程序和自启项都属于当前 Windows 用户。
#define MyAppName "AERTEX Watch Sync"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "AERTEX"
#define MyAppURL "https://qsseda.com"
#define MyAppExeName "AERTEX-Watch-Sync.exe"

[Setup]
AppId={{E4C3348A-50CB-4F46-9DA2-573208072A0A}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
DefaultDirName={localappdata}\AERTEX\Watch Sync
DisableDirPage=yes
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
OutputDir=..\dist
OutputBaseFilename=AERTEX-Watch-Sync-Setup
SetupIconFile=..\assets\aertex-watch.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
CloseApplications=yes
RestartApplications=no
SetupLogging=yes
ChangesEnvironment=no

[Files]
Source: "..\target\x86_64-pc-windows-msvc\release\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\AERTEX Watch Sync"; Filename: "{app}\{#MyAppExeName}"

[Registry]
; 与 Rust autostart.rs 使用同一个 HKCU Run 值。安装完成即可后台启动，卸载时自动删除。
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "AERTEX Watch Sync"; ValueData: """{app}\{#MyAppExeName}"" --background"; Flags: uninsdeletevalue

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch AERTEX Watch Sync"; Flags: nowait postinstall skipifsilent

[UninstallRun]
; 卸载前先停止常驻托盘进程，再删除 Credential Manager 中的设备令牌，避免账号凭据残留。
Filename: "{sys}\taskkill.exe"; Parameters: "/F /IM {#MyAppExeName}"; Flags: runhidden; RunOnceId: "StopAERTEXWatchSync"
Filename: "{sys}\cmdkey.exe"; Parameters: "/delete:AERTEX/WatchSync/DeviceToken"; Flags: runhidden; RunOnceId: "DeleteAERTEXWatchToken"

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

[Code]
procedure StopExistingClient();
var
  ResultCode: Integer;
begin
  Exec(ExpandConstant('{sys}\taskkill.exe'), '/F /IM {#MyAppExeName}', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Sleep(500);
end;

procedure DeleteDeviceCredential();
var
  ResultCode: Integer;
begin
  Exec(ExpandConstant('{sys}\cmdkey.exe'), '/delete:AERTEX/WatchSync/DeviceToken', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

; 安装升级当前采用“干净替换”而不是保留旧目录：先停客户端、删除旧文件、删除旧 token。
; 因此 setup 页面会明确提示用户安装后重新生成设备令牌。
procedure ResetExistingInstall();
var
  TargetDir: String;
begin
  StopExistingClient();
  TargetDir := ExpandConstant('{localappdata}\AERTEX\Watch Sync');
  if DirExists(TargetDir) then
    DelTree(TargetDir, True, True, True);
  DeleteDeviceCredential();
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then
    ResetExistingInstall();
end;
