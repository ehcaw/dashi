mod audio;

use audio::transcribe;
use tauri::{Manager, PhysicalPosition};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_webview_window("main").unwrap();

      // Get primary monitor and its position
      let screens = window.available_monitors().unwrap();
      let primary = screens.first().unwrap();
      let screen_width = primary.size().width;
      let window_width = 400; // match tauri.conf.json

      // Use monitor's position for multi-monitor setups
      let monitor_x = primary.position().x;
      let monitor_y = primary.position().y;

      let x = monitor_x + (screen_width as i32 / 2) - (window_width as i32 / 2);
      let y = monitor_y + 20; // 20px from the top, adjust as needed for notch

      window.set_position(PhysicalPosition::new(x, y)).unwrap();
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![transcribe])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
