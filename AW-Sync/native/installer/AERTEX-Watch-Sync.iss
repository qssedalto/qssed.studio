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
