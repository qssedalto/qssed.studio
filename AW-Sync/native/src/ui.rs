use crate::autostart;
use crate::credentials;
use crate::logging;
use crate::model::{ACTIVITYWATCH_DOWNLOAD, APP_NAME, WATCH_ORIGIN};
use crate::runtime::{Runtime, RuntimeSnapshot, RuntimeStatus};
use crate::single_instance::{SHOW_MESSAGE, WINDOW_CLASS};
use std::io;
use std::path::PathBuf;
use std::sync::atomic::{AtomicIsize, Ordering};
use std::sync::{Arc, Mutex, OnceLock};
use windows_sys::Win32::Foundation::{HINSTANCE, HWND, LPARAM, LRESULT, POINT, WPARAM};
use windows_sys::Win32::Graphics::Gdi::{COLOR_WINDOW, DEFAULT_GUI_FONT, GetStockObject};
use windows_sys::Win32::System::LibraryLoader::GetModuleHandleW;
use windows_sys::Win32::UI::Controls::{BST_CHECKED, BST_UNCHECKED};
use windows_sys::Win32::UI::Shell::{
    NIF_ICON, NIF_INFO, NIF_MESSAGE, NIF_TIP, NIIF_ERROR, NIM_ADD, NIM_DELETE, NIM_MODIFY,
    NOTIFYICONDATAW, Shell_NotifyIconW, ShellExecuteW,
};
use windows_sys::Win32::UI::WindowsAndMessaging::*;

const WM_TRAY: u32 = WM_APP + 10;
const WM_RUNTIME_CHANGED: u32 = WM_APP + 11;
const TRAY_ID: u32 = 1;
const ID_STATUS: i32 = 101;
const ID_ENDPOINT: i32 = 102;
const ID_TOKEN: i32 = 103;
const ID_CONNECT: i32 = 104;
const ID_REDETECT: i32 = 105;
const ID_DOWNLOAD_AW: i32 = 106;
const ID_AUTOSTART: i32 = 107;
const ID_SYNC_NOW: usize = 201;
const ID_OPEN_WATCH: usize = 202;
const ID_SETTINGS: usize = 203;
const ID_TOGGLE_AUTOSTART: usize = 204;
const ID_EXIT: usize = 205;

static MAIN_HWND: AtomicIsize = AtomicIsize::new(0);
static APP: OnceLock<Arc<UiApp>> = OnceLock::new();

struct UiApp {
    runtime: Arc<Runtime>,
    executable: PathBuf,
    last_notification: Mutex<Option<RuntimeStatus>>,
}

pub fn runtime_callback() -> Arc<dyn Fn() + Send + Sync> {
    Arc::new(|| {
        let raw = MAIN_HWND.load(Ordering::Acquire);
        if raw != 0 {
            unsafe { PostMessageW(raw as HWND, WM_RUNTIME_CHANGED, 0, 0) };
        }
    })
}

pub fn run(runtime: Arc<Runtime>, executable: PathBuf, show_initially: bool) -> io::Result<()> {
    APP.set(Arc::new(UiApp {
        runtime: Arc::clone(&runtime),
        executable,
        last_notification: Mutex::new(None),
    }))
    .map_err(|_| io::Error::new(io::ErrorKind::AlreadyExists, "UI already initialized"))?;

    let instance = unsafe { GetModuleHandleW(std::ptr::null()) };
    if instance.is_null() {
        return Err(io::Error::last_os_error());
    }
    let class_name = wide(WINDOW_CLASS);
    let cursor = unsafe { LoadCursorW(std::ptr::null_mut(), IDC_ARROW) };
    let icon = unsafe { LoadIconW(std::ptr::null_mut(), IDI_APPLICATION) };
    let class = WNDCLASSW {
        style: CS_HREDRAW | CS_VREDRAW,
        lpfnWndProc: Some(window_proc),
        hInstance: instance,
        hIcon: icon,
        hCursor: cursor,
        hbrBackground: (COLOR_WINDOW + 1) as usize as _,
        lpszClassName: class_name.as_ptr(),
        ..unsafe { std::mem::zeroed() }
    };
    if unsafe { RegisterClassW(&class) } == 0 {
        let error = io::Error::last_os_error();
        if error.raw_os_error() != Some(1410) {
            return Err(error);
        }
    }

    let title = wide(APP_NAME);
    let hwnd = unsafe {
        CreateWindowExW(
            0,
            class_name.as_ptr(),
            title.as_ptr(),
            WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            560,
            360,
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            instance,
            std::ptr::null(),
        )
    };
    if hwnd.is_null() {
        return Err(io::Error::last_os_error());
    }
    MAIN_HWND.store(hwnd as isize, Ordering::Release);
    create_controls(hwnd, instance);
    add_tray_icon(hwnd, icon);
    update_window(hwnd);
    if show_initially {
        show_window(hwnd);
    }
    runtime.start();

    let mut message: MSG = unsafe { std::mem::zeroed() };
    while unsafe { GetMessageW(&mut message, std::ptr::null_mut(), 0, 0) } > 0 {
        unsafe {
            TranslateMessage(&message);
            DispatchMessageW(&message);
        }
    }
    Ok(())
}

