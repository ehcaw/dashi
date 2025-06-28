use std::process::Command;

#[cfg(target_os = "macos")]
#[tauri::command]
pub fn speak_text(text: &str) -> Result<(), String> {
    Command::new("say")
        .arg("-v")
        .arg("ava") // Default voice
        .arg(text)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub fn speak_text(text: &str) -> Result<(), String> {
    let script = format!(
        "Add-Type -AssemblyName System.Speech; \
         $synthesizer = New-Object -TypeName System.Speech.Synthesis.SpeechSynthesizer; \
         $synthesizer.Speak('{}');",
        text.replace("'", "''")
    );

    Command::new("powershell")
        .arg("-Command")
        .arg(script)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub fn speak_text(text: &str) -> Result<(), String> {
    // Try espeak if available
    Command::new("espeak")
        .arg(text)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
#[tauri::command]
pub fn speak_text(_text: &str) -> Result<(), String> {
    Err("Text-to-speech is not supported on this platform.".to_string())
}
