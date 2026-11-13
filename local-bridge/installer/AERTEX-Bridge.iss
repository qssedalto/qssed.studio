; AERTEX Bridge Windows installation package.
; Bundles the original 0.3.0-d5e4cfd engine as an installed application.
; The download is ALWAYS a Setup executable, never a portable daemon.

#define AppVersion "0.5.0"
#define AppName "AERTEX Bridge"

[Setup]
AppId={{7C94DB1B-A00F-4D71-9AC6-B5FD2F9C630B}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher=AERTEX
AppPublisherURL=https://qsseda.com
AppSupportURL=https://work.qsseda.com
DefaultDirName={localappdata}\QssedA\LocalBridge
DefaultGroupName=AERTEX
DisableDirPage=yes
DisableProgramGroupPage=yes
UsePreviousAppDir=no
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
MinVersion=10.0
PrivilegesRequired=lowest
WizardStyle=modern
Compression=lzma2
SolidCompression=yes
CloseApplications=force
RestartApplications=no
ChangesEnvironment=no
CreateUninstallRegKey=yes
UninstallDisplayName=AERTEX Bridge
UninstallDisplayIcon={app}\AERTEX-Bridge.exe
OutputDir=..\dist
OutputBaseFilename=AERTEX-Bridge-Setup
SetupLogging=yes

[Files]
; Genuine original-source engine: main_windows.go + upgrade_windows.go from
; commit d5e4cfd, built with the exact version seen in the user's ZIP.
Source: "..\dist\AERTEX-Bridge.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\dist\AERTEX-Bridge-Control.exe"; DestDir: "{app}"; Flags: ignoreversion
; Also extract the controller before Files installation so we can safely
; stop a previous installed daemon before replacing its executable.
Source: "..\dist\AERTEX-Bridge-Control.exe"; DestDir: "{tmp}"; Flags: dontcopy

[Registry]
; Required for every install. The native engine starts at each Windows user
; sign-in even after this installer has been deleted from Downloads.
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "AERTEX Bridge"; ValueData: """{app}\AERTEX-Bridge.exe"" --background"; Flags: uninsdeletevalue

[Icons]
Name: "{group}\卸载 AERTEX Bridge"; Filename: "{uninstallexe}"

[UninstallRun]
; Stop only the exact installed binary, not unrelated programs on port 32145.
Filename: "{app}\AERTEX-Bridge-Control.exe"; Parameters: "stop ""{app}\AERTEX-Bridge.exe"""; Flags: runhidden waituntilterminated

[Code]
function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  Status: Integer;
  Helper: String;
  Engine: String;
begin
  Result := '';
  ExtractTemporaryFile('AERTEX-Bridge-Control.exe');
  Helper := ExpandConstant('{tmp}\AERTEX-Bridge-Control.exe');
  Engine := ExpandConstant('{app}\AERTEX-Bridge.exe');
  if not Exec(Helper, 'stop "' + Engine + '"', '', SW_HIDE, ewWaitUntilTerminated, Status) then
    Result := 'Unable to check the previous AERTEX Bridge process.'
  else if Status <> 0 then
    Result := 'Unable to safely stop the previously installed AERTEX Bridge. ' +
      'Check %LOCALAPPDATA%\QssedA\LocalBridge\install.log. ' +
      'The existing installation has been left unchanged.';
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  Status: Integer;
  Helper: String;
  Engine: String;
begin
  if CurStep = ssPostInstall then
  begin
    Helper := ExpandConstant('{app}\AERTEX-Bridge-Control.exe');
    Engine := ExpandConstant('{app}\AERTEX-Bridge.exe');

    // Remove the outdated uninstall record created by the old portable/self-installing EXE.
    RegDeleteKeyIncludingSubkeys(HKCU,
      'Software\Microsoft\Windows\CurrentVersion\Uninstall\QssedALocalBridge');

    if not Exec(Helper, 'start "' + Engine + '"', '', SW_HIDE,
      ewWaitUntilTerminated, Status) then
      RaiseException('Could not launch the installed AERTEX Bridge.')
    else if Status <> 0 then
      RaiseException('AERTEX Bridge could not be verified after installation. ' +
        'See %LOCALAPPDATA%\QssedA\LocalBridge\install.log. ' +
        'Port 32145 may be occupied by another application.');
  end;
end;