unsafe extern "system" fn window_proc(
    hwnd: HWND,
    message: u32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    match message {
        WM_COMMAND => {
            let id = (wparam & 0xffff) as i32;
            handle_command(hwnd, id);
            0
        }
        WM_CLOSE => {
            unsafe { ShowWindow(hwnd, SW_HIDE) };
            0
        }
        WM_TRAY => {
            match lparam as u32 {
                WM_LBUTTONDBLCLK => show_window(hwnd),
                WM_RBUTTONUP | WM_CONTEXTMENU => show_tray_menu(hwnd),
                _ => {}
            }
            0
        }
        WM_RUNTIME_CHANGED => {
            update_window(hwnd);
            0
        }
        SHOW_MESSAGE => {
            show_window(hwnd);
            0
        }
        WM_DESTROY => {
            remove_tray_icon(hwnd);
            MAIN_HWND.store(0, Ordering::Release);
            unsafe { PostQuitMessage(0) };
            0
        }
        _ => unsafe { DefWindowProcW(hwnd, message, wparam, lparam) },
    }
}

fn create_controls(hwnd: HWND, instance: HINSTANCE) {
    create_control(
        hwnd,
        instance,
        "STATIC",
        "AERTEX Watch Sync",
        0,
        22,
        18,
        500,
        30,
        0,
    );
    create_control(
        hwnd,
        instance,
        "STATIC",
        "正在启动…",
        0,
        22,
        58,
        500,
        42,
        ID_STATUS,
    );
    create_control(
        hwnd,
        instance,
        "STATIC",
        "ActivityWatch：正在检测",
        0,
        22,
        102,
        500,
        22,
        ID_ENDPOINT,
    );
    create_control(
        hwnd,
        instance,
        "STATIC",
        "设备令牌（留空表示使用已安全保存的令牌）",
        0,
        22,
        140,
        500,
        20,
        0,
    );
    create_control(
        hwnd,
        instance,
        "EDIT",
        "",
        WS_BORDER | ES_PASSWORD as u32 | ES_AUTOHSCROLL as u32,
        22,
        164,
        500,
        28,
        ID_TOKEN,
    );
    create_control(
        hwnd,
        instance,
        "BUTTON",
        "连接 AERTEX Watch",
        BS_DEFPUSHBUTTON as u32,
        22,
        206,
        174,
        34,
        ID_CONNECT,
    );
    create_control(
        hwnd,
        instance,
        "BUTTON",
        "重新检测",
        BS_PUSHBUTTON as u32,
        206,
        206,
        120,
        34,
        ID_REDETECT,
    );
    create_control(
        hwnd,
        instance,
        "BUTTON",
        "下载 ActivityWatch",
        BS_PUSHBUTTON as u32,
        336,
        206,
        186,
        34,
        ID_DOWNLOAD_AW,
    );
    let checkbox = create_control(
        hwnd,
        instance,
        "BUTTON",
        "启动 Windows 时自动运行",
        BS_AUTOCHECKBOX as u32,
        22,
        258,
        300,
        24,
        ID_AUTOSTART,
    );
    let autostart_checked =
        autostart::is_enabled() || credentials::load_token().ok().flatten().is_none();
    unsafe {
        SendMessageW(
            checkbox,
            BM_SETCHECK,
            if autostart_checked {
                BST_CHECKED as usize
            } else {
                BST_UNCHECKED as usize
            },
            0,
        )
    };
}

