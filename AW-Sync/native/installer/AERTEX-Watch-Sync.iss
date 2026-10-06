; 【初学者导读】
; 文件：AW-Sync/native/installer/AERTEX-Watch-Sync.iss
; Inno Setup 安装脚本：负责停止旧进程、清理旧目录/令牌、安装新文件、注册自启动和卸载项。
; 建议阅读链路：main.rs → runtime.rs → activitywatch.rs / sync.rs → state.rs / credentials.rs → ui.rs。
; 数据流：ActivityWatch 本地 REST API → Rust 结构体 → 去重/游标/批处理 → AERTEX Watch Data API → 本地状态更新。
; 错误处理：网络不可用、JSON 结构变化、重复事件和 ActivityWatch 未启动都应是可恢复错误，不能直接让后台线程崩溃。
; 安全原则：设备令牌只存 Windows Credential Manager；日志和 state.json 不应包含完整令牌。
; 修改后至少运行 cargo fmt --check、cargo clippy、cargo test，并通过 scripts/watch-cloud-check.mjs。
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
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "AERTEX Watch Sync"; ValueData: """{app}\{#MyAppExeName}"" --background"; Flags: uninsdeletevalue

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch AERTEX Watch Sync"; Flags: nowait postinstall skipifsilent

[UninstallRun]
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
