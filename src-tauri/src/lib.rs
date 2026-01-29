use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    LogicalPosition, LogicalSize, Manager,
};

fn fit_to_monitor(
    window: &tauri::WebviewWindow,
    tray_pos: Option<tauri::PhysicalPosition<f64>>,
    padding: f64,
) {
    let monitor = tray_pos
        .and_then(|pos| {
            window
                .available_monitors()
                .ok()
                .and_then(|monitors| {
                    monitors.into_iter().find(|m| {
                        let mp = m.position();
                        let ms = m.size();
                        let px = pos.x as i32;
                        let py = pos.y as i32;
                        px >= mp.x
                            && px < mp.x + ms.width as i32
                            && py >= mp.y
                            && py < mp.y + ms.height as i32
                    })
                })
        })
        .or_else(|| window.current_monitor().ok().flatten());

    if let Some(monitor) = monitor {
        let scale = monitor.scale_factor();
        let size = monitor.size();
        let pos = monitor.position();
        let w = (size.width as f64 / scale) - (padding * 2.0);
        let h = (size.height as f64 / scale) - (padding * 2.0);
        let x = (pos.x as f64 / scale) + padding;
        let y = (pos.y as f64 / scale) + padding;
        let _ = window.set_size(LogicalSize::new(w, h));
        let _ = window.set_position(LogicalPosition::new(x, y));
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                let handle = app.handle().clone();

                // Apply vibrancy effect on macOS
                #[cfg(target_os = "macos")]
                if let Some(window) = app.get_webview_window("main") {
                    use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};
                    let _ = apply_vibrancy(
                        &window,
                        NSVisualEffectMaterial::FullScreenUI,
                        Some(NSVisualEffectState::Active),
                        Some(12.0),
                    );
                    fit_to_monitor(&window, None, 75.0);
                }

                let tray_icon = match tauri::image::Image::from_bytes(
                    include_bytes!("../icons/tray-black.png"),
                ) {
                    Ok(icon) => icon,
                    Err(e) => {
                        eprintln!("[gitbar] failed to load tray icon: {e}");
                        return Ok(());
                    }
                };

                TrayIconBuilder::new()
                    .icon(tray_icon)
                    .icon_as_template(true)
                    .tooltip("Gitbar")
                    .on_tray_icon_event(move |tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            position,
                            ..
                        } = event
                        {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    fit_to_monitor(&window, Some(position), 75.0);
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                    })
                    .build(&handle)?;
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Focused(false) = event {
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