#[allow(clippy::too_many_arguments)]
fn create_control(
    parent: HWND,
    instance: HINSTANCE,
    class: &str,
    text: &str,
    style: u32,
    x: i32,
    y: i32,
    width: i32,
    height: i32,
    id: i32,
) -> HWND {
    let class = wide(class);
    let text = wide(text);
    let control = unsafe {
        CreateWindowExW(
            0,
            class.as_ptr(),
            text.as_ptr(),
            WS_CHILD | WS_VISIBLE | style,
            x,
            y,
            width,
            height,
            parent,
            id as isize as _,
            instance,
            std::ptr::null(),
        )
    };
    let font = unsafe { GetStockObject(DEFAULT_GUI_FONT) };
    unsafe { SendMessageW(control, WM_SETFONT, font as usize, 1) };
    control
}

fn handle_command(hwnd: HWND, id: i32) {
    let Some(app) = APP.get() else { return };
    match id {
        ID_CONNECT => {
            let token = control_text(unsafe { GetDlgItem(hwnd, ID_TOKEN) })
                .trim()
                .to_string();
            let has_stored = credentials::load_token().ok().flatten().is_some();
            if token.is_empty() && !has_stored {
                message_box(
                    hwnd,
                    "请粘贴从 AERTEX Watch 生成的设备令牌。",
                    "需要设备令牌",
                    MB_ICONWARNING,
                );
                return;
            }
            if !token.is_empty() {
                if !token.starts_with("awd1.") || token.len() < 24 || token.len() > 200 {
                    message_box(
                        hwnd,
                        "设备令牌格式不正确。请重新复制完整令牌。",
                        "令牌无效",
                        MB_ICONWARNING,
                    );
                    return;
                }
                if let Err(error) = credentials::save_token(&token) {
                    logging::error(format!("Unable to save device token: {error}"));
                    message_box(
                        hwnd,
                        "无法将令牌保存到 Windows 凭据管理器。",
                        "保存失败",
                        MB_ICONERROR,
                    );
                    return;
                }
                set_control_text(unsafe { GetDlgItem(hwnd, ID_TOKEN) }, "");
            }
            let enabled = checkbox_checked(unsafe { GetDlgItem(hwnd, ID_AUTOSTART) });
            if let Err(error) = autostart::set_enabled(&app.executable, enabled) {
                logging::error(format!("Unable to update autostart: {error}"));
                message_box(
                    hwnd,
                    "设备令牌已保存，但无法更新开机自启动设置。",
                    "自启动设置失败",
                    MB_ICONWARNING,
                );
            }
            app.runtime.request_sync();
        }
        ID_REDETECT => app.runtime.request_redetect(),
        ID_DOWNLOAD_AW => open_url(ACTIVITYWATCH_DOWNLOAD),
        _ => {}
    }
}

fn update_window(hwnd: HWND) {
    let Some(app) = APP.get() else { return };
    let snapshot = app.runtime.snapshot();
    set_control_text(unsafe { GetDlgItem(hwnd, ID_STATUS) }, &snapshot.detail);
    let endpoint = snapshot
        .endpoint
        .as_ref()
        .map(|value| format!("ActivityWatch：127.0.0.1:{}", value.port))
        .unwrap_or_else(|| "ActivityWatch：尚未找到".to_string());
    set_control_text(unsafe { GetDlgItem(hwnd, ID_ENDPOINT) }, &endpoint);
    update_tray_tooltip(hwnd, &tray_status(&snapshot));

    if matches!(snapshot.status, RuntimeStatus::AuthenticationError) {
        show_important_notification(
            hwnd,
            &snapshot.status,
            "AERTEX Watch Sync",
            "设备令牌无效或已失效，请打开设置更换令牌。",
            NIIF_ERROR,
        );
    }
}

fn tray_status(snapshot: &RuntimeSnapshot) -> String {
    match snapshot.status {
        RuntimeStatus::Normal => "AERTEX Watch Sync · 正常".to_string(),
        RuntimeStatus::AuthenticationError => "AERTEX Watch Sync · 认证错误".to_string(),
        RuntimeStatus::NetworkError => "AERTEX Watch Sync · 网络错误".to_string(),
        RuntimeStatus::WaitingForActivityWatch | RuntimeStatus::OtherServiceOnDefaultPort => {
            "AERTEX Watch Sync · 等待 ActivityWatch".to_string()
        }
        _ => "AERTEX Watch Sync · 正在工作".to_string(),
    }
}

fn show_tray_menu(hwnd: HWND) {
    let Some(app) = APP.get() else { return };
    let snapshot = app.runtime.snapshot();
    let menu = unsafe { CreatePopupMenu() };
    if menu.is_null() {
        return;
    }
    append_menu(
        menu,
        MF_STRING | MF_GRAYED,
        0,
        &format!("同步状态：{}", status_label(&snapshot.status)),
    );
    append_menu(
        menu,
        MF_STRING | MF_GRAYED,
        0,
        &format!(
            "上次同步：{}",
            snapshot.last_sync.as_deref().unwrap_or("尚未同步")
        ),
    );
    unsafe { AppendMenuW(menu, MF_SEPARATOR, 0, std::ptr::null()) };
    append_menu(menu, MF_STRING, ID_SYNC_NOW, "立即同步");
    append_menu(menu, MF_STRING, ID_OPEN_WATCH, "打开 AERTEX Watch");
    append_menu(menu, MF_STRING, ID_SETTINGS, "设置 / 更换设备令牌");
    append_menu(
        menu,
        MF_STRING
            | if autostart::is_enabled() {
                MF_CHECKED
            } else {
                0
            },
        ID_TOGGLE_AUTOSTART,
        "开机自动启动",
    );
    unsafe { AppendMenuW(menu, MF_SEPARATOR, 0, std::ptr::null()) };
    append_menu(menu, MF_STRING, ID_EXIT, "退出");

    let mut point = POINT { x: 0, y: 0 };
    unsafe {
        GetCursorPos(&mut point);
        SetForegroundWindow(hwnd);
    }
    let command = unsafe {
        TrackPopupMenu(
            menu,
            TPM_RIGHTBUTTON | TPM_RETURNCMD,
            point.x,
            point.y,
            0,
            hwnd,
            std::ptr::null(),
        )
    } as usize;
    unsafe { DestroyMenu(menu) };
    match command {
        ID_SYNC_NOW => app.runtime.request_sync(),
        ID_OPEN_WATCH => open_url(WATCH_ORIGIN),
        ID_SETTINGS => show_window(hwnd),
        ID_TOGGLE_AUTOSTART => {
            let enabled = !autostart::is_enabled();
            if autostart::set_enabled(&app.executable, enabled).is_ok() {
                unsafe {
                    SendMessageW(
                        GetDlgItem(hwnd, ID_AUTOSTART),
                        BM_SETCHECK,
                        if enabled {
                            BST_CHECKED as usize
                        } else {
                            BST_UNCHECKED as usize
                        },
                        0,
                    )
                };
            }
        }
        ID_EXIT => {
            app.runtime.shutdown();
            unsafe { DestroyWindow(hwnd) };
        }
        _ => {}
    }
}

fn status_label(status: &RuntimeStatus) -> &'static str {
    match status {
        RuntimeStatus::Normal => "正常",
        RuntimeStatus::AuthenticationError => "认证错误",
        RuntimeStatus::NetworkError => "网络错误",
        RuntimeStatus::WaitingForActivityWatch | RuntimeStatus::OtherServiceOnDefaultPort => {
            "等待 ActivityWatch"
        }
        RuntimeStatus::NeedsToken => "等待设备令牌",
        RuntimeStatus::Syncing => "同步中",
        RuntimeStatus::Detecting => "正在检测",
        _ => "正在启动",
    }
}

fn add_tray_icon(hwnd: HWND, icon: HICON) {
    let mut data: NOTIFYICONDATAW = unsafe { std::mem::zeroed() };
    data.cbSize = std::mem::size_of::<NOTIFYICONDATAW>() as u32;
    data.hWnd = hwnd;
    data.uID = TRAY_ID;
    data.uFlags = NIF_MESSAGE | NIF_ICON | NIF_TIP;
    data.uCallbackMessage = WM_TRAY;
    data.hIcon = icon;
    copy_wide_fixed(&mut data.szTip, APP_NAME);
    unsafe { Shell_NotifyIconW(NIM_ADD, &data) };
}

fn update_tray_tooltip(hwnd: HWND, tooltip: &str) {
    let mut data: NOTIFYICONDATAW = unsafe { std::mem::zeroed() };
    data.cbSize = std::mem::size_of::<NOTIFYICONDATAW>() as u32;
    data.hWnd = hwnd;
    data.uID = TRAY_ID;
    data.uFlags = NIF_TIP;
    copy_wide_fixed(&mut data.szTip, tooltip);
    unsafe { Shell_NotifyIconW(NIM_MODIFY, &data) };
}

fn show_important_notification(
    hwnd: HWND,
    status: &RuntimeStatus,
    title: &str,
    body: &str,
    flags: u32,
) {
    let Some(app) = APP.get() else { return };
    let Ok(mut previous) = app.last_notification.lock() else {
        return;
    };
    if previous.as_ref() == Some(status) {
        return;
    }
    *previous = Some(status.clone());
    let mut data: NOTIFYICONDATAW = unsafe { std::mem::zeroed() };
    data.cbSize = std::mem::size_of::<NOTIFYICONDATAW>() as u32;
    data.hWnd = hwnd;
    data.uID = TRAY_ID;
    data.uFlags = NIF_INFO;
    data.dwInfoFlags = flags;
    copy_wide_fixed(&mut data.szInfoTitle, title);
    copy_wide_fixed(&mut data.szInfo, body);
    unsafe { Shell_NotifyIconW(NIM_MODIFY, &data) };
}

fn remove_tray_icon(hwnd: HWND) {
    let mut data: NOTIFYICONDATAW = unsafe { std::mem::zeroed() };
    data.cbSize = std::mem::size_of::<NOTIFYICONDATAW>() as u32;
    data.hWnd = hwnd;
    data.uID = TRAY_ID;
    unsafe { Shell_NotifyIconW(NIM_DELETE, &data) };
}

fn append_menu(menu: HMENU, flags: u32, id: usize, label: &str) {
    let label = wide(label);
    unsafe { AppendMenuW(menu, flags, id, label.as_ptr()) };
}

fn show_window(hwnd: HWND) {
    unsafe {
        ShowWindow(hwnd, SW_RESTORE);
        SetForegroundWindow(hwnd);
    }
}

fn open_url(url: &str) {
    let operation = wide("open");
    let url = wide(url);
    unsafe {
        ShellExecuteW(
            std::ptr::null_mut(),
            operation.as_ptr(),
            url.as_ptr(),
            std::ptr::null(),
            std::ptr::null(),
            SW_SHOWNORMAL,
        );
    }
}

fn checkbox_checked(hwnd: HWND) -> bool {
    unsafe { SendMessageW(hwnd, BM_GETCHECK, 0, 0) as u32 == BST_CHECKED }
}

fn control_text(hwnd: HWND) -> String {
    let length = unsafe { GetWindowTextLengthW(hwnd) };
    let mut buffer = vec![0_u16; length as usize + 1];
    unsafe { GetWindowTextW(hwnd, buffer.as_mut_ptr(), buffer.len() as i32) };
    String::from_utf16_lossy(&buffer[..length as usize])
}

fn set_control_text(hwnd: HWND, value: &str) {
    let value = wide(value);
    unsafe { SetWindowTextW(hwnd, value.as_ptr()) };
}

fn message_box(hwnd: HWND, text: &str, title: &str, flags: u32) {
    let text = wide(text);
    let title = wide(title);
    unsafe { MessageBoxW(hwnd, text.as_ptr(), title.as_ptr(), MB_OK | flags) };
}

fn copy_wide_fixed<const N: usize>(destination: &mut [u16; N], value: &str) {
    let encoded = value
        .encode_utf16()
        .take(N.saturating_sub(1))
        .collect::<Vec<_>>();
    destination[..encoded.len()].copy_from_slice(&encoded);
    destination[encoded.len()] = 0;
}

fn wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(Some(0)).collect()
}
